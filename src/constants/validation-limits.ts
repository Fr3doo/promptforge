/**
 * SINGLE SOURCE OF TRUTH - VALIDATION LIMITS
 * =============================================
 * Toutes les limites de validation pour prompts, variables, auth, etc.
 * Utilisées par :
 * - validation.ts (schémas Zod)
 * - Edge functions (analyze-prompt, etc.)
 * - Composants UI (affichage compteurs)
 */

// ============================================
// PROMPT LIMITS
// ============================================
export const PROMPT_LIMITS = {
  TITLE: {
    MIN: 1,
    MAX: 200,
  },
  DESCRIPTION: {
    MAX: 3000,
  },
  CONTENT: {
    MIN: 1,
    MAX: 200000, // Limite client/serveur
  },
  CONTENT_AI_ANALYSIS: {
    MAX: 50000, // Limite pour analyse AI (performances)
  },
} as const;

// ============================================
// VARIABLE LIMITS
// ============================================
export const VARIABLE_LIMITS = {
  MAX_COUNT: 50, // Nombre max de variables par prompt
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  DESCRIPTION: {
    MAX: 500,
  },
  DEFAULT_VALUE: {
    MAX: 1000,
  },
  PATTERN: {
    MAX: 200,
  },
  OPTIONS: {
    MAX_COUNT: 50, // Nombre max d'options pour type ENUM
    MAX_LENGTH: 100, // Longueur max d'une option
  },
} as const;

// ============================================
// VARIABLE SET LIMITS
// ============================================
export const VARIABLE_SET_LIMITS = {
  NAME: {
    MIN: 1,
    MAX: 200,
  },
  VALUE: {
    MAX: 5000,
  },
} as const;

// ============================================
// AUTH LIMITS
// ============================================
export const AUTH_LIMITS = {
  EMAIL: {
    MAX: 255,
  },
  PASSWORD: {
    MIN: 6,
    MAX: 100,
  },
  PSEUDO: {
    MIN: 1,
    MAX: 100,
  },
} as const;

// ============================================
// PASSWORD STRENGTH LIMITS
// ============================================
export const PASSWORD_STRENGTH = {
  /** Score minimum requis (0-6) */
  MIN_SCORE: 4,
  /** Longueur minimum */
  MIN_LENGTH: 8,
  /** Longueur considérée comme forte */
  STRONG_LENGTH: 12,
  /** Patterns communs à éviter */
  COMMON_PATTERNS: [
    'password', '123456', 'qwerty', 'azerty', 
    'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'login', 'passw0rd'
  ],
} as const;

// ============================================
// TAG LIMITS (re-export from tagValidation.ts)
// ============================================
export { TAG_CONSTRAINTS } from '@/lib/tagValidation';

// ============================================
// AI METADATA LIMITS (pour analyze-prompt)
// ============================================
export const AI_METADATA_LIMITS = {
  ROLE: {
    MAX: 500,
  },
  OBJECTIVES: {
    MAX_COUNT: 20,
    MAX_LENGTH: 500,
  },
  STEPS: {
    MAX_COUNT: 50,
    MAX_LENGTH: 500,
  },
  CATEGORIES: {
    MAX_COUNT: 20,
    MAX_LENGTH: 50,
  },
  SECTIONS: {
    MAX_LENGTH: 10000,
  },
  TEMPLATE: {
    MAX_LENGTH: 100000,
  },
} as const;
