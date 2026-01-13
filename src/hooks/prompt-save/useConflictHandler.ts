import { useOptimisticLocking } from "@/hooks/useOptimisticLocking";
import { toast } from "sonner";

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictMessage?: string;
}

const CONFLICT_MESSAGE =
  "Ce prompt a été modifié par un autre utilisateur. Veuillez recharger la page pour voir les dernières modifications.";

/**
 * Hook pour gérer les conflits de concurrence (optimistic locking)
 * Utilise checkForServerUpdates pour une vraie vérification serveur
 */
export function useConflictHandler(promptId?: string, clientUpdatedAt?: string) {
  const { checkForServerUpdates } = useOptimisticLocking();

  const checkConflict = async (): Promise<ConflictCheckResult> => {
    if (!promptId || !clientUpdatedAt) {
      return { hasConflict: false };
    }

    const result = await checkForServerUpdates(promptId, clientUpdatedAt);

    if (result.hasConflict) {
      toast.error("Conflit détecté", {
        description: CONFLICT_MESSAGE,
        action: {
          label: "Recharger",
          onClick: () => window.location.reload(),
        },
      });

      return { hasConflict: true, conflictMessage: CONFLICT_MESSAGE };
    }

    return { hasConflict: false };
  };

  return { checkConflict };
}
