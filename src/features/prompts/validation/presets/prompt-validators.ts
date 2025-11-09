import { promptSchema } from "@/lib/validation";
import { PROMPT_LIMITS } from "@/constants/validation-limits";
import { createZodValidator } from "../validators/zod-validator";
import { createRequiredValidator } from "../validators/required-field-validator";
import { createLengthValidator } from "../validators/length-validator";
import { createConditionalValidator } from "../validators/conditional-validator";
import type { Validator } from "../types";

/**
 * Validateurs par défaut pour les prompts
 * Exportables et composables selon les besoins
 */
export const promptValidators = {
  // Validation complète avec Zod (backup si validateurs custom échouent)
  zodFull: createZodValidator("prompt", promptSchema, { priority: 10 }),
  
  // Validateurs granulaires
  title: {
    required: createRequiredValidator("title", "Le titre est requis"),
    length: createLengthValidator("title", {
      min: PROMPT_LIMITS.TITLE.MIN,
      max: PROMPT_LIMITS.TITLE.MAX,
    }),
  },
  
  description: {
    length: createLengthValidator("description", {
      max: PROMPT_LIMITS.DESCRIPTION.MAX,
    }),
    // Exemple : description obligatoire si visibility = SHARED
    requiredIfPublic: createConditionalValidator(
      "description-public",
      (context) => context?.formData?.visibility === "SHARED",
      createRequiredValidator("description", "La description est requise pour les prompts publics")
    ),
  },
  
  content: {
    required: createRequiredValidator("content", "Le contenu est requis"),
    length: createLengthValidator("content", {
      min: PROMPT_LIMITS.CONTENT.MIN,
      max: PROMPT_LIMITS.CONTENT.MAX,
    }),
  },
};

/**
 * Preset complet pour validation de prompt
 * Utilise tous les validateurs nécessaires
 */
export function getDefaultPromptValidators(): Record<string, Validator<any>[]> {
  return {
    title: [
      promptValidators.title.required,
      promptValidators.title.length,
    ],
    description: [
      promptValidators.description.length,
      // promptValidators.description.requiredIfPublic, // Désactivé par défaut
    ],
    content: [
      promptValidators.content.required,
      promptValidators.content.length,
    ],
  };
}
