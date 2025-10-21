import { messages } from "@/constants/messages";

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
 * Maps database and application errors to user-friendly messages
 * Prevents exposure of internal database structure and implementation details
 */
export function getSafeErrorMessage(error: any): string {
  // Log full error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('Error details:', error);
  }

  // Handle Zod validation errors
  if (error?.name === 'ZodError') {
    return error.errors?.[0]?.message || 'Données invalides';
  }

  // Get error code and message safely
  const errorCode = error?.code;
  const errorMessage = error?.message?.toLowerCase() || '';

  // PostgreSQL error codes
  if (errorCode === '23505') return messages.errors.database.duplicate;
  if (errorCode === '23503') return messages.errors.database.invalidReference;
  if (errorCode === '23514') return messages.errors.database.constraintViolation;
  if (errorCode === '42501') return messages.errors.database.unauthorized;
  
  // Supabase/Auth specific errors
  if (errorMessage.includes('row-level security')) {
    return messages.errors.database.rlsViolation;
  }
  if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
    return messages.errors.database.sessionExpired;
  }
  if (errorMessage.includes('unique')) {
    return messages.errors.database.uniqueViolation;
  }
  if (errorMessage.includes('invalid email') || errorMessage.includes('invalid_grant')) {
    return messages.errors.database.invalidEmail;
  }
  if (errorMessage.includes('user already registered')) {
    return messages.errors.database.userExists;
  }
  if (errorMessage.includes('email not confirmed')) {
    return messages.errors.database.emailNotConfirmed;
  }
  if (errorMessage.includes('invalid password')) {
    return messages.errors.database.invalidPassword;
  }

  // Generic fallback
  return messages.errors.generic;
}
