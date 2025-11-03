import { useState } from "react";
import { errorToast, loadingToast, successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import type { AnalysisResult } from "@/repositories/AnalysisRepository";
import { AnalysisTimeoutError } from "@/repositories/AnalysisRepository";
import { captureException } from "@/lib/logger";
import { TIMING } from "@/constants/application-config";

/**
 * Hook for analyzing prompts using the injected AnalysisRepository
 * Follows SOLID DIP by depending on abstraction instead of concrete implementation
 */
export function usePromptAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const analysisRepository = useAnalysisRepository();

  const analyze = async (promptContent: string) => {
    if (!promptContent.trim()) {
      errorToast(messages.labels.error, messages.errors.validation.emptyPrompt);
      return;
    }

    setIsAnalyzing(true);
    setIsTimeout(false);
    loadingToast(messages.loading.analyzing);

    try {
      const data = await analysisRepository.analyzePrompt(promptContent);
      setResult(data);
      successToast(messages.success.analysisComplete);
    } catch (error: any) {
      // Différencier timeout vs autres erreurs
      const isTimeoutError = error instanceof AnalysisTimeoutError;
      setIsTimeout(isTimeoutError);
      
      captureException(error, 'Erreur lors de l\'analyse du prompt', {
        promptContentLength: promptContent.length,
        isTimeout: isTimeoutError,
      });
      
      // Extract specific error message from edge function response
      const errorMessage = error.message || messages.errors.analysis.failed;
      
      // Toast plus long pour les timeouts (5s au lieu de 3s)
      errorToast(
        messages.labels.error, 
        errorMessage,
        isTimeoutError ? TIMING.TOAST_DURATION + 2000 : undefined
      );
      
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
