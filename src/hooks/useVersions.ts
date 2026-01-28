import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useVersionMessages } from "@/features/prompts/hooks/useVersionMessages";
import type { TablesInsert } from "@/integrations/supabase/types";
import { logDebug, logError, logInfo } from "@/lib/logger";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";
import { useVersionRepository } from "@/contexts/VersionRepositoryContext";
import { usePromptMutationRepository } from "@/contexts/PromptMutationRepositoryContext";
import { useEdgeFunctionRepository } from "@/contexts/EdgeFunctionRepositoryContext";
import { useVersionDeletionService } from "@/contexts/VersionDeletionServiceContext";
import type { Version } from "@/repositories/VersionRepository";
import type { VersionDeletionParams } from "@/services/VersionDeletionService";

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
  const promptMutationRepository = usePromptMutationRepository();

  return useMutation({
    mutationFn: async (version: VersionInsert) => {
      // Créer la nouvelle version
      const data = await versionRepository.create(version);
      
      // Mettre à jour le numéro de version du prompt (via PromptMutationRepository pour SRP)
      await promptMutationRepository.updateVersion(version.prompt_id, version.semver);

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

/**
 * Hook pour supprimer des versions avec gestion cascade
 * 
 * Délègue la logique métier au VersionDeletionService (SRP)
 * pour améliorer la testabilité et la séparation des responsabilités.
 */
export function useDeleteVersions() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const deletionService = useVersionDeletionService();

  return useMutation({
    mutationFn: async (params: VersionDeletionParams) => {
      logDebug("Appel du service de suppression de versions", { 
        count: params.versionIds.length 
      });
      return await deletionService.deleteWithCascade(params);
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["versions", result.promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts", result.promptId] });
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
