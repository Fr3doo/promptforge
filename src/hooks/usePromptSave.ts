import { usePromptValidation } from "./prompt-save/usePromptValidation";
import { usePromptPermissionCheck } from "./prompt-save/usePromptPermissionCheck";
import { useConflictHandler } from "./prompt-save/useConflictHandler";
import { usePromptMutations } from "./prompt-save/usePromptMutations";
import { useInitialVersionCreator } from "./prompt-save/useInitialVersionCreator";
import { usePromptSaveErrorHandler } from "./prompt-save/usePromptSaveErrorHandler";
import { useRetryCounter } from "./useRetryCounter";
import type { Variable } from "@/features/prompts/types";

interface UsePromptSaveOptions {
  isEditMode: boolean;
  onSuccess?: () => void;
  promptId?: string;
  clientUpdatedAt?: string;
}

interface PromptSaveData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
  variables: Variable[];
}

/**
 * Hook orchestrateur pour sauvegarder un prompt
 * COMPOSITION de 7 hooks spécialisés (SRP + KISS + Murphy)
 * 
 * Avant : 251 lignes, complexité cyclomatique >15
 * Après : ~90 lignes, complexité cyclomatique <5
 * 
 * @remarks
 * Intègre useRetryCounter pour limiter les tentatives de retry manuels
 * à MAX_ATTEMPTS (3 par défaut), conformément à la Loi de Murphy.
 */
export function usePromptSave({
  isEditMode,
  onSuccess,
  promptId,
  clientUpdatedAt,
}: UsePromptSaveOptions = { isEditMode: false }) {
  // Composition des hooks spécialisés
  const { validate } = usePromptValidation();
  const { checkPermission } = usePromptPermissionCheck(promptId);
  const { checkConflict } = useConflictHandler(promptId, clientUpdatedAt);
  const { create, update, isSaving } = usePromptMutations();
  const { createInitialVersion } = useInitialVersionCreator();
  const { handleError } = usePromptSaveErrorHandler();
  
  // Compteur de retry pour limiter les tentatives (Loi de Murphy)
  const { canRetry, incrementAndRetry, reset } = useRetryCounter();

  const savePrompt = async (data: PromptSaveData, promptId?: string) => {
    // Reset du compteur de retry au début d'une nouvelle tentative utilisateur
    reset();

    // Étape 1 : Validation des données
    const validationResult = validate(data);
    if (!validationResult.isValid) {
      handleError({ message: validationResult.error }, "CREATE");
      return;
    }

    const { promptData, variables } = validationResult;
    if (!promptData || !variables) return;

    // Étape 2 : Vérification des permissions (mode édition uniquement)
    if (isEditMode && promptId) {
      const permissionResult = checkPermission();
      if (!permissionResult.canSave) {
        handleError({ code: "PGRST116" }, "UPDATE");
        return;
      }

      // Étape 3 : Vérification des conflits (async)
      const conflictResult = await checkConflict();
      if (conflictResult.hasConflict) {
        return; // Toast déjà affiché par useConflictHandler
      }
    }

    // Étape 4 : Sauvegarde (create ou update)
    if (isEditMode && promptId) {
      // Mode édition
      update(promptId, promptData, variables, {
        onSuccess,
        onError: (error) => {
          handleError(error, "UPDATE", {
            retry: () => incrementAndRetry(() => savePrompt(data, promptId)),
            canRetry: canRetry(),
          });
        },
      });
    } else {
      // Mode création
      create(promptData, variables, {
        onCreateSuccess: async (newPromptId) => {
          // Créer la version initiale avec le promptId généré
          await createInitialVersion({
            promptId: newPromptId,
            content: promptData.content,
            variables: variables || [],
          });
        },
        onSuccess,
        onError: (error) => {
          handleError(error, "CREATE", {
            retry: () => incrementAndRetry(() => savePrompt(data)),
            canRetry: canRetry(),
          });
        },
      });
    }
  };

  return {
    savePrompt,
    isSaving,
  };
}
