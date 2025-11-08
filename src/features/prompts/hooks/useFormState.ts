import { useState, useEffect, useCallback } from "react";
import type { Prompt } from "../types";
import { loadDraft } from "./useDraftAutoSave";

interface UseFormStateOptions {
  prompt?: Prompt;
  isEditMode: boolean;
}

/**
 * Hook responsable de la gestion de l'état pur du formulaire
 * Responsabilité unique : gérer les valeurs des champs du formulaire
 */
export function useFormState({ prompt, isEditMode }: UseFormStateOptions) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // Initialize form with existing data or draft
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description ?? "");
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

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setContent("");
    setTags([]);
    setVariableValues({});
  }, []);

  return {
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    tags,
    setTags,
    variableValues,
    setVariableValues,
    resetForm,
  };
}
