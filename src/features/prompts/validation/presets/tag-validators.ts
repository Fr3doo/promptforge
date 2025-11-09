import { tagSchema, TAG_CONSTRAINTS } from "@/lib/tagValidation";
import { createZodValidator } from "../validators/zod-validator";
import { createUniqueValidator } from "../validators/unique-validator";
import type { Validator } from "../types";

/**
 * Validateurs pour tags
 */
export const tagValidators = {
  // Validation Zod (format, longueur)
  format: createZodValidator("tag", tagSchema, { priority: 2 }),
  
  // Unicité
  unique: createUniqueValidator<string>(
    "tags",
    (context) => (context?.formData?.tags || []) as string[],
    (a, b) => a.toLowerCase() === b.toLowerCase() // Case-insensitive
  ),
  
  // Limite de nombre (si besoin de validation individuelle)
  maxCount: {
    name: "maxCount:tags",
    priority: 1,
    validate: (value: string, context) => {
      const existingTags = (context?.formData?.tags || []) as string[];
      
      if (existingTags.length >= TAG_CONSTRAINTS.MAX_COUNT) {
        return {
          isValid: false,
          error: `Vous ne pouvez pas avoir plus de ${TAG_CONSTRAINTS.MAX_COUNT} tags`,
          field: "tags",
        };
      }
      
      return { isValid: true };
    },
  } as Validator<string>,
};

/**
 * Preset pour valider l'ajout d'un tag
 */
export function getTagValidators(): Validator<string>[] {
  return [
    tagValidators.maxCount,
    tagValidators.format,
    tagValidators.unique,
  ];
}
