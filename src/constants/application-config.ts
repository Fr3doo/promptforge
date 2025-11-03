/**
 * SINGLE SOURCE OF TRUTH - APPLICATION CONFIG
 * ============================================
 * Configuration générale de l'application (délais, localStorage keys, etc.)
 */

// ============================================
// TIMING & DELAYS
// ============================================
export const TIMING = {
  /** Intervalle d'auto-sauvegarde des brouillons (5 secondes) */
  AUTOSAVE_INTERVAL: 5000,
  
  /** Délai de debounce par défaut (300ms) */
  DEBOUNCE_DELAY: 300,
  
  /** Délai de debounce pour recherche (500ms) */
  DEBOUNCE_SEARCH_DELAY: 500,
  
  /** Durée d'affichage des toasts (3 secondes) */
  TOAST_DURATION: 3000,
  
  /** Timeout côté client pour l'analyse de prompt (30 secondes) */
  ANALYSIS_CLIENT_TIMEOUT: 30_000,
  
  /** Timeout côté edge function pour l'appel AI (35 secondes) */
  ANALYSIS_EDGE_TIMEOUT: 35_000,
} as const;

// ============================================
// LOCALSTORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
  /** Clé pour le brouillon de nouveau prompt */
  DRAFT_NEW_PROMPT: "prompt_draft_new",
  
  /** Clé pour les préférences utilisateur */
  USER_PREFERENCES: "user_preferences",
  
  /** Clé pour le thème (dark/light) */
  THEME: "theme",
} as const;

// ============================================
// VERSION INFO
// ============================================
export const APP_VERSION = "1.0.0";
export const APP_NAME = "PromptForge";

// ============================================
// FEATURE FLAGS
// ============================================
export const FEATURES = {
  ENABLE_AI_ANALYSIS: true,
  ENABLE_VERSION_CONTROL: true,
  ENABLE_PUBLIC_SHARING: true,
} as const;
