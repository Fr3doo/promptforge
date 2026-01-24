/**
 * Utilities for URL and redirect path validation to prevent Open Redirect vulnerabilities.
 * @module urlSecurity
 */

/**
 * Valide et sanitize un chemin de redirection pour prévenir les Open Redirects.
 *
 * Bloque :
 * - URLs absolues avec schéma (http://, https://, javascript:, data:)
 * - URLs scheme-relative (//evil.com)
 * - Chemins non internes (ne commençant pas par /)
 * - Contournements connus (/\, caractères de contrôle)
 *
 * @param input - Chemin potentiellement non fiable
 * @param fallback - Valeur de repli si input invalide (défaut: "/")
 * @returns Chemin sécurisé ou fallback
 *
 * @example
 * safeRedirectPath("//evil.com")        // "/"
 * safeRedirectPath("javascript:alert") // "/"
 * safeRedirectPath("/dashboard")        // "/dashboard"
 * safeRedirectPath("/prompts?id=123")   // "/prompts?id=123"
 */
export function safeRedirectPath(
  input: string | null | undefined,
  fallback: string = '/'
): string {
  // Valeur nulle/undefined → fallback
  if (!input) return fallback;

  // Trim pour éviter les espaces malicieux
  const trimmed = input.trim();

  // Chaîne vide après trim → fallback
  if (!trimmed) return fallback;

  // Bloquer les URLs avec schéma (http:, https:, javascript:, data:, etc.)
  if (trimmed.includes('://')) return fallback;

  // Bloquer les URLs scheme-relative (//evil.com)
  if (trimmed.startsWith('//')) return fallback;

  // Exiger un chemin interne absolu
  if (!trimmed.startsWith('/')) return fallback;

  // Bloquer les contournements connus
  if (
    trimmed.startsWith('/\\') || // Backslash confusion
    trimmed.includes('\n') || // Newline injection
    trimmed.includes('\r') || // Carriage return injection
    trimmed.includes('\0') // Null byte injection
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Vérifie si un chemin de redirection est sécurisé (sans fallback).
 *
 * @param input - Chemin à vérifier
 * @returns true si le chemin est valide et sécurisé
 *
 * @example
 * isValidRedirectPath("/dashboard")  // true
 * isValidRedirectPath("//evil.com")  // false
 */
export function isValidRedirectPath(input: string | null | undefined): boolean {
  if (!input) return false;
  return safeRedirectPath(input, '__INVALID__') !== '__INVALID__';
}
