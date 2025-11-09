import type { Validator, ValidationResult } from "../types";

/**
 * Validateur pour champs obligatoires
 */
export function createRequiredValidator(
  fieldName: string,
  errorMessage?: string
): Validator<string | null | undefined> {
  return {
    name: `required:${fieldName}`,
    priority: 1, // Haute priorité (vérifier en premier)
    stopOnFailure: true, // Arrêter si le champ est vide
    
    validate: (value): ValidationResult => {
      const trimmedValue = typeof value === "string" ? value.trim() : "";
      
      if (!trimmedValue) {
        return {
          isValid: false,
          error: errorMessage || `Le champ "${fieldName}" est requis`,
          field: fieldName,
        };
      }
      
      return { isValid: true };
    },
  };
}
