import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { TIMING } from "@/constants/application-config";

/**
 * Hook centralisé pour messages liés à l'analyse de prompts
 * Suit le principe SRP : responsabilité unique des messages d'analyse
 */
export function useAnalysisMessages() {
  const { notifySuccess, notifyError, notifyLoading } = useToastNotifier();

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
        duration: TIMING.TOAST_DURATION + 2000, // 5 secondes pour timeout
      });
    },
  };
}
