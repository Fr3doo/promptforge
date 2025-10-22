import { useState, useEffect } from "react";
import { useTagManager } from "@/hooks/useTagManager";
import { useVariableManager } from "@/hooks/useVariableManager";
import { usePromptSave } from "@/hooks/usePromptSave";
import { errorToast } from "@/lib/toastUtils";
import { useDraftAutoSave, loadDraft, clearDraft } from "./useDraftAutoSave";
import type { Prompt, Variable } from "../types";

interface UsePromptFormOptions {
  prompt?: Prompt;
  existingVariables?: Variable[];
  isEditMode: boolean;
  canEdit?: boolean;
}

export function usePromptForm({ prompt, existingVariables = [], isEditMode, canEdit = true }: UsePromptFormOptions) {
  // Save logic with callback to clear draft on success
  const { savePrompt, isSaving } = usePromptSave({ 
    isEditMode,
    onSuccess: () => {
      // Supprimer le brouillon après enregistrement réussi (mode création uniquement)
      if (!isEditMode) {
        clearDraft();
      }
    }
  });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Tag management
  const { tags, setTags, tagInput, setTagInput, addTag, removeTag } = useTagManager();
  
  // Variable management
  const { variables, addVariablesFromContent, updateVariable, deleteVariable } = useVariableManager({
    content,
    initialVariables: existingVariables,
  });

  // Auto-sauvegarde locale (uniquement en mode création)
  useDraftAutoSave({
    title,
    description,
    content,
    tags,
    enabled: !isEditMode,
  });

  // Initialize form with existing data
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setTags(prompt.tags || []);
    } else if (!isEditMode) {
      // En mode création, charger le brouillon s'il existe
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title);
        setDescription(draft.description);
        setContent(draft.content);
        setTags(draft.tags);
      }
    }
  }, [prompt, isEditMode]);


  const handleSave = async (promptId?: string, hasConflict?: boolean) => {
    // Bloquer la sauvegarde si pas de permission d'édition
    if (!canEdit) {
      errorToast(
        "Action interdite",
        "Vous n'avez pas la permission de modifier ce prompt. Contactez le propriétaire pour obtenir l'accès en écriture."
      );
      return;
    }

    // Bloquer la sauvegarde en cas de conflit non résolu
    if (hasConflict) {
      errorToast(
        "Conflit détecté",
        "Veuillez recharger le prompt pour obtenir la dernière version avant de sauvegarder."
      );
      return;
    }

    await savePrompt({
      title,
      description,
      content,
      tags,
      visibility: "PRIVATE",
      variables,
    }, promptId);
  };



  // Détecter les changements non sauvegardés
  const hasUnsavedChanges = () => {
    if (!isEditMode) {
      // En mode création : vérifier si au moins un champ est rempli
      return title.trim() !== "" || 
             description.trim() !== "" || 
             content.trim() !== "" || 
             tags.length > 0;
    } else if (prompt) {
      // En mode édition : comparer avec les valeurs initiales
      return title !== prompt.title ||
             description !== (prompt.description || "") ||
             content !== prompt.content ||
             JSON.stringify(tags) !== JSON.stringify(prompt.tags || []);
    }
    return false;
  };

  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    tags,
    tagInput,
    setTagInput,
    variables,
    variableValues,
    setVariableValues,
    
    // Actions
    handleSave,
    addTag,
    removeTag,
    detectVariables: addVariablesFromContent,
    updateVariable,
    deleteVariable,
    
    // Status
    isSaving,
    hasUnsavedChanges: hasUnsavedChanges(),
  };
}
