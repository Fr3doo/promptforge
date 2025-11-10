import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";

/**
 * Hook centralisé pour messages liés aux versions
 * Suit le principe SRP : responsabilité unique des messages de versions
 */
export function useVersionMessages() {
  const { notifySuccess, notifyError } = useToastNotifier();

  return {
    showVersionCreated: () => {
      const msg = messages.versions.notifications.created;
      notifySuccess(msg.title, msg.description);
    },

    showVersionDeleted: () => {
      const msg = messages.versions.notifications.deleted;
      notifySuccess(msg.title, msg.description);
    },

    showVersionRestored: (semver: string) => {
      const msg = messages.versions.notifications.restored;
      notifySuccess(msg.title, msg.description(semver));
    },

    showCreateFailed: () => {
      const msg = messages.versions.notifications.errors.createFailed;
      notifyError(msg.title, msg.description);
    },

    showDeleteFailed: () => {
      const msg = messages.versions.notifications.errors.deleteFailed;
      notifyError(msg.title, msg.description);
    },

    showRestoreFailed: () => {
      const msg = messages.versions.notifications.errors.restoreFailed;
      notifyError(msg.title, msg.description);
    },
  };
}
