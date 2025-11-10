import { messages } from "@/constants/messages";
import { useToastNotifier } from "@/hooks/useToastNotifier";

/**
 * Hook centralisé pour messages système génériques
 * Réutilisable dans TOUS les modules (prompts, variables, versions, analysis, etc.)
 * Suit le principe DRY : évite la duplication de logique de notification
 */
export function useSystemMessages() {
  const { notifyError, notifyInfo, notifyWarning } = useToastNotifier();

  return {
    // ========== SESSION ==========
    
    showSessionExpired: () => {
      const msg = messages.system.sessionExpired;
      notifyError(msg.title, msg.description, { duration: 6000 });
    },

    // ========== ERREURS RÉSEAU ==========
    
    showNetworkError: (action: string, retry?: () => void) => {
      notifyError(
        "Erreur de connexion",
        `Impossible de ${action}. Vérifiez votre connexion internet.`,
        {
          duration: 7000,
          action: retry ? {
            label: "Réessayer",
            onClick: retry,
          } : undefined,
        }
      );
    },

    // ========== ERREURS SERVEUR ==========
    
    showServerError: (action: string, retry?: () => void) => {
      notifyError(
        "Erreur serveur",
        `Une erreur s'est produite lors de l'opération "${action}". Veuillez réessayer.`,
        {
          duration: 6000,
          action: retry ? {
            label: "Réessayer",
            onClick: retry,
          } : undefined,
        }
      );
    },

    // ========== PERMISSIONS ==========
    
    showPermissionError: (resource: string) => {
      notifyError(
        "Accès refusé",
        `Vous n'avez pas les permissions nécessaires pour modifier ${resource}.`,
        { duration: 5000 }
      );
    },

    // ========== CONFLITS ==========
    
    showConflictError: (resourceName: string, reload?: () => void) => {
      notifyError(
        "Conflit détecté",
        `${resourceName} a été modifié par un autre utilisateur. Veuillez recharger pour voir les dernières modifications.`,
        {
          duration: 8000,
          action: reload ? {
            label: "Recharger",
            onClick: reload,
          } : undefined,
        }
      );
    },

    // ========== VALIDATION ==========
    
    showValidationError: (field: string, constraint: string) => {
      notifyError(
        "Validation échouée",
        `${field}: ${constraint}`,
        { duration: 5000 }
      );
    },

    // ========== ERREUR GÉNÉRIQUE ==========
    
    showGenericError: (description?: string) => {
      const msg = messages.system.genericError;
      notifyError(msg.title, description || msg.description);
    },
  };
}
