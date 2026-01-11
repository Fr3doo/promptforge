import type { Database } from "@/integrations/supabase/types";

// ============================================
// TYPES EXTRAITS DE SUPABASE (source unique)
// ============================================

type DbEnums = Database["public"]["Enums"];

/**
 * Visibilité des prompts
 * - PRIVATE: Visible uniquement par le propriétaire et les utilisateurs avec partage direct
 * - SHARED: Visible publiquement par tous les utilisateurs authentifiés
 */
export type Visibility = DbEnums["visibility"];
export const VISIBILITY = {
  PRIVATE: "PRIVATE",
  SHARED: "SHARED",
} as const satisfies Record<string, Visibility>;

/**
 * Permissions de partage
 * - READ: Lecture seule (consultation, copie)
 * - WRITE: Lecture et écriture (modification du contenu)
 */
export type Permission = DbEnums["sharing_permission"];
export const PERMISSION = {
  READ: "READ",
  WRITE: "WRITE",
} as const satisfies Record<string, Permission>;

/**
 * Types de variables
 * - STRING: Texte simple
 * - NUMBER: Nombre
 * - BOOLEAN: Vrai/Faux
 * - DATE: Date
 * - ENUM: Liste d'options prédéfinies
 * - MULTISTRING: Texte multi-lignes
 */
export type VariableType = DbEnums["var_type"];
export const VARIABLE_TYPE = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  DATE: "DATE",
  ENUM: "ENUM",
  MULTISTRING: "MULTISTRING",
} as const satisfies Record<string, VariableType>;

/**
 * Statuts de prompt
 * - DRAFT: Brouillon (non publié)
 * - PUBLISHED: Publié (visible selon visibilité)
 */
export type PromptStatus = DbEnums["prompt_status"];
export const PROMPT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const satisfies Record<string, PromptStatus>;

// ============================================
// TABLEAUX POUR VALIDATION ZOD
// ============================================

/** Valeurs de visibilité pour z.enum() */
export const VISIBILITY_VALUES = [VISIBILITY.PRIVATE, VISIBILITY.SHARED] as const;

/** Valeurs de permission pour z.enum() */
export const PERMISSION_VALUES = [PERMISSION.READ, PERMISSION.WRITE] as const;

/** Valeurs de types de variables pour z.enum() */
export const VARIABLE_TYPE_VALUES = [
  VARIABLE_TYPE.STRING,
  VARIABLE_TYPE.NUMBER,
  VARIABLE_TYPE.BOOLEAN,
  VARIABLE_TYPE.DATE,
  VARIABLE_TYPE.ENUM,
  VARIABLE_TYPE.MULTISTRING,
] as const;

/** Valeurs de statuts pour z.enum() */
export const PROMPT_STATUS_VALUES = [PROMPT_STATUS.DRAFT, PROMPT_STATUS.PUBLISHED] as const;
