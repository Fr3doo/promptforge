import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { successToast, errorToast } from "@/lib/toastUtils";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { messages } from "@/constants/messages";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import type { Prompt } from "@/repositories/PromptRepository";

// Hook de lecture - liste complète (tous les prompts accessibles)
export function usePrompts() {
  const repository = usePromptRepository();
  
  return useQuery({
    queryKey: ["prompts"],
    queryFn: () => repository.fetchAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - seulement les prompts possédés par l'utilisateur
export function useOwnedPrompts() {
  const repository = usePromptRepository();
  
  return useQuery({
    queryKey: ["prompts", "owned"],
    queryFn: () => repository.fetchOwned(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - prompt unique
export function usePrompt(id: string | undefined) {
  const repository = usePromptRepository();
  
  return useQuery({
    queryKey: ["prompts", id],
    queryFn: () => {
      if (!id) throw new Error("ID requis");
      return repository.fetchById(id);
    },
    enabled: !!id,
  });
}

// Hook création
export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">) => {
      if (!user) throw new Error("Non authentifié");
      return repository.create(user.id, promptData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast(messages.success.promptCreated);
    },
    onError: (error) => {
      errorToast(messages.labels.error, getSafeErrorMessage(error));
    },
  });
}

// Hook mise à jour
export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Prompt> }) =>
      repository.update(id, updates),
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
      errorToast(messages.errors.update.failed, getSafeErrorMessage(err));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts", id] });
      successToast(messages.success.promptUpdated);
    },
  });
}

// Hook suppression
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast(messages.success.promptDeleted);
    },
    onError: (error) => {
      errorToast(messages.errors.delete.failed, getSafeErrorMessage(error));
    },
  });
}

// Hook toggle favori avec optimistic update
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: ({ id, currentState }: { id: string; currentState: boolean }) =>
      repository.toggleFavorite(id, currentState),
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
      errorToast(messages.labels.error, getSafeErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

// Hook pour dupliquer un prompt
export function useDuplicatePrompt() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  const variableRepository = useVariableRepository();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (promptId: string) => {
      if (!user) throw new Error("Non authentifié");
      return repository.duplicate(user.id, promptId, variableRepository);
    },
    onSuccess: (newPrompt) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      successToast(messages.success.promptDuplicated);
      return newPrompt;
    },
    onError: (error) => {
      errorToast(messages.errors.duplicate.failed, getSafeErrorMessage(error));
    },
  });
}

// Hook pour basculer la visibilité d'un prompt
export function useToggleVisibility() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: ({ id, currentVisibility }: { id: string; currentVisibility: "PRIVATE" | "SHARED" }) =>
      repository.toggleVisibility(id, currentVisibility),
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
        successToast(messages.success.promptShared);
      } else {
        successToast(messages.success.promptPrivate);
      }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["prompts"], context?.previous);
      errorToast(messages.labels.error, getSafeErrorMessage(err));
    },
  });
}
