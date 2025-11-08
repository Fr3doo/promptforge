import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";

/**
 * Hook centralisé pour TOUS les messages liés aux prompts
 * Fournit un accès type-safe aux messages avec affichage automatique via toast
 * 
 * Élimine la duplication dans :
 * - usePromptForm
 * - usePromptSave
 * - usePrompts
 * - usePromptShares
 * - usePromptSaveErrorHandler
 */
export function usePromptMessages() {
  const { notifySuccess, notifyError, notifyInfo } = useToastNotifier();

  return {
    // ========== SUCCÈS - CRUD ==========
    
    showPromptCreated: (title: string) => {
      const msg = messages.prompts.notifications.created;
      notifySuccess(msg.title, msg.description(title), { duration: 4000 });
    },

    showPromptUpdated: (title: string) => {
      const msg = messages.prompts.notifications.updated;
      notifySuccess(msg.title, msg.description(title), { duration: 3000 });
    },

    showPromptDeleted: () => {
      const msg = messages.prompts.notifications.deleted;
      notifySuccess(msg.title, msg.description);
    },

    showPromptDuplicated: (title: string) => {
      const msg = messages.prompts.notifications.duplicated;
      notifySuccess(msg.title, msg.description(title));
    },

    // ========== ERREURS - FORMULAIRE ==========

    showNoEditPermission: () => {
      const msg = messages.prompts.notifications.form.noEditPermission;
      notifyError(msg.title, msg.description, { duration: 5000 });
    },

    showConflictDetected: () => {
      const msg = messages.prompts.notifications.form.conflictDetected;
      notifyError(msg.title, msg.description, { duration: 5000 });
    },

    showValidationError: (field: string, constraint: string) => {
      const msg = messages.prompts.notifications.form.validationFailed;
      notifyError(msg.title, msg.description(field, constraint), { duration: 5000 });
    },

    // ========== ERREURS - SAUVEGARDE ==========

    showDuplicateTitleError: () => {
      const msg = messages.prompts.notifications.save.duplicateTitle;
      notifyError(msg.title, msg.description);
    },

    showNetworkError: (action: string, retry?: () => void) => {
      const msg = messages.prompts.notifications.save.networkError;
      notifyError(msg.title, msg.description(action), {
        duration: 7000,
        action: retry ? { label: "Réessayer", onClick: retry } : undefined,
      });
    },

    showServerError: (action: string, retry?: () => void) => {
      const msg = messages.prompts.notifications.save.serverError;
      notifyError(msg.title, msg.description(action), {
        duration: 6000,
        action: retry ? { label: "Réessayer", onClick: retry } : undefined,
      });
    },

    showPermissionDenied: (resource: string) => {
      const msg = messages.prompts.notifications.save.permissionDenied;
      notifyError(msg.title, msg.description(resource), { duration: 5000 });
    },

    // ========== PARTAGE PRIVÉ ==========

    showShareAdded: (email: string, permission: "READ" | "WRITE") => {
      const msg = messages.prompts.notifications.share.added;
      notifySuccess(msg.title, msg.description(email, permission));
    },

    showSharePermissionUpdated: () => {
      const msg = messages.prompts.notifications.share.permissionUpdated;
      notifySuccess(msg.title, msg.description);
    },

    showShareDeleted: () => {
      const msg = messages.prompts.notifications.share.deleted;
      notifySuccess(msg.title, msg.description);
    },

    // Erreurs de partage
    showUserNotFoundError: () => {
      const msg = messages.prompts.notifications.share.errors.userNotFound;
      notifyError(msg.title, msg.description, { duration: 6000 });
    },

    showSelfShareError: () => {
      const msg = messages.prompts.notifications.share.errors.selfShare;
      notifyError(msg.title, msg.description);
    },

    showNotOwnerError: () => {
      const msg = messages.prompts.notifications.share.errors.notOwner;
      notifyError(msg.title, msg.description);
    },

    showAlreadySharedError: () => {
      const msg = messages.prompts.notifications.share.errors.alreadyShared;
      notifyError(msg.title, msg.description);
    },

    showShareNotFoundError: () => {
      const msg = messages.prompts.notifications.share.errors.shareNotFound;
      notifyError(msg.title, msg.description);
    },

    showUnauthorizedUpdateError: () => {
      const msg = messages.prompts.notifications.share.errors.unauthorizedUpdate;
      notifyError(msg.title, msg.description);
    },

    showUnauthorizedDeleteError: () => {
      const msg = messages.prompts.notifications.share.errors.unauthorizedDelete;
      notifyError(msg.title, msg.description);
    },

    // ========== VISIBILITÉ PUBLIQUE ==========

    showVisibilityShared: () => {
      const msg = messages.prompts.notifications.visibility.shared;
      notifySuccess(msg.title, msg.description);
    },

    showVisibilityPrivate: () => {
      const msg = messages.prompts.notifications.visibility.private;
      notifySuccess(msg.title, msg.description);
    },

    showPublicPermissionUpdated: () => {
      const msg = messages.prompts.notifications.visibility.permissionUpdated;
      notifySuccess(msg.title, msg.description);
    },

    showCannotUpdatePrivateError: () => {
      const msg = messages.prompts.notifications.visibility.errors.cannotUpdatePrivate;
      notifyError(msg.title, msg.description, { duration: 5000 });
    },

    // ========== SYSTÈME ==========

    showSessionExpired: () => {
      const msg = messages.system.sessionExpired;
      notifyError(msg.title, msg.description, { duration: 6000 });
    },

    showGenericError: (description?: string) => {
      const msg = messages.system.genericError;
      notifyError(msg.title, description || msg.description);
    },
  };
}
