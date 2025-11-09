import { useState, useEffect, useCallback } from "react";
import { composeFieldValidators } from "../validation/compose";
import { getDefaultPromptValidators } from "../validation/presets/prompt-validators";
import type { Validator, ValidationContext } from "../validation/types";

interface ValidationErrors {
  title?: string;
  description?: string;
  content?: string;
  tags?: string;
}

interface FormData {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

interface UseFormValidationOptions {
  /** Validateurs custom (optionnel) */
  customValidators?: Record<string, Validator<any>[]>;
  
  /** Contexte de validation (optionnel) */
  context?: ValidationContext;
  
  /** Désactiver auto-validation */
  disableAutoValidation?: boolean;
}

/**
 * Hook de validation extensible selon le principe OCP
 * Peut être utilisé avec les validateurs par défaut OU des validateurs custom
 */
export function useFormValidation(
  formData: FormData,
  options?: UseFormValidationOptions
) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Fusionner validateurs par défaut et custom
  const validators = {
    ...getDefaultPromptValidators(),
    ...options?.customValidators,
  };

  const validate = useCallback(async (): Promise<boolean> => {
    const result = await composeFieldValidators(
      formData,
      validators,
      options?.context
    );
    
    setValidationErrors(result.errors as ValidationErrors);
    return result.isValid;
  }, [formData, validators, options?.context]);

  // Auto-validation on change (optionnelle)
  useEffect(() => {
    if (options?.disableAutoValidation) return;
    
    // Ne valider que si au moins un champ est rempli
    if (formData.title || formData.description || formData.content || formData.tags.length > 0) {
      validate();
    }
  }, [formData, validate, options?.disableAutoValidation]);

  const isFormValid = Object.keys(validationErrors).length === 0 && 
                      formData.title.trim() !== "" && 
                      formData.content.trim() !== "";

  return {
    validationErrors,
    validate,
    isFormValid,
  };
}
