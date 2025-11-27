import { useState, useEffect, useCallback, useMemo } from "react";
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
  
  // Mémoriser les validateurs pour stabiliser la référence
  const validators = useMemo(() => ({
    ...getDefaultPromptValidators(),
    ...options?.customValidators,
  }), [options?.customValidators]);

  // Extraire les primitives pour des dépendances stables
  const { title, description, content, tags } = formData;
  const tagsKey = useMemo(() => JSON.stringify(tags), [tags]);

  const validate = useCallback(async (): Promise<boolean> => {
    const result = await composeFieldValidators(
      { title, description, content, tags },
      validators,
      options?.context
    );
    
    setValidationErrors(result.errors as ValidationErrors);
    return result.isValid;
  }, [title, description, content, tags, validators, options?.context]);

  // Auto-validation on change (optionnelle)
  useEffect(() => {
    if (options?.disableAutoValidation) return;
    
    // Ne valider que si au moins un champ est rempli
    if (title || description || content || tags.length > 0) {
      validate();
    }
  }, [title, description, content, tagsKey, validate, options?.disableAutoValidation]);

  const isFormValid = Object.keys(validationErrors).length === 0 && 
                      formData.title.trim() !== "" && 
                      formData.content.trim() !== "";

  return {
    validationErrors,
    validate,
    isFormValid,
  };
}
