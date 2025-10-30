import { useOptimisticLocking, type OptimisticLockError } from "@/hooks/useOptimisticLocking";
import { usePrompt } from "@/hooks/usePrompts";
import { toast } from "sonner";

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictMessage?: string;
}

/**
 * Hook pour gérer les conflits de concurrence (optimistic locking)
 * Isole la logique complexe de détection de conflicts
 */
export function useConflictHandler(promptId?: string) {
  const { checkForConflicts } = useOptimisticLocking();
  const { data: currentServerPrompt } = usePrompt(promptId);

  const checkConflict = (): ConflictCheckResult => {
    // Pas de conflit possible en mode création
    if (!promptId || !currentServerPrompt) {
      return { hasConflict: false };
    }

    try {
      // Créer un prompt client fictif avec updated_at de la dernière lecture
      const clientPrompt = {
        ...currentServerPrompt,
        updated_at: currentServerPrompt.updated_at,
      };

      checkForConflicts(clientPrompt, currentServerPrompt);
      return { hasConflict: false };
    } catch (error) {
      const lockError = error as OptimisticLockError;
      if (lockError.type === "CONFLICT") {
        // Toast avec action de rechargement
        toast.error("Conflit détecté", {
          description: lockError.message,
          action: {
            label: "Recharger",
            onClick: () => window.location.reload(),
          },
        });

        return {
          hasConflict: true,
          conflictMessage: lockError.message,
        };
      }
      return { hasConflict: false };
    }
  };

  return { checkConflict };
}
