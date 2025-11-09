import type { Validator, CompositeValidationResult, ValidationContext } from "./types";

/**
 * Compose plusieurs validateurs en un seul système de validation
 * Exécute les validateurs par ordre de priorité
 */
export async function composeValidators<T>(
  value: T,
  validators: Validator<T>[],
  context?: ValidationContext
): Promise<CompositeValidationResult> {
  // Trier par priorité (1 = haute, 10 = basse)
  const sortedValidators = [...validators].sort((a, b) => 
    (a.priority ?? 5) - (b.priority ?? 5)
  );
  
  const errors: Record<string, string> = {};
  const failedValidators: string[] = [];
  const metadata: Record<string, any> = {};
  
  for (const validator of sortedValidators) {
    const result = await validator.validate(value, context);
    
    if (!result.isValid) {
      failedValidators.push(validator.name);
      
      if (result.field) {
        errors[result.field] = result.error || "Validation échouée";
      }
      
      if (result.metadata) {
        Object.assign(metadata, result.metadata);
      }
      
      // Arrêter si le validateur demande stopOnFailure
      if (validator.stopOnFailure) {
        break;
      }
    }
  }
  
  return {
    isValid: failedValidators.length === 0,
    errors,
    failedValidators,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

/**
 * Compose plusieurs validateurs pour plusieurs champs
 * Utile pour valider un formulaire complet
 */
export async function composeFieldValidators(
  data: Record<string, any>,
  fieldValidators: Record<string, Validator<any>[]>,
  context?: ValidationContext
): Promise<CompositeValidationResult> {
  const allErrors: Record<string, string> = {};
  const allFailedValidators: string[] = [];
  const allMetadata: Record<string, any> = {};
  
  for (const [field, validators] of Object.entries(fieldValidators)) {
    const fieldValue = data[field];
    const result = await composeValidators(fieldValue, validators, {
      ...context,
      formData: data,
    });
    
    if (!result.isValid) {
      Object.assign(allErrors, result.errors);
      allFailedValidators.push(...result.failedValidators);
      
      if (result.metadata) {
        Object.assign(allMetadata, result.metadata);
      }
    }
  }
  
  return {
    isValid: allFailedValidators.length === 0,
    errors: allErrors,
    failedValidators: allFailedValidators,
    metadata: Object.keys(allMetadata).length > 0 ? allMetadata : undefined,
  };
}
