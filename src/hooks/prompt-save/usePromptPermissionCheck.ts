import { usePromptPermission } from "@/hooks/usePromptPermission";
import { useAuth } from "@/hooks/useAuth";
import { usePrompt } from "@/hooks/usePrompts";

export interface PermissionCheckResult {
  canSave: boolean;
  reason?: "NOT_OWNER" | "NO_WRITE_ACCESS" | "NO_USER" | "NO_PROMPT";
}

/**
 * Hook pour vérifier les permissions de sauvegarde
 * RÉUTILISE usePromptPermission (évite duplication de logique)
 */
export function usePromptPermissionCheck(promptId?: string) {
  const { user } = useAuth();
  const { data: prompt } = usePrompt(promptId);
  const { canEdit, isOwner } = usePromptPermission(promptId);

  const checkPermission = (): PermissionCheckResult => {
    // Pas d'utilisateur connecté
    if (!user) {
      return { canSave: false, reason: "NO_USER" };
    }

    // Mode création (pas de promptId) → toujours autorisé
    if (!promptId) {
      return { canSave: true };
    }

    // Prompt pas encore chargé
    if (!prompt) {
      return { canSave: false, reason: "NO_PROMPT" };
    }

    // Utilise la logique centralisée de usePromptPermission
    if (!canEdit && !isOwner) {
      return { canSave: false, reason: "NO_WRITE_ACCESS" };
    }

    return { canSave: true };
  };

  return { checkPermission, canEdit, isOwner };
}
