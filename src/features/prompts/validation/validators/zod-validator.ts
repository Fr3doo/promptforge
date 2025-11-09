import { z, ZodSchema, ZodError } from "zod";
import type { Validator, ValidationResult } from "../types";

/**
 * Crée un validateur à partir d'un schéma Zod
 * Permet de réutiliser les schémas existants (promptSchema, variableSchema)
 */
export function createZodValidator<T>(
  name: string,
  schema: ZodSchema<T>,
  options?: {
    field?: string;
    priority?: number;
    stopOnFailure?: boolean;
  }
): Validator<T> {
  return {
    name: `zod:${name}`,
    priority: options?.priority ?? 5,
    stopOnFailure: options?.stopOnFailure ?? false,
    
    validate: (value: T): ValidationResult => {
      try {
        schema.parse(value);
        return { isValid: true };
      } catch (error) {
        if (error instanceof ZodError) {
          const firstError = error.errors[0];
          return {
            isValid: false,
            error: firstError.message,
            field: options?.field || (firstError.path[0]?.toString() ?? ""),
          };
        }
        return {
          isValid: false,
          error: "Validation échouée",
          field: options?.field,
        };
      }
    },
  };
}
