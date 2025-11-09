import type { Validator, ValidationResult } from "../types";

/**
 * Crée un validateur asynchrone (pour appels API, vérifications DB, etc.)
 */
export function createAsyncValidator<T>(
  name: string,
  asyncValidate: (value: T) => Promise<boolean>,
  errorMessage: string,
  options?: {
    field?: string;
    priority?: number;
    debounceMs?: number;
  }
): Validator<T> {
  let debounceTimer: NodeJS.Timeout | null = null;
  
  return {
    name: `async:${name}`,
    priority: options?.priority ?? 8, // Basse priorité (après validations synchrones)
    stopOnFailure: false,
    
    validate: async (value): Promise<ValidationResult> => {
      // Debounce optionnel (pour éviter trop d'appels API)
      if (options?.debounceMs) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        await new Promise(resolve => {
          debounceTimer = setTimeout(resolve, options.debounceMs);
        });
      }
      
      try {
        const isValid = await asyncValidate(value);
        
        if (!isValid) {
          return {
            isValid: false,
            error: errorMessage,
            field: options?.field,
          };
        }
        
        return { isValid: true };
      } catch (error) {
        console.error(`[${name}] Erreur de validation asynchrone:`, error);
        return {
          isValid: false,
          error: "Erreur lors de la validation",
          field: options?.field,
        };
      }
    },
  };
}
