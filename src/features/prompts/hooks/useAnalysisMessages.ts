import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { TIMING } from "@/constants/application-config";

/**
 * Hook centralisé pour messages liés à l'analyse de prompts
 * Suit le principe SRP : responsabilité unique des messages d'analyse
 */
export function useAnalysisMessages() {
  const { notifySuccess, notifyError, notifyLoading, notifyWarning } = useToastNotifier();

  return {
    showAnalyzing: () => {
      const msg = messages.analysis.notifications.analyzing;
      return notifyLoading(msg.title, msg.description);
    },

    showAnalysisComplete: () => {
      const msg = messages.analysis.notifications.complete;
      notifySuccess(msg.title, msg.description);
    },

    showEmptyPromptError: () => {
      const msg = messages.analysis.notifications.errors.emptyPrompt;
      notifyError(msg.title, msg.description);
    },

    showAnalysisFailed: (errorMessage?: string) => {
      const msg = messages.analysis.notifications.errors.failed;
      notifyError(msg.title, errorMessage || msg.description);
    },

    showTimeoutError: () => {
      const msg = messages.analysis.notifications.errors.timeout;
      notifyError(msg.title, msg.description, {
        duration: TIMING.TOAST_DURATION + 2000,
      });
    },

    showRateLimitError: (reason: 'minute' | 'daily', retryAfter: number) => {
      const msg = reason === 'daily' 
        ? messages.analysis.notifications.errors.rateLimit.daily
        : messages.analysis.notifications.errors.rateLimit.minute;
      
      const timeStr = retryAfter >= 60 
        ? `${Math.ceil(retryAfter / 60)} minute(s)` 
        : `${retryAfter} secondes`;
      
      notifyWarning(msg.title, `${msg.description} Réessayez dans ${timeStr}.`, {
        duration: TIMING.TOAST_DURATION + 2000,
      });
    },
  };
}
