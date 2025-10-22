import { useState, useEffect } from "react";
import { useOptimisticLocking } from "./useOptimisticLocking";

/**
 * Hook pour détecter les conflits d'édition concurrente
 * Vérifie périodiquement si le prompt a été modifié par un autre utilisateur
 */
export function useConflictDetection(
  promptId: string | undefined,
  clientUpdatedAt: string | undefined,
  isEnabled: boolean = true
) {
  const [hasConflict, setHasConflict] = useState(false);
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string>();
  const { checkForServerUpdates } = useOptimisticLocking();

  useEffect(() => {
    if (!promptId || !clientUpdatedAt || !isEnabled) {
      return;
    }

    // Vérification initiale
    const checkConflict = async () => {
      const result = await checkForServerUpdates(promptId, clientUpdatedAt);
      setHasConflict(result.hasConflict);
      setServerUpdatedAt(result.serverUpdatedAt);
    };

    checkConflict();

    // Vérification périodique toutes les 30 secondes
    const interval = setInterval(checkConflict, 30000);

    return () => clearInterval(interval);
  }, [promptId, clientUpdatedAt, isEnabled, checkForServerUpdates]);

  const resetConflict = () => {
    setHasConflict(false);
    setServerUpdatedAt(undefined);
  };

  return { hasConflict, serverUpdatedAt, resetConflict };
}
