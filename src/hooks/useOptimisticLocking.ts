import { useCallback } from "react";
import { useVersionRepository } from "@/contexts/VersionRepositoryContext";

/**
 * Hook pour gérer le verrouillage optimiste des prompts
 * Vérifie que les données n'ont pas été modifiées par un autre utilisateur
 * avant de permettre une mise à jour ou une création de version
 */
export function useOptimisticLocking() {
  const versionRepository = useVersionRepository();

  /**
   * Vérifie qu'une version avec le même numéro n'existe pas déjà
   * @param promptId - ID du prompt
   * @param semver - Numéro de version à vérifier
   * @returns true si la version existe déjà
   */
  const checkVersionExists = useCallback(async (
    promptId: string,
    semver: string
  ): Promise<boolean> => {
    return versionRepository.existsBySemver(promptId, semver);
  }, [versionRepository]);

  /**
   * Vérifie si le prompt a été modifié sur le serveur
   * @param promptId - ID du prompt
   * @param clientUpdatedAt - Date de dernière modification côté client
   * @returns Object avec hasConflict et optionnellement serverUpdatedAt
   */
  const checkForServerUpdates = useCallback(async (
    promptId: string,
    clientUpdatedAt: string
  ): Promise<{ hasConflict: boolean; serverUpdatedAt?: string }> => {
    const { SupabasePromptQueryRepository } = await import("@/repositories/PromptQueryRepository");
    const repository = new SupabasePromptQueryRepository();
    
    try {
      const serverPrompt = await repository.fetchById(promptId);
      
      if (!serverPrompt) {
        return { hasConflict: false };
      }

      const serverIsNewer = new Date(serverPrompt.updated_at) > new Date(clientUpdatedAt);

      return serverIsNewer
        ? { hasConflict: true, serverUpdatedAt: serverPrompt.updated_at }
        : { hasConflict: false };
    } catch (error) {
      console.error("Erreur lors de la vérification des mises à jour:", error);
      return { hasConflict: false };
    }
  }, []);

  return {
    checkVersionExists,
    checkForServerUpdates,
  };
}
