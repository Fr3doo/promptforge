import { useVariableManager } from "@/hooks/useVariableManager";
import { usePromptSave } from "@/hooks/usePromptSave";
import { usePromptMessages } from "./usePromptMessages";
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useFormDraft } from "./useFormDraft";
import { useFormChangeDetector } from "./useFormChangeDetector";
import type { Prompt, Variable } from "../types";

interface UsePromptFormOptions {
  prompt?: Prompt;
  existingVariables?: Variable[];
  isEditMode: boolean;
  canEdit?: boolean;
}

/**
 * Hook orchestrateur pour la gestion du formulaire de prompt
 * Compose les hooks spécialisés pour offrir une interface unifiée
 * 
 * Responsabilité : orchestrer la composition des hooks spécialisés
 */
export function usePromptForm({ 
  prompt, 
  existingVariables = [], 
  isEditMode, 
  canEdit = true 
}: UsePromptFormOptions) {
  // Messages centralisés
  const promptMessages = usePromptMessages();

  // 1. État du formulaire
  const formState = useFormState({ prompt, isEditMode });

  // 2. Validation
  const validation = useFormValidation({
    title: formState.title,
    description: formState.description,
    content: formState.content,
    tags: formState.tags,
  });

  // 3. Gestion des brouillons (uniquement en mode création)
  const draft = useFormDraft(
    {
      title: formState.title,
      description: formState.description,
      content: formState.content,
      tags: formState.tags,
    },
    !isEditMode
  );

  // 4. Détection des changements
  const changeDetector = useFormChangeDetector(
    {
      title: formState.title,
      description: formState.description,
      content: formState.content,
      tags: formState.tags,
    },
    prompt,
    isEditMode
  );

  // 5. Gestion des variables
  const { variables, addVariablesFromContent, updateVariable, deleteVariable } = useVariableManager({
    content: formState.content,
    initialVariables: existingVariables,
  });

  // 6. Sauvegarde avec callback pour nettoyer le brouillon
  const { savePrompt, isSaving } = usePromptSave({ 
    isEditMode,
    onSuccess: () => {
      // Supprimer le brouillon après enregistrement réussi (mode création uniquement)
      if (!isEditMode) {
        draft.clearSavedDraft();
      }
    }
  });

  // 7. Logique de sauvegarde
  const handleSave = async (promptId?: string, hasConflict?: boolean) => {
    // Valider avant de sauvegarder
    if (!validation.validate()) {
      return;
    }

    // Bloquer la sauvegarde si pas de permission d'édition
    if (!canEdit) {
      promptMessages.showNoEditPermission();
      return;
    }

    // Bloquer la sauvegarde en cas de conflit non résolu
    if (hasConflict) {
      promptMessages.showConflictDetected();
      return;
    }

    await savePrompt({
      title: formState.title,
      description: formState.description,
      content: formState.content,
      tags: formState.tags,
      visibility: "PRIVATE",
      variables,
    }, promptId);
  };

  return {
    // Form state
    title: formState.title,
    setTitle: formState.setTitle,
    description: formState.description,
    setDescription: formState.setDescription,
    content: formState.content,
    setContent: formState.setContent,
    tags: formState.tags,
    setTags: formState.setTags,
    variableValues: formState.variableValues,
    setVariableValues: formState.setVariableValues,
    
    // Variables
    variables,
    detectVariables: addVariablesFromContent,
    updateVariable,
    deleteVariable,
    
    // Validation
    validationErrors: validation.validationErrors,
    isFormValid: validation.isFormValid,
    
    // Actions
    handleSave,
    
    // Status
    isSaving,
    hasUnsavedChanges: changeDetector.hasUnsavedChanges,
  };
}
