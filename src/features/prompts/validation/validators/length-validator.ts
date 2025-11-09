import type { Validator, ValidationResult } from "../types";

export interface LengthConstraints {
  min?: number;
  max?: number;
}

/**
 * Validateur pour contraintes de longueur
 */
export function createLengthValidator(
  fieldName: string,
  constraints: LengthConstraints
): Validator<string> {
  return {
    name: `length:${fieldName}`,
    priority: 3,
    
    validate: (value): ValidationResult => {
      const length = value?.length ?? 0;
      
      if (constraints.min !== undefined && length < constraints.min) {
        return {
          isValid: false,
          error: `Le champ "${fieldName}" doit contenir au moins ${constraints.min} caractères`,
          field: fieldName,
        };
      }
      
      if (constraints.max !== undefined && length > constraints.max) {
        return {
          isValid: false,
          error: `Le champ "${fieldName}" ne peut pas dépasser ${constraints.max} caractères`,
          field: fieldName,
        };
      }
      
      return { isValid: true };
    },
  };
}
