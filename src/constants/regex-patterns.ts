/**
 * SINGLE SOURCE OF TRUTH - REGEX PATTERNS
 * =========================================
 * Tous les patterns de validation regex utilisés dans l'app
 */

// ============================================
// VARIABLE NAME PATTERNS
// ============================================

/**
 * Pattern strict pour noms de variables (formulaires utilisateur)
 * Autorise : a-z, A-Z, 0-9, underscore (_)
 * Interdit : tirets, espaces, caractères spéciaux
 */
export const VARIABLE_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Pattern permissif pour noms de variables (AI-generated)
 * Autorise : a-z, A-Z, 0-9, underscore (_), tiret (-)
 * Note : L'IA peut générer des tirets, on les accepte puis on les sanitize
 */
export const VARIABLE_NAME_AI_REGEX = /^[a-zA-Z0-9_-]+$/;

// ============================================
// VERSIONING PATTERNS
// ============================================

/**
 * Pattern Semantic Versioning (semver)
 * Format : MAJOR.MINOR.PATCH (ex: 1.0.0, 2.3.5)
 */
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

// ============================================
// CATEGORY PATTERNS (pour analyze-prompt AI)
// ============================================

/**
 * Pattern pour catégories générées par l'IA
 * Autorise : lettres, chiffres, espaces, tirets, underscores
 * Utilisé pour valider les catégories retournées par l'IA
 */
export const CATEGORY_AI_REGEX = /^[a-zA-Z0-9\s\-_]+$/;
