import { useState, useCallback } from "react";
import { z } from "zod";
import { TAG_CONSTRAINTS, tagSchema } from "@/lib/tagValidation";

export function useTagManager(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  const addTag = useCallback(() => {
    setTagError(null);

    // Validation: champ vide
    if (!tagInput.trim()) {
      return;
    }

    // Validation: nombre maximum de tags
    if (tags.length >= TAG_CONSTRAINTS.MAX_COUNT) {
      setTagError(`Vous ne pouvez pas avoir plus de ${TAG_CONSTRAINTS.MAX_COUNT} tags`);
      return;
    }

    // Validation: tag déjà présent
    const trimmedTag = tagInput.trim();
    if (tags.includes(trimmedTag)) {
      setTagError("Ce tag existe déjà");
      return;
    }

    // Validation: format du tag
    try {
      tagSchema.parse(trimmedTag);
      setTags([...tags, trimmedTag]);
      setTagInput("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setTagError(error.errors[0]?.message || "Tag invalide");
      }
    }
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
