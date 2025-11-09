import type { Validator, ValidationResult, ValidationContext } from "../types";

/**
 * Validateur pour unicité dans une liste
 * Utilisé pour les tags, les options ENUM, etc.
 */
export function createUniqueValidator<T>(
  fieldName: string,
  getExistingItems: (context?: ValidationContext) => T[],
  equals?: (a: T, b: T) => boolean
): Validator<T> {
  const defaultEquals = (a: T, b: T) => a === b;
  const equalsFn = equals || defaultEquals;
  
  return {
    name: `unique:${fieldName}`,
    priority: 4,
    
    validate: (value, context): ValidationResult => {
      const existingItems = getExistingItems(context);
      
      const isDuplicate = existingItems.some(item => equalsFn(item, value));
      
      if (isDuplicate) {
        return {
          isValid: false,
          error: `Cette valeur existe déjà dans "${fieldName}"`,
          field: fieldName,
        };
      }
      
      return { isValid: true };
    },
  };
}
