import { useState } from "react";
import { useAnalysisMessages } from "@/features/prompts/hooks/useAnalysisMessages";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import { useAnalysisProgress } from "./useAnalysisProgress";
import { useInvalidateAnalysisQuota } from "./useAnalysisQuota";
import { useInvalidateAnalysisHistory } from "./useAnalysisHistory";
import { useCountdown } from "./useCountdown";
import type { AnalysisResult } from "@/repositories/AnalysisRepository";
import { classifyAnalysisError } from "@/lib/analysis/AnalysisErrorClassifier";
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
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitReason, setRateLimitReason] = useState<'minute' | 'daily'>('minute');
  
  const countdown = useCountdown({
    onComplete: () => setIsRateLimited(false)
  });
  
  const analysisRepository = useAnalysisRepository();
  const analysisMessages = useAnalysisMessages();
  const progress = useAnalysisProgress();
  const invalidateQuota = useInvalidateAnalysisQuota();
  const invalidateHistory = useInvalidateAnalysisHistory();

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
    progress.start();
    analysisMessages.showAnalyzing();

    try {
      const data = await analysisRepository.analyzePrompt(promptContent);
      setResult(data);
      analysisMessages.showAnalysisComplete();
      // Invalider les caches des quotas et historique après une analyse réussie
      invalidateQuota();
      invalidateHistory();
    } catch (error: unknown) {
      // Classification de l'erreur via module dédié (SRP)
      const classified = classifyAnalysisError(error);
      
      setIsTimeout(classified.type === "TIMEOUT");
      
      switch (classified.type) {
        case "RATE_LIMIT":
          setIsRateLimited(true);
          countdown.start(classified.retryAfter ?? 60);
          setRateLimitReason(classified.reason ?? "minute");
          analysisMessages.showRateLimitError(
            classified.reason ?? "minute",
            classified.retryAfter ?? 60
          );
          // Invalider le cache des quotas après un rate limit
          invalidateQuota();
          break;
          
        case "TIMEOUT":
          captureException(error, "Erreur lors de l'analyse du prompt", {
            promptContentLength: promptContent.length,
            isTimeout: true,
          });
          analysisMessages.showTimeoutError();
          break;
          
        case "GENERIC":
          captureException(error, "Erreur lors de l'analyse du prompt", {
            promptContentLength: promptContent.length,
            isTimeout: false,
          });
          analysisMessages.showAnalysisFailed(classified.message ?? "Erreur inconnue");
          break;
      }
      
      setResult(null);
    } finally {
      setIsAnalyzing(false);
      progress.stop();
    }
  };

  const reset = () => {
    setResult(null);
    setIsTimeout(false);
    setIsRateLimited(false);
    countdown.reset();
  };

  return { 
    result, 
    isAnalyzing, 
    isTimeout, 
    isRateLimited,
    rateLimitRetryAfter: countdown.remaining,
    rateLimitReason,
    analyze, 
    reset,
    progressMessage: progress.getProgressMessage(),
    elapsedSeconds: progress.elapsedSeconds,
  };
}
