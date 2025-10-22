import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePromptShareRepository } from "@/contexts/PromptShareRepositoryContext";
import { successToast, errorToast } from "@/lib/toastUtils";
import { getSafeErrorMessage } from "@/lib/errorHandler";

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

  return useMutation({
    mutationFn: async ({
      email,
      permission,
    }: {
      email: string;
      permission: "READ" | "WRITE";
    }) => {
      // Get user ID from email
      const userData = await repository.getUserByEmail(email);
      if (!userData) {
        throw new Error("USER_NOT_FOUND");
      }

      // Create share
      await repository.addShare(promptId, userData.id, permission);
      return { email, permission };
    },
    onSuccess: ({ email, permission }) => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      successToast(
        "Prompt partagé",
        `Le prompt a été partagé avec ${email} en ${permission === "READ" ? "lecture seule" : "lecture/écriture"}`
      );
    },
    onError: (error: any) => {
      if (error.message === "USER_NOT_FOUND") {
        errorToast("Utilisateur introuvable", "Aucun utilisateur trouvé avec cet email");
      } else if (error.code === "23505") {
        errorToast("Déjà partagé", "Ce prompt est déjà partagé avec cet utilisateur");
      } else {
        errorToast("Erreur", getSafeErrorMessage(error));
      }
    },
  });
}

// Hook to delete a share
export function useDeletePromptShare(promptId: string) {
  const queryClient = useQueryClient();
  const repository = usePromptShareRepository();

  return useMutation({
    mutationFn: (shareId: string) => repository.deleteShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      successToast("Partage supprimé", "L'accès au prompt a été retiré");
    },
    onError: (error) => {
      errorToast("Erreur", getSafeErrorMessage(error));
    },
  });
}
