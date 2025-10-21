import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Variable = Tables<"variables">;
type VariableInsert = TablesInsert<"variables">;

export function useVariables(promptId: string | undefined) {
  return useQuery({
    queryKey: ["variables", promptId],
    queryFn: async () => {
      if (!promptId) return [];
      
      const { data, error } = await supabase
        .from("variables")
        .select("*")
        .eq("prompt_id", promptId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as Variable[];
    },
    enabled: !!promptId,
  });
}

export function useCreateVariable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variable: VariableInsert) => {
      const { data, error } = await supabase
        .from("variables")
        .insert(variable)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { prompt_id }) => {
      queryClient.invalidateQueries({ queryKey: ["variables", prompt_id] });
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

export function useBulkUpsertVariables() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      promptId, 
      variables 
    }: { 
      promptId: string; 
      variables: Omit<VariableInsert, "prompt_id">[];
    }) => {
      // Supprimer anciennes variables
      await supabase.from("variables").delete().eq("prompt_id", promptId);
      
      // Insérer nouvelles
      if (variables.length === 0) return [];
      
      const { data, error } = await supabase
        .from("variables")
        .insert(variables.map(v => ({ ...v, prompt_id: promptId })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ["variables", promptId] });
      toast({ title: "✅ Variables enregistrées" });
    },
    onError: (error) => {
      toast({ 
        title: "❌ Erreur d'enregistrement des variables", 
        description: getSafeErrorMessage(error),
        variant: "destructive" 
      });
    },
  });
}
