import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";

/**
 * Hook centralisé pour messages liés aux variables
 * Suit le principe SRP : responsabilité unique des messages de variables
 */
export function useVariableMessages() {
  const { notifySuccess, notifyError } = useToastNotifier();

  return {
    showVariablesSaved: () => {
      const msg = messages.variables.notifications.saved;
      notifySuccess(msg.title, msg.description);
    },

    showSaveFailed: (description?: string) => {
      const msg = messages.variables.notifications.errors.saveFailed;
      notifyError(msg.title, description || msg.description);
    },

    showCreateFailed: (description?: string) => {
      const msg = messages.variables.notifications.errors.createFailed;
      notifyError(msg.title, description || msg.description);
    },
  };
}
