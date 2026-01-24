import { useState, useEffect, useRef } from "react";
import { useAnalysisMessages } from "@/features/prompts/hooks/useAnalysisMessages";
import { useAnalysisRepository } from "@/contexts/AnalysisRepositoryContext";
import { useAnalysisProgress } from "./useAnalysisProgress";
import { useInvalidateAnalysisQuota } from "./useAnalysisQuota";
import { useInvalidateAnalysisHistory } from "./useAnalysisHistory";
import type { AnalysisResult } from "@/repositories/AnalysisRepository";
import { AnalysisTimeoutError, RateLimitError } from "@/repositories/AnalysisRepository";
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
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(0);
  const [rateLimitReason, setRateLimitReason] = useState<'minute' | 'daily'>('minute');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRepository = useAnalysisRepository();
  const analysisMessages = useAnalysisMessages();
  const progress = useAnalysisProgress();
  const invalidateQuota = useInvalidateAnalysisQuota();
  const invalidateHistory = useInvalidateAnalysisHistory();

  // Countdown automatique pour rate limiting
  useEffect(() => {
    if (!isRateLimited || rateLimitRetryAfter <= 0) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    countdownRef.current = setInterval(() => {
      setRateLimitRetryAfter((prev) => {
        if (prev <= 1) {
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [isRateLimited, rateLimitRetryAfter > 0]);

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
    } catch (error: any) {
      const isTimeoutError = error instanceof AnalysisTimeoutError;
      const isRateLimitError = error instanceof RateLimitError;
      
      setIsTimeout(isTimeoutError);
      
      if (isRateLimitError) {
        setIsRateLimited(true);
        setRateLimitRetryAfter(error.retryAfter);
        setRateLimitReason(error.reason);
        analysisMessages.showRateLimitError(error.reason, error.retryAfter);
        // Invalider le cache des quotas après un rate limit
        invalidateQuota();
      } else {
        captureException(error, 'Erreur lors de l\'analyse du prompt', {
          promptContentLength: promptContent.length,
          isTimeout: isTimeoutError,
        });
        
        if (isTimeoutError) {
          analysisMessages.showTimeoutError();
        } else {
          analysisMessages.showAnalysisFailed(error.message);
        }
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
    setRateLimitRetryAfter(0);
  };

  return { 
    result, 
    isAnalyzing, 
    isTimeout, 
    isRateLimited,
    rateLimitRetryAfter,
    rateLimitReason,
    analyze, 
    reset,
    progressMessage: progress.getProgressMessage(),
    elapsedSeconds: progress.elapsedSeconds,
  };
}
