import { z } from 'zod';

// Prompt validation schema
export const promptSchema = z.object({
  title: z.string().trim().min(1, 'Le titre est requis').max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z.string().trim().max(3000, 'La description ne peut pas dépasser 3000 caractères').optional().or(z.literal('')),
  content: z.string().trim().min(1, 'Le contenu est requis').max(200000, 'Le contenu ne peut pas dépasser 200000 caractères'),
  tags: z.array(z.string().trim().max(50, 'Chaque tag ne peut pas dépasser 50 caractères')).max(20, 'Vous ne pouvez pas avoir plus de 20 tags'),
  visibility: z.enum(['PRIVATE', 'SHARED'], { errorMap: () => ({ message: 'Visibilité invalide' }) }),
});

// Variable validation schema
export const variableSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Le nom de la variable est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Le nom ne peut contenir que des lettres, chiffres et underscores'),
  type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'ENUM', 'DATE', 'MULTISTRING'], {
    errorMap: () => ({ message: 'Type de variable invalide' })
  }),
  required: z.boolean(),
  default_value: z.string().max(1000, 'La valeur par défaut ne peut pas dépasser 1000 caractères').optional().or(z.literal('')),
  help: z.string().max(500, 'Le texte d\'aide ne peut pas dépasser 500 caractères').optional().or(z.literal('')),
  pattern: z.string()
    .max(200, 'Le pattern ne peut pas dépasser 200 caractères')
    .refine(
      (val) => {
        if (!val) return true; // Empty is valid
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
  name: z.string().trim().min(1, 'Le nom est requis').max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  values: z.record(z.string().max(5000, 'Chaque valeur ne peut pas dépasser 5000 caractères')),
});

// Auth validation schema
export const authSchema = z.object({
  email: z.string().trim().email('Email invalide').max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  name: z.string().trim().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
});

export type PromptInput = z.infer<typeof promptSchema>;
export type VariableInput = z.infer<typeof variableSchema>;
export type VariableSetInput = z.infer<typeof variableSetSchema>;
export type AuthInput = z.infer<typeof authSchema>;
