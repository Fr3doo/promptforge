import type { Validator, ValidationResult, ValidationContext } from "../types";

/**
 * Validateur conditionnel : s'exécute seulement si une condition est remplie
 * Utile pour : "si visibility=SHARED, alors description obligatoire"
 */
export function createConditionalValidator<T>(
  name: string,
  condition: (context?: ValidationContext) => boolean,
  validator: Validator<T>
): Validator<T> {
  return {
    name: `conditional:${name}`,
    priority: validator.priority ?? 5,
    stopOnFailure: validator.stopOnFailure,
    
    validate: async (value, context): Promise<ValidationResult> => {
      // Si la condition n'est pas remplie, valider automatiquement
      if (!condition(context)) {
        return { isValid: true };
      }
      
      // Sinon, exécuter le validateur sous-jacent
      return validator.validate(value, context);
    },
  };
}
