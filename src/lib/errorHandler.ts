import { messages } from "@/constants/messages";
import { logError } from "@/lib/logger";

export { isRetryableError } from './network';

/**
 * Handles Supabase query results by throwing errors if present
 * Centralizes error handling to follow DRY principle
 */
export function handleSupabaseError<T>(result: { data: T | null; error: any }): void {
  if (result.error) {
    throw result.error;
  }
}

/**
 * Maps database and application errors to user-friendly messages
 * Maintenant extensible via messages.ts (principe OCP)
 * Pour ajouter un nouveau code d'erreur, modifiez uniquement messages.ts
 */
export function getSafeErrorMessage(error: any): string {
  logError('Error details', { 
    error: error instanceof Error ? error.message : String(error),
    code: error?.code,
    stack: error?.stack,
  });

  // 1. Handle Zod validation errors
  if (error?.name === 'ZodError') {
    return error.errors?.[0]?.message || 'Données invalides';
  }

  // 2. Try to match by PostgreSQL error code
  const errorCode = error?.code;
  if (errorCode && messages.errors.database.codes?.[errorCode]) {
    return messages.errors.database.codes[errorCode];
  }

  // 3. Try to match by error message pattern
  const errorMessage = error?.message?.toLowerCase() || '';
  if (errorMessage) {
    const matchedPattern = messages.errors.database.patterns?.find(
      ({ pattern }) => errorMessage.includes(pattern.toLowerCase())
    );
    if (matchedPattern) {
      return matchedPattern.message;
    }
  }

  // 4. Generic fallback
  return messages.errors.generic;
}
