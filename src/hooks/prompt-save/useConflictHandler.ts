import { useOptimisticLocking } from "@/hooks/useOptimisticLocking";
import { toast } from "sonner";

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictMessage?: string;
}

/**
 * Hook pour gérer les conflits de concurrence (optimistic locking)
 * Utilise checkForServerUpdates pour une vraie vérification serveur
 */
export function useConflictHandler(promptId?: string, clientUpdatedAt?: string) {
  const { checkForServerUpdates } = useOptimisticLocking();

  const checkConflict = async (): Promise<ConflictCheckResult> => {
    // Pas de conflit possible en mode création ou sans timestamp client
    if (!promptId || !clientUpdatedAt) {
      return { hasConflict: false };
    }

    const result = await checkForServerUpdates(promptId, clientUpdatedAt);

    if (result.hasConflict) {
      const message =
        "Ce prompt a été modifié par un autre utilisateur. Veuillez recharger la page pour voir les dernières modifications.";

      toast.error("Conflit détecté", {
        description: message,
        action: {
          label: "Recharger",
          onClick: () => window.location.reload(),
        },
      });

      return {
        hasConflict: true,
        conflictMessage: message,
      };
    }

    return { hasConflict: false };
  };

  return { checkConflict };
}
