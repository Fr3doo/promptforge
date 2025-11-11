import { messages } from "@/constants/messages";

/**
 * Hook pour accès type-safe aux messages des composants UI
 * Réutilisable pour ErrorFallback, EmptyState, etc.
 * 
 * Note: Ce hook est optionnel. Les composants peuvent directement 
 * importer `messages.ui.*` mais ce hook offre:
 * - Cohérence architecturale avec les autres hooks
 * - Facilite l'évolution future (logique conditionnelle, i18n)
 * - Point d'accès centralisé pour tous les messages UI
 */
export function useUIMessages() {
  return {
    errorFallback: messages.ui.errorFallback,
  };
}
