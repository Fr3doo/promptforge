import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { successToast, errorToast } from "@/lib/toastUtils";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import type { Tables } from "@/integrations/supabase/types";

type Prompt = Tables<"prompts">;

// Hook de lecture - liste complète
export function usePrompts() {
  return useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data as Prompt[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - prompt unique
export function usePrompt(id: string | undefined) {
  return useQuery({
    queryKey: ["prompts", id],
    queryFn: async () => {
      if (!id) throw new Error("ID requis");
      
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Prompt;
    },
    enabled: !!id,
  });
}

// Hook création
export function useCreatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("prompts")
        .insert({
          ...promptData,
          owner_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast("Prompt créé");
    },
    onError: (error) => {
      errorToast("Erreur", getSafeErrorMessage(error));
    },
  });
}

// Hook mise à jour
export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prompt> }) => {
      const { data, error } = await supabase
        .from("prompts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["prompts", id] });
      const previous = queryClient.getQueryData(["prompts", id]);
      
      queryClient.setQueryData(["prompts", id], (old: Prompt | undefined) => 
        old ? { ...old, ...updates } : old
      );
      
      return { previous };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(["prompts", id], context?.previous);
      errorToast("Erreur de mise à jour", getSafeErrorMessage(err));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts", id] });
      successToast("Prompt mis à jour");
    },
  });
}

// Hook suppression
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast("Prompt supprimé");
    },
    onError: (error) => {
      errorToast("Erreur de suppression", getSafeErrorMessage(error));
    },
  });
}

// Hook toggle favori avec optimistic update
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, currentState }: { id: string; currentState: boolean }) => {
      const { error } = await supabase
        .from("prompts")
        .update({ is_favorite: !currentState })
        .eq("id", id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, currentState }) => {
      await queryClient.cancelQueries({ queryKey: ["prompts"] });
      const previous = queryClient.getQueryData(["prompts"]);
      
      queryClient.setQueryData(["prompts"], (old: Prompt[] | undefined) =>
        old ? old.map(p => p.id === id ? { ...p, is_favorite: !currentState } : p) : old
      );
      
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["prompts"], context?.previous);
      errorToast("Erreur", getSafeErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

// Hook pour dupliquer un prompt
export function useDuplicatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promptId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Récupérer le prompt original
      const { data: originalPrompt, error: fetchError } = await supabase
        .from("prompts")
        .select("*")
        .eq("id", promptId)
        .single();
      
      if (fetchError) throw fetchError;

      // Créer une copie
      const { data: newPrompt, error: insertError } = await supabase
        .from("prompts")
        .insert({
          title: `${originalPrompt.title} (Copie)`,
          content: originalPrompt.content,
          description: originalPrompt.description,
          tags: originalPrompt.tags,
          visibility: "PRIVATE", // Toujours privé au départ
          version: "1.0.0",
          status: "DRAFT", // Marquer comme brouillon
          is_favorite: false,
          owner_id: user.id,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Récupérer et dupliquer les variables
      const { data: originalVariables } = await supabase
        .from("variables")
        .select("*")
        .eq("prompt_id", promptId);

      if (originalVariables && originalVariables.length > 0) {
        const variablesToInsert = originalVariables.map(v => ({
          prompt_id: newPrompt.id,
          name: v.name,
          type: v.type,
          required: v.required,
          default_value: v.default_value,
          help: v.help,
          pattern: v.pattern,
          options: v.options,
          order_index: v.order_index,
        }));

        await supabase.from("variables").insert(variablesToInsert);
      }

      return newPrompt;
    },
    onSuccess: (newPrompt) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast("Prompt dupliqué avec succès");
      return newPrompt;
    },
    onError: (error) => {
      errorToast("Erreur de duplication", getSafeErrorMessage(error));
    },
  });
}

// Hook pour basculer la visibilité d'un prompt
export function useToggleVisibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, currentVisibility }: { id: string; currentVisibility: "PRIVATE" | "SHARED" }) => {
      const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
      
      const { error } = await supabase
        .from("prompts")
        .update({ 
          visibility: newVisibility,
          status: "PUBLISHED" // Publier automatiquement lors du partage
        })
        .eq("id", id);
      
      if (error) throw error;
      return newVisibility;
    },
    onMutate: async ({ id, currentVisibility }) => {
      await queryClient.cancelQueries({ queryKey: ["prompts"] });
      const previous = queryClient.getQueryData(["prompts"]);
      const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
      
      queryClient.setQueryData(["prompts"], (old: Prompt[] | undefined) =>
        old ? old.map(p => p.id === id ? { ...p, visibility: newVisibility, status: "PUBLISHED" as const } : p) : old
      );
      
      return { previous };
    },
    onSuccess: (newVisibility) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      if (newVisibility === "SHARED") {
        successToast("Prompt partagé avec la communauté");
      } else {
        successToast("Prompt redevenu privé");
      }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["prompts"], context?.previous);
      errorToast("Erreur", getSafeErrorMessage(err));
    },
  });
}
