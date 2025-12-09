import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePrompt } from "@/hooks/usePrompts";
import { usePromptShares } from "@/hooks/usePromptShares";

export type PermissionLevel = "OWNER" | "READ" | "WRITE" | null;

export interface PromptPermission {
  permission: PermissionLevel;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canCreateVersion: boolean;
  isOwner: boolean;
}

/**
 * Hook pour déterminer les permissions de l'utilisateur sur un prompt
 * 
 * Ordre de priorité :
 * 1. Propriétaire (owner_id) → OWNER (toutes permissions)
 * 2. Partage privé (prompt_shares) → READ ou WRITE
 * 3. Partage public (visibility=SHARED) → public_permission (READ ou WRITE)
 * 4. Aucun accès → null
 */
export function usePromptPermission(promptId: string | undefined): PromptPermission {
  const { user } = useAuth();
  const { data: prompt } = usePrompt(promptId);
  const { data: shares = [] } = usePromptShares(promptId);

  return useMemo(() => {
    // Pas de prompt chargé ou pas d'utilisateur
    if (!prompt || !user) {
      return {
        permission: null,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canCreateVersion: false,
        isOwner: false,
      };
    }

    // 1. Vérifier si propriétaire
    const isOwner = prompt.owner_id === user.id;
    if (isOwner) {
      return {
        permission: "OWNER",
        canEdit: true,
        canDelete: true,
        canShare: true,
        canCreateVersion: true,
        isOwner: true,
      };
    }

    // 2. Vérifier partage privé
    const userShare = shares.find(s => s.shared_with_user_id === user.id);
    if (userShare) {
      const isWrite = userShare.permission === "WRITE";
      return {
        permission: userShare.permission,
        canEdit: isWrite,
        canDelete: false,
        canShare: false,
        canCreateVersion: isWrite, // Seulement en WRITE
        isOwner: false,
      };
    }

    // 3. Vérifier partage public (seulement si PUBLISHED - cohérent avec RLS)
    if (prompt.visibility === "SHARED" && prompt.status === "PUBLISHED") {
      const isWrite = prompt.public_permission === "WRITE";
      return {
        permission: prompt.public_permission || "READ",
        canEdit: isWrite,
        canDelete: false,
        canShare: false,
        canCreateVersion: isWrite, // Seulement en WRITE
        isOwner: false,
      };
    }

    // 4. Aucun accès
    return {
      permission: null,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canCreateVersion: false,
      isOwner: false,
    };
  }, [prompt, user, shares]);
}
