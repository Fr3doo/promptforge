import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { successToast, errorToast } from "@/lib/toastUtils";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { messages } from "@/constants/messages";
import { usePromptQueryRepository } from "@/contexts/PromptQueryRepositoryContext";
import { usePromptCommandRepository } from "@/contexts/PromptCommandRepositoryContext";
import { usePromptFavoriteService } from "@/contexts/PromptFavoriteServiceContext";
import { usePromptVisibilityService } from "@/contexts/PromptVisibilityServiceContext";
import { usePromptDuplicationService } from "@/contexts/PromptDuplicationServiceContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";
import type { Prompt } from "@/repositories/PromptRepository.interfaces";

// Hook de lecture - liste complète (tous les prompts accessibles)
// ISP : Utilise uniquement PromptQueryRepository (4 méthodes au lieu de 7)
export function usePrompts() {
  const queryRepository = usePromptQueryRepository();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["prompts", user?.id],
    queryFn: () => {
      if (!user) throw new Error("Utilisateur non authentifié");
      return queryRepository.fetchAll(user.id);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - seulement les prompts possédés par l'utilisateur
// ISP : Utilise uniquement PromptQueryRepository (4 méthodes au lieu de 7)
export function useOwnedPrompts() {
  const queryRepository = usePromptQueryRepository();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["prompts", "owned", user?.id],
    queryFn: () => {
      if (!user) throw new Error("Utilisateur non authentifié");
      return queryRepository.fetchOwned(user.id);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - prompts partagés avec moi (partage privé)
// ISP : Utilise uniquement PromptQueryRepository (4 méthodes au lieu de 7)
export function useSharedWithMePrompts() {
  const queryRepository = usePromptQueryRepository();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["prompts", "shared-with-me", user?.id],
    queryFn: () => {
      if (!user) throw new Error("Utilisateur non authentifié");
      return queryRepository.fetchSharedWithMe(user.id);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook de lecture - prompt unique
// ISP : Utilise uniquement PromptQueryRepository (4 méthodes au lieu de 7)
export function usePrompt(id: string | undefined) {
  const queryRepository = usePromptQueryRepository();
  
  return useQuery({
    queryKey: ["prompts", id],
    queryFn: () => {
      if (!id) throw new Error("ID requis");
      return queryRepository.fetchById(id);
    },
    enabled: !!id,
  });
}

// Hook création
// ISP : Utilise uniquement PromptCommandRepository (3 méthodes au lieu de 7)
export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const commandRepository = usePromptCommandRepository();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">) => {
      if (!user) throw new Error("Non authentifié");
      return commandRepository.create(user.id, promptData);
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
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
// ISP : Utilise uniquement PromptCommandRepository (3 méthodes au lieu de 7)
export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  const commandRepository = usePromptCommandRepository();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Prompt> }) =>
      commandRepository.update(id, updates),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
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
// ISP : Utilise uniquement PromptCommandRepository (3 méthodes au lieu de 7)
export function useDeletePrompt() {
  const queryClient = useQueryClient();
  const commandRepository = usePromptCommandRepository();
  
  return useMutation({
    mutationFn: (id: string) => commandRepository.delete(id),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
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
  const favoriteService = usePromptFavoriteService();
  
  return useMutation({
    mutationFn: ({ id, currentState }: { id: string; currentState: boolean }) =>
      favoriteService.toggleFavorite(id, currentState),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
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
  const duplicationService = usePromptDuplicationService();
  const variableRepository = useVariableRepository();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (promptId: string) => {
      if (!user) throw new Error("Non authentifié");
      return duplicationService.duplicate(user.id, promptId, variableRepository);
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
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
  const visibilityService = usePromptVisibilityService();
  const promptMessages = usePromptMessages();

  return useMutation({
    mutationFn: ({ 
      id, 
      currentVisibility, 
      publicPermission 
    }: { 
      id: string; 
      currentVisibility: "PRIVATE" | "SHARED";
      publicPermission?: "READ" | "WRITE";
    }) =>
      visibilityService.toggleVisibility(id, currentVisibility, publicPermission),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onMutate: async ({ id, currentVisibility, publicPermission }) => {
      await queryClient.cancelQueries({ queryKey: ["prompts"] });
      const previous = queryClient.getQueryData(["prompts"]);
      const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
      
      queryClient.setQueryData(["prompts"], (old: Prompt[] | undefined) =>
        old ? old.map(p => p.id === id ? { 
          ...p, 
          visibility: newVisibility,
          // Only force PUBLISHED when going public, preserve status when returning to private
          ...(newVisibility === "SHARED" ? { status: "PUBLISHED" as const } : {}),
          // When going SHARED, set permission (fallback to READ); when PRIVATE, keep existing
          public_permission: newVisibility === "SHARED" ? (publicPermission || "READ") : p.public_permission
        } : p) : old
      );
      
      return { previous };
    },
    onSuccess: (newVisibility) => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      if (newVisibility === "SHARED") {
        promptMessages.showVisibilityShared();
      } else {
        promptMessages.showVisibilityPrivate();
      }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["prompts"], context?.previous);
      errorToast(messages.labels.error, getSafeErrorMessage(err));
    },
  });
}

// Hook pour mettre à jour uniquement le niveau de permission publique
export function useUpdatePublicPermission() {
  const queryClient = useQueryClient();
  const visibilityService = usePromptVisibilityService();
  const promptMessages = usePromptMessages();

  return useMutation({
    mutationFn: ({ id, permission }: { id: string; permission: "READ" | "WRITE" }) =>
      visibilityService.updatePublicPermission(id, permission),
    onMutate: async ({ id, permission }) => {
      await queryClient.cancelQueries({ queryKey: ["prompts"] });
      const previous = queryClient.getQueryData(["prompts"]);
      
      queryClient.setQueryData(["prompts"], (old: Prompt[] | undefined) =>
        old ? old.map(p => p.id === id ? { ...p, public_permission: permission } : p) : old
      );
      
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      promptMessages.showPublicPermissionUpdated();
    },
    onError: (err: any, variables, context) => {
      queryClient.setQueryData(["prompts"], context?.previous);
      if (err.message === "PERMISSION_UPDATE_ON_PRIVATE_PROMPT") {
        promptMessages.showCannotUpdatePrivateError();
      } else {
        errorToast(messages.labels.error, getSafeErrorMessage(err));
      }
    },
  });
}
