import { messages } from "@/constants/messages";
import { logError } from "@/lib/logger";

// Export retry utilities for error handling
export { isRetryableError } from './network';

/**
 * Handles Supabase query results by throwing errors if present
 * Centralizes error handling to follow DRY principle
 * 
 * @param result - Supabase query result with data and error properties
 * @throws Error from Supabase if present
 * 
 * @example
 * ```typescript
 * const result = await supabase.from('table').select();
 * handleSupabaseError(result);
 * return result.data;
 * ```
 */
export function handleSupabaseError<T>(result: { data: T | null; error: any }): void {
  if (result.error) {
    throw result.error;
  }
}

/**
 * Mapping des codes d'erreur PostgreSQL vers des messages utilisateur
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  '23505': messages.errors.database.duplicate,
  '23503': messages.errors.database.invalidReference,
  '23514': messages.errors.database.constraintViolation,
  '42501': messages.errors.database.unauthorized,
} as const;

/**
 * Mapping des patterns de message d'erreur vers des messages utilisateur
 * Ordre important : les patterns sont vérifiés séquentiellement
 */
const ERROR_PATTERN_MESSAGES: ReadonlyArray<{
  pattern: string;
  message: string;
}> = [
  // Variables validation constraints (doivent être avant les patterns génériques)
  { pattern: 'variables_name_length', message: messages.errors.database.variableNameTooLong },
  { pattern: 'variables_default_value_length', message: messages.errors.database.variableDefaultTooLong },
  { pattern: 'variables_help_length', message: messages.errors.database.variableHelpTooLong },
  { pattern: 'variables_pattern_length', message: messages.errors.database.variablePatternTooLong },
  { pattern: 'variables_name_format', message: messages.errors.database.variableNameInvalid },
  { pattern: "nombre d'options ne peut pas dépasser", message: messages.errors.database.variableTooManyOptions },
  { pattern: 'option ne peut pas dépasser 100', message: messages.errors.database.variableOptionTooLong },
  { pattern: 'ne peut pas avoir plus de 50 variables', message: messages.errors.database.variableCountExceeded },
  
  // Patterns existants
  { pattern: 'row-level security', message: messages.errors.database.rlsViolation },
  { pattern: 'jwt', message: messages.errors.database.sessionExpired },
  { pattern: 'token', message: messages.errors.database.sessionExpired },
  { pattern: 'unique', message: messages.errors.database.uniqueViolation },
  { pattern: 'invalid email', message: messages.errors.database.invalidEmail },
  { pattern: 'invalid_grant', message: messages.errors.database.invalidEmail },
  { pattern: 'user already registered', message: messages.errors.database.userExists },
  { pattern: 'email not confirmed', message: messages.errors.database.emailNotConfirmed },
  { pattern: 'invalid password', message: messages.errors.database.invalidPassword },
] as const;

/**
 * Maps database and application errors to user-friendly messages
 * Prevents exposure of internal database structure and implementation details
 * 
 * @param error - Error object from Supabase or application
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await supabase.from('prompts').insert(data);
 * } catch (error) {
 *   const message = getSafeErrorMessage(error);
 *   toast.error(message);
 * }
 * ```
 */
export function getSafeErrorMessage(error: any): string {
  // Log full error for debugging
  logError('Error details', { 
    error: error instanceof Error ? error.message : String(error),
    code: error?.code,
    stack: error?.stack,
  });

  // 1. Handle Zod validation errors (specific format)
  if (error?.name === 'ZodError') {
    return error.errors?.[0]?.message || 'Données invalides';
  }

  // 2. Try to match by PostgreSQL error code
  const errorCode = error?.code;
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    return ERROR_CODE_MESSAGES[errorCode];
  }

  // 3. Try to match by error message pattern
  const errorMessage = error?.message?.toLowerCase() || '';
  if (errorMessage) {
    const matchedPattern = ERROR_PATTERN_MESSAGES.find(
      ({ pattern }) => errorMessage.includes(pattern)
    );
    if (matchedPattern) {
      return matchedPattern.message;
    }
  }

  // 4. Generic fallback
  return messages.errors.generic;
}
