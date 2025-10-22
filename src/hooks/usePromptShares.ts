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
    onSuccess: ({ email, permission }) => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      successToast(
        "Prompt partagé",
        `Le prompt a été partagé avec ${email} en ${permission === "READ" ? "lecture seule" : "lecture/écriture"}`
      );
    },
    onError: (error: any) => {
      if (error.message === "USER_NOT_FOUND") {
        errorToast(
          "Utilisateur introuvable", 
          "Cet email n'est pas encore inscrit. Invitez cet utilisateur à créer un compte pour pouvoir partager avec lui."
        );
      } else if (error.message === "SELF_SHARE") {
        errorToast(
          "Partage impossible", 
          "Vous ne pouvez pas partager un prompt avec vous-même"
        );
      } else if (error.message === "NOT_PROMPT_OWNER") {
        errorToast(
          "Action non autorisée", 
          "Seul le propriétaire du prompt peut le partager avec d'autres utilisateurs"
        );
      } else if (error.message === "SESSION_EXPIRED") {
        errorToast(
          "Session expirée", 
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else if (error.code === "23505") {
        errorToast("Déjà partagé", "Ce prompt est déjà partagé avec cet utilisateur");
      } else {
        errorToast("Erreur", getSafeErrorMessage(error));
      }
    },
  });
}

// Hook to update a share permission
export function useUpdatePromptShare(promptId: string) {
  const queryClient = useQueryClient();
  const repository = usePromptShareRepository();

  return useMutation({
    mutationFn: async ({ shareId, permission }: { shareId: string; permission: "READ" | "WRITE" }) => {
      await repository.updateSharePermission(shareId, permission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt-shares", promptId] });
      successToast("Permission mise à jour", "Le niveau d'accès a été modifié avec succès");
    },
    onError: (error: any) => {
      if (error.message === "SHARE_NOT_FOUND") {
        errorToast("Partage introuvable", "Ce partage n'existe plus ou a déjà été supprimé");
      } else if (error.message === "UNAUTHORIZED_UPDATE") {
        errorToast("Action non autorisée", "Vous n'êtes pas autorisé à modifier ce partage");
      } else if (error.message === "SESSION_EXPIRED") {
        errorToast("Session expirée", "Votre session a expiré. Veuillez vous reconnecter.");
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
    onError: (error: any) => {
      if (error.message === "SHARE_NOT_FOUND") {
        errorToast(
          "Partage introuvable", 
          "Ce partage n'existe plus ou a déjà été supprimé"
        );
      } else if (error.message === "UNAUTHORIZED_DELETE") {
        errorToast(
          "Action non autorisée", 
          "Vous n'avez pas les permissions nécessaires pour supprimer ce partage"
        );
      } else if (error.message === "SESSION_EXPIRED") {
        errorToast(
          "Session expirée", 
          "Votre session a expiré. Veuillez vous reconnecter."
        );
      } else {
        errorToast("Erreur", getSafeErrorMessage(error));
      }
    },
  });
}
