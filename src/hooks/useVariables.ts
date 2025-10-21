import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import type { VariableInsert } from "@/repositories/VariableRepository";

export function useVariables(promptId: string | undefined) {
  const repository = useVariableRepository();
  
  return useQuery({
    queryKey: ["variables", promptId],
    queryFn: () => {
      if (!promptId) return [];
      return repository.fetch(promptId);
    },
    enabled: !!promptId,
  });
}

export function useCreateVariable() {
  const queryClient = useQueryClient();
  const repository = useVariableRepository();
  
  return useMutation({
    mutationFn: (variable: VariableInsert) => repository.create(variable),
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
  const repository = useVariableRepository();
  
  return useMutation({
    mutationFn: ({ 
      promptId, 
      variables 
    }: { 
      promptId: string; 
      variables: Omit<VariableInsert, "prompt_id">[];
    }) => repository.upsertMany(promptId, variables),
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
