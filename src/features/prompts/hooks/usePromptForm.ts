import { useState, useEffect } from "react";
import { useTagManager } from "@/hooks/useTagManager";
import { useVariableManager } from "@/hooks/useVariableManager";
import { usePromptSave } from "@/hooks/usePromptSave";
import { errorToast } from "@/lib/toastUtils";
import type { Prompt, Variable } from "../types";

interface UsePromptFormOptions {
  prompt?: Prompt;
  existingVariables?: Variable[];
  isEditMode: boolean;
  canEdit?: boolean;
}

export function usePromptForm({ prompt, existingVariables = [], isEditMode, canEdit = true }: UsePromptFormOptions) {
  // Save logic
  const { savePrompt, isSaving } = usePromptSave({ isEditMode });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Tag management
  const { tags, setTags, tagInput, setTagInput, addTag, removeTag } = useTagManager();
  
  // Variable management
  const { variables, addVariablesFromContent, updateVariable, deleteVariable } = useVariableManager({
    content,
    initialVariables: existingVariables,
  });

  // Initialize form with existing data
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setVisibility(prompt.visibility || "PRIVATE");
      setTags(prompt.tags || []);
    }
  }, [prompt]);


  const handleSave = async (promptId?: string) => {
    // Bloquer la sauvegarde si pas de permission d'édition
    if (!canEdit) {
      errorToast(
        "Action interdite",
        "Vous n'avez pas la permission de modifier ce prompt. Contactez le propriétaire pour obtenir l'accès en écriture."
      );
      return;
    }

    await savePrompt({
      title,
      description,
      content,
      tags,
      visibility,
      variables,
    }, promptId);
  };



  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    visibility,
    setVisibility,
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
  };
}
