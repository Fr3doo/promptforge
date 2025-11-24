import { useState } from "react";
import { useAnalysisMessages } from "@/features/prompts/hooks/useAnalysisMessages";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import type { AnalysisResult } from "@/repositories/AnalysisRepository";
import { AnalysisTimeoutError } from "@/repositories/AnalysisRepository";
import { captureException } from "@/lib/logger";
import { VALIDATION } from "@/constants/application-config";
import { toast } from "sonner";

/**
 * Hook for analyzing prompts using the injected AnalysisRepository
 * Follows SOLID DIP by depending on abstraction instead of concrete implementation
 */
export function usePromptAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const analysisRepository = useAnalysisRepository();
  const analysisMessages = useAnalysisMessages();

  const analyze = async (promptContent: string) => {
    if (!promptContent.trim()) {
      analysisMessages.showEmptyPromptError();
      return;
    }

    const contentLength = promptContent.length;

    // Limite dure : blocage
    if (contentLength > VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT) {
      toast.error("Prompt trop long", {
        description: `Le prompt ne peut pas dépasser ${VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT.toLocaleString()} caractères. Longueur actuelle : ${contentLength.toLocaleString()} caractères.`,
      });
      return;
    }

    // Limite douce : avertissement
    if (contentLength > VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT) {
      toast.warning("Prompt très long", {
        description: `Votre prompt fait ${contentLength.toLocaleString()} caractères. L'analyse peut prendre jusqu'à 60 secondes.`,
      });
    }

    setIsAnalyzing(true);
    setIsTimeout(false);
    analysisMessages.showAnalyzing();

    try {
      const data = await analysisRepository.analyzePrompt(promptContent);
      setResult(data);
      analysisMessages.showAnalysisComplete();
    } catch (error: any) {
      const isTimeoutError = error instanceof AnalysisTimeoutError;
      setIsTimeout(isTimeoutError);
      
      captureException(error, 'Erreur lors de l\'analyse du prompt', {
        promptContentLength: promptContent.length,
        isTimeout: isTimeoutError,
      });
      
      if (isTimeoutError) {
        analysisMessages.showTimeoutError();
      } else {
        analysisMessages.showAnalysisFailed(error.message);
      }
      
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setIsTimeout(false);
  };

  return { result, isAnalyzing, isTimeout, analyze, reset };
}
