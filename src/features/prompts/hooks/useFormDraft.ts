import { useCallback } from "react";
import { useDraftAutoSave, clearDraft } from "./useDraftAutoSave";

interface DraftData {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

/**
 * Hook responsable de la gestion des brouillons
 * Responsabilité unique : gérer le cycle de vie des brouillons (auto-save et clear)
 */
export function useFormDraft(formData: DraftData, enabled: boolean) {
  // Auto-sauvegarde locale (uniquement en mode création)
  useDraftAutoSave({
    title: formData.title,
    description: formData.description,
    content: formData.content,
    tags: formData.tags,
    enabled,
  });

  const clearSavedDraft = useCallback(() => {
    if (enabled) {
      clearDraft();
    }
  }, [enabled]);

  return { clearSavedDraft };
}
