import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVersionMessages } from "@/features/prompts/hooks/useVersionMessages";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { logDebug, logError, logInfo } from "@/lib/logger";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";

type Version = Tables<"versions">;
type VersionInsert = TablesInsert<"versions">;

export function useVersions(promptId: string | undefined) {
  return useQuery({
    queryKey: ["versions", promptId],
    queryFn: async () => {
      if (!promptId) return [];

      const { data, error } = await supabase
        .from("versions")
        .select("*")
        .eq("prompt_id", promptId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Version[];
    },
    enabled: !!promptId,
  });
}

export function useCreateVersion() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();

  return useMutation({
    mutationFn: async (version: VersionInsert) => {
      // Créer la nouvelle version
      const { data, error } = await supabase
        .from("versions")
        .insert(version)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le numéro de version du prompt
      const { error: updateError } = await supabase
        .from("prompts")
        .update({ version: version.semver })
        .eq("id", version.prompt_id);

      if (updateError) throw updateError;

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
      const { data: versionsToDelete, error: fetchError } = await supabase
        .from("versions")
        .select("semver")
        .in("id", versionIds);

      if (fetchError) throw fetchError;

      const isCurrentVersionIncluded = versionsToDelete?.some(
        v => v.semver === currentVersion
      );

      const { error } = await supabase
        .from("versions")
        .delete()
        .in("id", versionIds);

      if (error) {
        logError("Erreur suppression versions", { 
          versionIds, 
          promptId,
          error: error.message 
        });
        throw error;
      }

      // Si la version courante a été supprimée, mettre à jour le prompt avec la dernière version restante
      if (isCurrentVersionIncluded) {
        logInfo("Version courante supprimée, mise à jour du prompt");
        
        const { data: remainingVersions, error: remainingError } = await supabase
          .from("versions")
          .select("semver")
          .eq("prompt_id", promptId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (remainingError) throw remainingError;

        if (remainingVersions && remainingVersions.length > 0) {
          // Mettre à jour vers la version la plus récente
          const { error: updateError } = await supabase
            .from("prompts")
            .update({ version: remainingVersions[0].semver })
            .eq("id", promptId);

          if (updateError) throw updateError;
          
          logInfo("Prompt mis à jour vers version", { semver: remainingVersions[0].semver });
        } else {
          // Aucune version restante, réinitialiser à 1.0.0
          const { error: updateError } = await supabase
            .from("prompts")
            .update({ version: "1.0.0" })
            .eq("id", promptId);

          if (updateError) throw updateError;
          
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
      const { data, error } = await supabase.functions.invoke('restore-version', {
        body: { versionId, promptId }
      });

      if (error) {
        logError("Erreur edge function restore-version", { 
          versionId,
          promptId,
          error: error.message 
        });
        throw new Error(error.message || "Échec de la restauration");
      }

      if (!data?.success) {
        logError("Échec restauration", { 
          versionId,
          promptId,
          errorDetails: data?.error 
        });
        throw new Error(data?.error || "Échec de la restauration");
      }

      logInfo("Restauration réussie via edge function", { 
        semver: data.version.semver,
        variablesCount: data.version.variablesCount
      });

      return data.version;
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
