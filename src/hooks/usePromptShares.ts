import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePromptShareRepository } from "@/contexts/PromptShareRepositoryContext";
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { shouldRetryMutation, getRetryDelay } from "@/lib/network";

// Hook to fetch shares for a prompt
export function usePromptShares(promptId: string | undefined) {
  const repository = usePromptShareRepository();

  return useQuery({
    queryKey: ["prompt-shares", promptId],
    queryFn: () => {
      if (!promptId) throw new Error("Prompt ID requis");
      return repository.getShares(promptId);
    },
    enabled: !!promptId,
  });
}

// Hook to add a share
export function useAddPromptShare(promptId: string) {
  const queryClient = useQueryClient();
  const repository = usePromptShareRepository();
  const promptMessages = usePromptMessages();

  return useMutation({
    mutationFn: async ({
      email,
      permission,
    }: {
      email: string;
      permission: "READ" | "WRITE";
    }) => {
      // Normaliser l'email : trim + lowercase pour cohérence avec la RPC
      const normalizedEmail = email.trim().toLowerCase();
      
      // Get user ID from email
      const userData = await repository.getUserByEmail(normalizedEmail);
      if (!userData) {
        throw new Error("USER_NOT_FOUND");
      }

      // Create share
      await repository.addShare(promptId, userData.id, permission);
      return { email: normalizedEmail, permission };
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: ({ email, permission }) => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      promptMessages.showShareAdded(email, permission);
    },
    onError: (error: any) => {
      if (error.message === "USER_NOT_FOUND") {
        promptMessages.showUserNotFoundError();
      } else if (error.message === "SELF_SHARE") {
        promptMessages.showSelfShareError();
      } else if (error.message === "NOT_PROMPT_OWNER") {
        promptMessages.showNotOwnerError();
      } else if (error.message === "SESSION_EXPIRED") {
        promptMessages.showSessionExpired();
      } else if (error.code === "23505") {
        promptMessages.showAlreadySharedError();
      } else {
        promptMessages.showGenericError(getSafeErrorMessage(error));
      }
    },
  });
}

// Hook to update a share permission
export function useUpdatePromptShare(promptId: string) {
  const queryClient = useQueryClient();
  const repository = usePromptShareRepository();
  const promptMessages = usePromptMessages();

  return useMutation({
    mutationFn: async ({ shareId, permission }: { shareId: string; permission: "READ" | "WRITE" }) => {
      await repository.updateSharePermission(shareId, permission);
    },
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      promptMessages.showSharePermissionUpdated();
    },
    onError: (error: any) => {
      if (error.message === "SHARE_NOT_FOUND") {
        promptMessages.showShareNotFoundError();
      } else if (error.message === "UNAUTHORIZED_UPDATE") {
        promptMessages.showUnauthorizedUpdateError();
      } else if (error.message === "SESSION_EXPIRED") {
        promptMessages.showSessionExpired();
      } else {
        promptMessages.showGenericError(getSafeErrorMessage(error));
      }
    },
  });
}

// Hook to delete a share
export function useDeletePromptShare(promptId: string) {
  const queryClient = useQueryClient();
  const repository = usePromptShareRepository();
  const promptMessages = usePromptMessages();

  return useMutation({
    mutationFn: (shareId: string) => repository.deleteShare(shareId),
    retry: shouldRetryMutation,
    retryDelay: getRetryDelay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      promptMessages.showShareDeleted();
    },
    onError: (error: any) => {
      if (error.message === "SHARE_NOT_FOUND") {
        promptMessages.showShareNotFoundError();
      } else if (error.message === "UNAUTHORIZED_DELETE") {
        promptMessages.showUnauthorizedDeleteError();
      } else if (error.message === "SESSION_EXPIRED") {
        promptMessages.showSessionExpired();
      } else {
        promptMessages.showGenericError(getSafeErrorMessage(error));
      }
    },
  });
}
