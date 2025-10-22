import { useState, useCallback } from "react";
import { z } from "zod";

const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

const tagSchema = z.string()
  .trim()
  .min(1, "Le tag ne peut pas être vide")
  .max(MAX_TAG_LENGTH, `Le tag ne peut pas dépasser ${MAX_TAG_LENGTH} caractères`)
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Le tag ne peut contenir que des lettres, chiffres, espaces, tirets et underscores");

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
    if (tags.length >= MAX_TAGS) {
      setTagError(`Vous ne pouvez pas avoir plus de ${MAX_TAGS} tags`);
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
    maxTags: MAX_TAGS,
    maxTagLength: MAX_TAG_LENGTH,
  };
}
