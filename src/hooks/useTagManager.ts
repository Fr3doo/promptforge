import { useState, useCallback } from "react";
import { TAG_CONSTRAINTS } from "@/lib/tagValidation";
import { composeValidators } from "@/features/prompts/validation/compose";
import { getTagValidators } from "@/features/prompts/validation/presets/tag-validators";

export function useTagManager(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  const addTag = useCallback(async () => {
    setTagError(null);

    // Validation: champ vide
    if (!tagInput.trim()) {
      return;
    }

    // Validation avec système composable
    const trimmedTag = tagInput.trim();
    const validators = getTagValidators();
    
    const result = await composeValidators(trimmedTag, validators, {
      formData: { tags },
    });

    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      setTagError(firstError || "Tag invalide");
      return;
    }

    // Ajout du tag
    setTags([...tags, trimmedTag]);
    setTagInput("");
  }, [tagInput, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(tags.filter(t => t !== tag));
    setTagError(null);
  }, [tags]);

  const clearTagError = useCallback(() => {
    setTagError(null);
  }, []);

  return {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    tagError,
    clearTagError,
    maxTags: TAG_CONSTRAINTS.MAX_COUNT,
    maxTagLength: TAG_CONSTRAINTS.MAX_LENGTH,
  };
}
