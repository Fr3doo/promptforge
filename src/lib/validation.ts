import { z } from 'zod';
import { tagsArraySchema } from '@/lib/tagValidation';
import { 
  PROMPT_LIMITS, 
  VARIABLE_LIMITS, 
  VARIABLE_SET_LIMITS, 
  AUTH_LIMITS 
} from '@/constants/validation-limits';
import { VARIABLE_NAME_REGEX } from '@/constants/regex-patterns';

/**
 * NORMALISATION DE LA DESCRIPTION
 * ================================
 * Décision : Utiliser `null` pour les descriptions vides plutôt que des chaînes vides.
 * 
 * Raisons :
 * - Plus sémantique en base de données (absence de valeur vs valeur vide)
 * - Réduit la taille des données stockées
 * - Standard SQL/PostgreSQL pour les champs optionnels
 * - Évite les conversions multiples dans le code
 * 
 * Implémentation :
 * - Le schéma transforme automatiquement les chaînes vides en null
 * - Les composants affichent "" pour null (via `description ?? ""`)
 * - La sauvegarde envoie null directement sans conversion
 */

// Prompt validation schema
export const promptSchema = z.object({
  title: z.string()
    .trim()
    .min(PROMPT_LIMITS.TITLE.MIN, 'Le titre est requis')
    .max(PROMPT_LIMITS.TITLE.MAX, `Le titre ne peut pas dépasser ${PROMPT_LIMITS.TITLE.MAX} caractères`),
  description: z.string()
    .trim()
    .max(PROMPT_LIMITS.DESCRIPTION.MAX, `La description ne peut pas dépasser ${PROMPT_LIMITS.DESCRIPTION.MAX} caractères`)
    .transform(val => val === '' ? null : val)
    .nullable()
    .optional(),
  content: z.string()
    .trim()
    .min(PROMPT_LIMITS.CONTENT.MIN, 'Le contenu est requis')
    .max(PROMPT_LIMITS.CONTENT.MAX, `Le contenu ne peut pas dépasser ${PROMPT_LIMITS.CONTENT.MAX} caractères`),
  tags: tagsArraySchema,
  visibility: z.enum(['PRIVATE', 'SHARED'], { errorMap: () => ({ message: 'Visibilité invalide' }) }),
});

// Variable validation schema
export const variableSchema = z.object({
  name: z.string()
    .trim()
    .min(VARIABLE_LIMITS.NAME.MIN, 'Le nom de la variable est requis')
    .max(VARIABLE_LIMITS.NAME.MAX, `Le nom ne peut pas dépasser ${VARIABLE_LIMITS.NAME.MAX} caractères`)
    .regex(VARIABLE_NAME_REGEX, 'Le nom ne peut contenir que des lettres, chiffres et underscores'),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'ENUM', 'DATE', 'MULTISTRING'], {
    errorMap: () => ({ message: 'Type de variable invalide' })
  }),
  required: z.boolean(),
  default_value: z.string()
    .max(VARIABLE_LIMITS.DEFAULT_VALUE.MAX, `La valeur par défaut ne peut pas dépasser ${VARIABLE_LIMITS.DEFAULT_VALUE.MAX} caractères`)
    .optional()
    .or(z.literal('')),
  help: z.string()
    .max(VARIABLE_LIMITS.DESCRIPTION.MAX, `Le texte d'aide ne peut pas dépasser ${VARIABLE_LIMITS.DESCRIPTION.MAX} caractères`)
    .optional()
    .or(z.literal('')),
  pattern: z.string()
    .max(VARIABLE_LIMITS.PATTERN.MAX, `Le pattern ne peut pas dépasser ${VARIABLE_LIMITS.PATTERN.MAX} caractères`)
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new RegExp(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Le pattern doit être une expression régulière valide' }
    )
    .optional()
    .or(z.literal('')),
  options: z.array(z.string()).optional(),
});

// Variable set validation schema
export const variableSetSchema = z.object({
  name: z.string()
    .trim()
    .min(VARIABLE_SET_LIMITS.NAME.MIN, 'Le nom est requis')
    .max(VARIABLE_SET_LIMITS.NAME.MAX, `Le nom ne peut pas dépasser ${VARIABLE_SET_LIMITS.NAME.MAX} caractères`),
  values: z.record(
    z.string().max(VARIABLE_SET_LIMITS.VALUE.MAX, `Chaque valeur ne peut pas dépasser ${VARIABLE_SET_LIMITS.VALUE.MAX} caractères`)
  ),
});

// Auth validation schema
export const authSchema = z.object({
  email: z.string()
    .trim()
    .email('Email invalide')
    .max(AUTH_LIMITS.EMAIL.MAX, `L'email ne peut pas dépasser ${AUTH_LIMITS.EMAIL.MAX} caractères`),
  password: z.string()
    .min(AUTH_LIMITS.PASSWORD.MIN, `Le mot de passe doit contenir au moins ${AUTH_LIMITS.PASSWORD.MIN} caractères`)
    .max(AUTH_LIMITS.PASSWORD.MAX, `Le mot de passe ne peut pas dépasser ${AUTH_LIMITS.PASSWORD.MAX} caractères`),
  name: z.string()
    .trim()
    .min(1, 'Le nom est requis')
    .max(AUTH_LIMITS.PSEUDO.MAX, `Le nom ne peut pas dépasser ${AUTH_LIMITS.PSEUDO.MAX} caractères`)
    .optional(),
});

export type PromptInput = z.infer<typeof promptSchema>;
export type VariableInput = z.infer<typeof variableSchema>;
export type VariableSetInput = z.infer<typeof variableSetSchema>;
export type AuthInput = z.infer<typeof authSchema>;
