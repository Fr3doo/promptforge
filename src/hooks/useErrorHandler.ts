import { getSafeErrorMessage } from "@/lib/errorHandler";
import { useSystemMessages } from "@/hooks/useSystemMessages";

/**
 * Hook pour gérer les erreurs de manière centralisée avec affichage toast
 * Combine getSafeErrorMessage + useSystemMessages
 * Suit le principe SRP : responsabilité unique de la gestion des erreurs
 */
export function useErrorHandler() {
  const systemMessages = useSystemMessages();

  const handleError = (error: any, context?: string) => {
    const userFriendlyMessage = getSafeErrorMessage(error);
    
    // Détection automatique du type d'erreur
    if (error?.code === 'PGRST116' || error?.message?.includes('permission')) {
      systemMessages.showPermissionError(context || "cette ressource");
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      systemMessages.showNetworkError(context || "effectuer cette action");
    } else if (error?.message?.includes('jwt') || error?.message?.includes('token')) {
      systemMessages.showSessionExpired();
    } else {
      systemMessages.showGenericError(userFriendlyMessage);
    }
  };

  return { handleError, getSafeErrorMessage };
}
