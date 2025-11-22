import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVersionMessages } from "@/features/prompts/hooks/useVersionMessages";
import type { TablesInsert } from "@/integrations/supabase/types";
import { logDebug, logError, logInfo } from "@/lib/logger";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";
import { useVersionRepository } from "@/contexts/VersionRepositoryContext";
import { useEdgeFunctionRepository } from "@/contexts/EdgeFunctionRepositoryContext";
import type { Version } from "@/repositories/VersionRepository";

type VersionInsert = TablesInsert<"versions">;

export function useVersions(promptId: string | undefined) {
  const versionRepository = useVersionRepository();
  
  return useQuery({
    queryKey: ["versions", promptId],
    queryFn: async () => {
      if (!promptId) return [];
      return await versionRepository.fetchByPromptId(promptId);
    },
    enabled: !!promptId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const versionRepository = useVersionRepository();

  return useMutation({
    mutationFn: async (version: VersionInsert) => {
      // Créer la nouvelle version
      const data = await versionRepository.create(version);
      
      // Mettre à jour le numéro de version du prompt
      await versionRepository.updatePromptVersion(version.prompt_id, version.semver);

      return data;
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["versions", variables.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ["prompts", variables.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      versionMessages.showVersionCreated();
    },
    onError: () => {
      versionMessages.showCreateFailed();
    },
  });
}

export function useDeleteVersions() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const versionRepository = useVersionRepository();

  return useMutation({
    mutationFn: async ({ 
      versionIds, 
      promptId,
      currentVersion
    }: { 
      versionIds: string[]; 
      promptId: string;
      currentVersion?: string;
    }) => {
      logDebug("Suppression de versions", { count: versionIds.length, promptId });
      
      // Récupérer les versions à supprimer pour vérifier si la version courante est incluse
      const versionsToDelete = await versionRepository.fetchByIds(versionIds);

      const isCurrentVersionIncluded = versionsToDelete?.some(
        v => v.semver === currentVersion
      );

      // Supprimer les versions
      await versionRepository.delete(versionIds);

      // Si la version courante a été supprimée, mettre à jour le prompt avec la dernière version restante
      if (isCurrentVersionIncluded) {
        logInfo("Version courante supprimée, mise à jour du prompt");
        
        const latestVersion = await versionRepository.fetchLatestByPromptId(promptId);

        if (latestVersion) {
          // Mettre à jour vers la version la plus récente
          await versionRepository.updatePromptVersion(promptId, latestVersion.semver);
          logInfo("Prompt mis à jour vers version", { semver: latestVersion.semver });
        } else {
          // Aucune version restante, réinitialiser à 1.0.0
          await versionRepository.updatePromptVersion(promptId, "1.0.0");
          logInfo("Aucune version restante, réinitialisation à 1.0.0");
        }
      }

      logInfo("Versions supprimées", { count: versionIds.length, promptId });
      return { promptId };
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ["versions", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      versionMessages.showVersionDeleted();
    },
    onError: () => {
      versionMessages.showDeleteFailed();
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const edgeFunctionRepository = useEdgeFunctionRepository();

  return useMutation({
    mutationFn: async ({ 
      versionId, 
      promptId 
    }: { 
      versionId: string; 
      promptId: string;
    }) => {
      logDebug("Début restauration via edge function", { versionId, promptId });
      
      // Appeler l'edge function pour restauration avec transaction
      const result = await edgeFunctionRepository.restoreVersion({ versionId, promptId });

      if (!result.success) {
        logError("Échec restauration", { 
          versionId,
          promptId,
          errorDetails: result.error 
        });
        throw new Error(result.error || "Échec de la restauration");
      }

      logInfo("Restauration réussie via edge function", { 
        semver: result.version?.semver,
        variablesCount: result.version?.variablesCount
      });

      return result.version;
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: (version, { promptId }) => {
      logInfo("Restauration réussie", { semver: version.semver, promptId });
      
      // Invalider toutes les queries pertinentes
      queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["variables", promptId] });
      queryClient.invalidateQueries({ queryKey: ["versions", promptId] });
      
      versionMessages.showVersionRestored(version.semver);
    },
    onError: (error) => {
      logError("Erreur lors de la restauration", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      versionMessages.showRestoreFailed();
    },
  });
}
