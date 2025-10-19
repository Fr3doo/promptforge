import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
      toast({ title: "✅ Prompt créé avec succès" });
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erreur", 
        description: getSafeErrorMessage(error),
        variant: "destructive" 
      });
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
      toast({ 
        title: "❌ Erreur de mise à jour", 
        description: getSafeErrorMessage(err),
        variant: "destructive" 
      });
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts", id] });
      toast({ title: "✅ Prompt mis à jour" });
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
      toast({ title: "🗑️ Prompt supprimé" });
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erreur de suppression", 
        description: getSafeErrorMessage(error),
        variant: "destructive" 
      });
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
      toast({ 
        title: "❌ Erreur", 
        description: getSafeErrorMessage(err),
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}
