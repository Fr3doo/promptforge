import { useMemo } from "react";
import type { Prompt } from "../types";

interface FormData {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

/**
 * Hook responsable de la détection des changements non sauvegardés
 * Responsabilité unique : détecter les modifications par rapport à l'état initial
 */
export function useFormChangeDetector(
  currentData: FormData,
  originalPrompt?: Prompt,
  isEditMode?: boolean
) {
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditMode) {
      // En mode création : vérifier si au moins un champ est rempli
      return currentData.title.trim() !== "" || 
             currentData.description.trim() !== "" || 
             currentData.content.trim() !== "" || 
             currentData.tags.length > 0;
    } else if (originalPrompt) {
      // En mode édition : comparer avec les valeurs initiales
      return currentData.title !== originalPrompt.title ||
             currentData.description !== (originalPrompt.description ?? "") ||
             currentData.content !== originalPrompt.content ||
             JSON.stringify(currentData.tags) !== JSON.stringify(originalPrompt.tags || []);
    }
    return false;
  }, [currentData, originalPrompt, isEditMode]);

  return { hasUnsavedChanges };
}
