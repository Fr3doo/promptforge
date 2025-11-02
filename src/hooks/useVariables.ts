import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { messages } from "@/constants/messages";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";
import type { VariableInsert, VariableUpsertInput } from "@/repositories/VariableRepository";

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
  const { notifyError } = useToastNotifier();
  
  return useMutation({
    mutationFn: (variable: VariableInsert) => repository.create(variable),
    onSuccess: (_, { prompt_id }) => {
      queryClient.invalidateQueries({ queryKey: ["variables", prompt_id] });
    },
    onError: (error) => {
      notifyError(messages.labels.error, getSafeErrorMessage(error));
    },
  });
}

export function useBulkUpsertVariables() {
  const queryClient = useQueryClient();
  const repository = useVariableRepository();
  const { notifySuccess, notifyError } = useToastNotifier();
  
  return useMutation({
    mutationFn: ({ 
      promptId, 
      variables 
    }: { 
      promptId: string; 
      variables: VariableUpsertInput[];
    }) => repository.upsertMany(promptId, variables),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ["variables", promptId] });
      notifySuccess(messages.success.variablesSaved);
    },
    onError: (error) => {
      notifyError(messages.errors.variables.saveFailed, getSafeErrorMessage(error));
    },
  });
}
