import { promptSchema, variableSchema } from "@/lib/validation";
import { extractZodError } from "@/lib/zodErrorUtils";
import type { Variable } from "@/features/prompts/types";

export interface ValidatedPromptData {
  title: string;
  description: string | null;
  content: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
}

export interface ValidationResult {
  isValid: boolean;
  promptData?: ValidatedPromptData;
  variables?: Array<{
    name: string;
    type: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM" | "MULTISTRING";
    required: boolean;
    default_value?: string;
    help?: string;
    pattern?: string;
    options?: string[];
  }>;
  error?: string;
}

/**
 * Hook pour valider les données de prompt et variables
 * Centralise TOUTE la logique de validation (évite duplication avec usePromptForm)
 */
export function usePromptValidation() {
  const validate = (data: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    visibility: "PRIVATE" | "SHARED";
    variables: Variable[];
  }): ValidationResult => {
    try {
      // Validation du prompt
      const validatedPromptData = promptSchema.parse({
        title: data.title,
        description: data.description,
        content: data.content,
        tags: data.tags,
        visibility: data.visibility,
      });

      // Validation des variables
      const validatedVariables = data.variables.map(v => {
        const validated = variableSchema.parse(v);
        return {
          name: validated.name,
          type: validated.type,
          required: validated.required,
          default_value: validated.default_value,
          help: validated.help,
          pattern: validated.pattern,
          options: validated.options,
        };
      });

      return {
        isValid: true,
        promptData: {
          title: validatedPromptData.title,
          description: validatedPromptData.description ?? null,
          content: validatedPromptData.content,
          tags: validatedPromptData.tags,
          visibility: validatedPromptData.visibility,
        },
        variables: validatedVariables,
      };
    } catch (error: unknown) {
      const zodError = extractZodError(error);
      if (zodError) {
        return {
          isValid: false,
          error: `${zodError.field}: ${zodError.message}`,
        };
      }
      return {
        isValid: false,
        error: "Données invalides",
      };
    }
  };

  return { validate };
}
