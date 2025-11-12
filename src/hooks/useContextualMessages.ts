import { messages } from "@/constants/messages";

/**
 * Hook pour accès type-safe aux messages contextuels (tooltips, aide inline)
 * Réutilisable pour tous les composants nécessitant du guidage utilisateur
 * 
 * Note: Ce hook est optionnel. Les composants peuvent directement 
 * importer `messages.tooltips.*` ou `messages.help.*` mais ce hook offre:
 * - Cohérence architecturale avec les autres hooks
 * - Facilite l'évolution future (logique conditionnelle, i18n)
 * - Point d'accès centralisé pour tous les messages contextuels
 */
export function useContextualMessages() {
  return {
    tooltips: messages.tooltips,
    help: messages.help,
  };
}
