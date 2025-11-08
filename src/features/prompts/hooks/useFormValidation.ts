import { useState, useEffect, useCallback } from "react";
import { promptSchema } from "@/lib/validation";
import type { ZodError } from "zod";

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

/**
 * Hook responsable de la validation Zod du formulaire
 * Responsabilité unique : valider les données avec Zod
 */
export function useFormValidation(formData: FormData) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validate = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    
    try {
      promptSchema.parse({
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        visibility: "PRIVATE",
      });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as ZodError;
        zodError.errors.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  }, [formData]);

  // Auto-validation on change
  useEffect(() => {
    // Ne valider que si au moins un champ est rempli
    if (formData.title || formData.description || formData.content || formData.tags.length > 0) {
      validate();
    }
  }, [formData.title, formData.description, formData.content, formData.tags, validate]);

  const isFormValid = Object.keys(validationErrors).length === 0 && 
                      formData.title.trim() !== "" && 
                      formData.content.trim() !== "";

  return {
    validationErrors,
    validate,
    isFormValid,
  };
}
