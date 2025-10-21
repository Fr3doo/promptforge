import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { successToast, errorToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["versions", variables.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ["prompts", variables.prompt_id] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast(messages.success.versionCreated);
    },
    onError: () => {
      errorToast(messages.errors.version.createFailed);
    },
  });
}

export function useDeleteVersions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      versionIds, 
      promptId 
    }: { 
      versionIds: string[]; 
      promptId: string;
    }) => {
      console.log("🗑️ Suppression de", versionIds.length, "version(s)");
      
      const { error } = await supabase
        .from("versions")
        .delete()
        .in("id", versionIds);

      if (error) {
        console.error("❌ Erreur suppression versions:", error);
        throw error;
      }

      console.log("✅ Versions supprimées");
      return { promptId };
    },
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ["versions", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast(messages.success.versionDeleted);
    },
    onError: () => {
      errorToast(messages.errors.version.deleteFailed);
    },
  });
}

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      versionId, 
      promptId 
    }: { 
      versionId: string; 
      promptId: string;
    }) => {
      console.log("🔄 Début restauration - versionId:", versionId, "promptId:", promptId);
      
      // Récupérer la version
      const { data: version, error: versionError } = await supabase
        .from("versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (versionError) {
        console.error("❌ Erreur récupération version:", versionError);
        throw versionError;
      }

      console.log("✅ Version récupérée:", version.semver, "contenu length:", version.content.length);

      // Restaurer dans le prompt
      const { error: updateError } = await supabase
        .from("prompts")
        .update({ 
          content: version.content,
          version: version.semver,
        })
        .eq("id", promptId);

      if (updateError) {
        console.error("❌ Erreur mise à jour prompt:", updateError);
        throw updateError;
      }

      console.log("✅ Prompt mis à jour vers version:", version.semver);

      // Restaurer les variables si présentes
      if (version.variables) {
        console.log("🔄 Restauration des variables...");
        
        // Supprimer anciennes variables
        const { error: deleteError } = await supabase
          .from("variables")
          .delete()
          .eq("prompt_id", promptId);

        if (deleteError) {
          console.error("❌ Erreur suppression variables:", deleteError);
        }

        // Insérer variables de la version
        const variablesArray = version.variables as any[];
        if (variablesArray.length > 0) {
          const { error: insertError } = await supabase
            .from("variables")
            .insert(
              variablesArray.map(v => ({ ...v, prompt_id: promptId }))
            );

          if (insertError) {
            console.error("❌ Erreur insertion variables:", insertError);
          } else {
            console.log("✅ Variables restaurées:", variablesArray.length);
          }
        }
      }

      return version;
    },
    onSuccess: (version, { promptId }) => {
      console.log("🎉 Restauration réussie vers version:", version.semver);
      
      // Invalider toutes les queries pertinentes
      queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["variables", promptId] });
      queryClient.invalidateQueries({ queryKey: ["versions", promptId] });
      
      successToast(messages.success.versionRestored(version.semver));
    },
    onError: (error) => {
      console.error("❌ Erreur lors de la restauration:", error);
      errorToast(messages.errors.version.restoreFailed);
    },
  });
}
