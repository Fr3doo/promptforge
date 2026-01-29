/**
 * Utilitaires pour la gestion des retry de mutations avec détection d'erreurs rejouables
 * 
 * Ce module centralise la logique de retry pour les mutations TanStack Query,
 * en distinguant les erreurs transitoires (réseau, timeout) des erreurs métier (RLS, validation).
 */

/**
 * Configuration par défaut pour les retry
 */
export const RETRY_CONFIG = {
  /** Nombre max de tentatives (3 essais au total) */
  MAX_ATTEMPTS: 3,
  
  /** Délai initial en ms (exponentiel: 1s, 2s, 4s) */
  INITIAL_DELAY: 1000,
  
  /** Délai maximum en ms (plafonné à 5s) */
  MAX_DELAY: 5000,
} as const;

/**
 * Codes d'erreur PostgreSQL non-rejouables
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const POSTGRES_UNRETRYABLE_CODES = new Set([
  '23505', // unique_violation (duplicate)
  '23503', // foreign_key_violation
  '23514', // check_violation
  '42501', // insufficient_privilege
  '42P01', // undefined_table
  '23502', // not_null_violation
]);

/**
 * Patterns de messages d'erreur non-rejouables
 */
const UNRETRYABLE_MESSAGE_PATTERNS = [
  'row-level security',
  'permission denied',
  'unauthorized',
  'invalid',
  'constraint',
  'violat',
  'not found',
  'already exists',
  'duplicate',
  'session_expired',      // Auth expiré
  'non authentifié',      // Auth manquant (FR)
  'not authenticated',    // Auth manquant (EN)
];

/**
 * Détermine si une erreur est rejouable (retry-safe)
 * 
 * @param error - Erreur capturée
 * @returns true si l'erreur est potentiellement transitoire (réseau, timeout)
 * 
 * ❌ NON-REJOUABLE :
 * - Erreurs de validation Zod
 * - Erreurs RLS/permissions PostgreSQL
 * - Contraintes d'unicité violées
 * - Erreurs métier (NOT_FOUND, ALREADY_EXISTS, etc.)
 * 
 * ✅ REJOUABLE :
 * - Erreurs réseau (fetch failed, network error)
 * - Timeouts
 * - Erreurs 5xx serveur (500, 502, 503, 504)
 * - Erreurs Supabase temporaires
 */
export function isRetryableError(error: any): boolean {
  // 1. Erreurs de validation Zod → NON-REJOUABLE
  if (error?.name === 'ZodError') return false;

  // 1b. Erreurs d'authentification → NON-REJOUABLE
  if (error?.name === 'UnauthenticatedError') return false;

  // 2. Codes PostgreSQL → NON-REJOUABLE
  const errorCode = error?.code;
  if (errorCode && POSTGRES_UNRETRYABLE_CODES.has(errorCode)) {
    return false;
  }

  // 3. Messages d'erreur métier → NON-REJOUABLE
  const errorMessage = (error?.message || '').toLowerCase();
  if (UNRETRYABLE_MESSAGE_PATTERNS.some(pattern => errorMessage.includes(pattern))) {
    return false;
  }

  // 4. Status HTTP 4xx (sauf 408 timeout, 429 rate-limit) → NON-REJOUABLE
  const status = error?.status;
  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }

  // 5. Erreurs réseau/timeout → REJOUABLE
  const isNetworkError = 
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound');

  if (isNetworkError) return true;

  // 6. Erreurs serveur 5xx → REJOUABLE
  if (status && status >= 500) return true;

  // 7. Par défaut, ne pas retenter (principe de précaution)
  return false;
}

/**
 * Calcule le délai avant le prochain retry (backoff exponentiel)
 * 
 * @param attemptNumber - Numéro de la tentative (1, 2, 3...)
 * @returns Délai en millisecondes
 * 
 * @example
 * getRetryDelay(1) // 1000ms (1s)
 * getRetryDelay(2) // 2000ms (2s)
 * getRetryDelay(3) // 4000ms (4s)
 * getRetryDelay(4) // 5000ms (plafonné)
 */
export function getRetryDelay(attemptNumber: number): number {
  const delay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(2, attemptNumber - 1);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY);
}

/**
 * Fonction de retry pour TanStack Query
 * 
 * @param failureCount - Nombre d'échecs consécutifs
 * @param error - Erreur capturée
 * @returns true si retry autorisé, false sinon
 * 
 * @example
 * useMutation({
 *   mutationFn: createPrompt,
 *   retry: shouldRetryMutation,
 *   retryDelay: getRetryDelay,
 * })
 */
export function shouldRetryMutation(failureCount: number, error: any): boolean {
  // Dépasser le nombre max de tentatives
  if (failureCount >= RETRY_CONFIG.MAX_ATTEMPTS) {
    return false;
  }

  // Vérifier si l'erreur est rejouable
  return isRetryableError(error);
}
