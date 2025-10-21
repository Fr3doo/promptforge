import { useState } from "react";
import { errorToast, loadingToast, successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import type { AnalysisResult } from "@/repositories/AnalysisRepository";
import { captureException } from "@/lib/logger";

/**
 * Hook for analyzing prompts using the injected AnalysisRepository
 * Follows SOLID DIP by depending on abstraction instead of concrete implementation
 */
export function usePromptAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRepository = useAnalysisRepository();

  const analyze = async (promptContent: string) => {
    if (!promptContent.trim()) {
      errorToast(messages.labels.error, messages.errors.validation.emptyPrompt);
      return;
    }

    setIsAnalyzing(true);
    loadingToast(messages.loading.analyzing);

    try {
      const data = await analysisRepository.analyzePrompt(promptContent);
      setResult(data);
      successToast(messages.success.analysisComplete);
    } catch (error: any) {
      captureException(error, 'Erreur lors de l\'analyse du prompt', {
        promptContentLength: promptContent.length,
      });
      errorToast(messages.labels.error, error.message || messages.errors.analysis.failed);
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => setResult(null);

  return { result, isAnalyzing, analyze, reset };
}
