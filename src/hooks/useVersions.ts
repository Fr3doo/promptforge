import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { successToast, errorToast } from "@/lib/toastUtils";
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
      const { data, error } = await supabase
        .from("versions")
        .insert(version)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["versions", variables.prompt_id] });
      successToast("Version créée");
    },
    onError: () => {
      errorToast("Erreur lors de la création de la version");
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
      // Récupérer la version
      const { data: version, error: versionError } = await supabase
        .from("versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Restaurer dans le prompt
      const { error: updateError } = await supabase
        .from("prompts")
        .update({ 
          content: version.content,
          version: version.semver,
        })
        .eq("id", promptId);

      if (updateError) throw updateError;

      // Restaurer les variables si présentes
      if (version.variables) {
        // Supprimer anciennes variables
        await supabase.from("variables").delete().eq("prompt_id", promptId);

        // Insérer variables de la version
        const variablesArray = version.variables as any[];
        if (variablesArray.length > 0) {
          await supabase.from("variables").insert(
            variablesArray.map(v => ({ ...v, prompt_id: promptId }))
          );
        }
      }

      return version;
    },
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
      queryClient.invalidateQueries({ queryKey: ["variables", promptId] });
      successToast("Version restaurée");
    },
    onError: () => {
      errorToast("Erreur lors de la restauration");
    },
  });
}
