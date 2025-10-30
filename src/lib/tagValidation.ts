import { z } from "zod";

// ============================================
// SINGLE SOURCE OF TRUTH - TAG CONSTRAINTS
// ============================================

export const TAG_CONSTRAINTS = {
  MAX_COUNT: 20,
  MAX_LENGTH: 50,
  REGEX: /^[a-zA-Z0-9\s\-_]+$/,
  REGEX_ERROR: "Le tag ne peut contenir que des lettres, chiffres, espaces, tirets et underscores",
} as const;

// ============================================
// ZOD SCHEMAS (utilisables partout)
// ============================================

/**
 * Schéma Zod pour un tag individuel
 * Utilisé pour validation en temps réel et sauvegarde
 */
export const tagSchema = z.string()
  .trim()
  .min(1, "Le tag ne peut pas être vide")
  .max(TAG_CONSTRAINTS.MAX_LENGTH, `Le tag ne peut pas dépasser ${TAG_CONSTRAINTS.MAX_LENGTH} caractères`)
  .regex(TAG_CONSTRAINTS.REGEX, TAG_CONSTRAINTS.REGEX_ERROR);

/**
 * Schéma Zod pour un tableau de tags
 * Utilisé dans promptSchema (validation.ts)
 */
export const tagsArraySchema = z.array(tagSchema)
  .max(TAG_CONSTRAINTS.MAX_COUNT, `Vous ne pouvez pas avoir plus de ${TAG_CONSTRAINTS.MAX_COUNT} tags`);

// ============================================
// UTILITY: SANITIZE AI-GENERATED TAGS
// ============================================

/**
 * Nettoie et valide les tags générés par l'IA
 * Applique TOUTES les règles de validation utilisateur
 * 
 * @param aiTags - Tags bruts de l'IA (metadata.categories)
 * @returns Tags valides, dédupliqués, limités à MAX_COUNT
 * 
 * Règles appliquées :
 * 1. Trim de chaque tag
 * 2. Validation format (regex)
 * 3. Validation longueur (max 50 caractères)
 * 4. Dé-duplication (case-sensitive)
 * 5. Limitation à 20 tags maximum
 * 
 * COMPORTEMENT : Silencieusement ignore les tags invalides
 * (Murphy's Law : l'IA peut générer n'importe quoi)
 */
export function sanitizeAITags(aiTags: string[] | undefined): string[] {
  if (!aiTags || !Array.isArray(aiTags)) {
    return [];
  }

  const validTags: string[] = [];
  const seenTags = new Set<string>();

  for (const rawTag of aiTags) {
    // Skip si pas une string
    if (typeof rawTag !== 'string') {
      console.warn('[sanitizeAITags] Tag non-string ignoré:', rawTag);
      continue;
    }

    const trimmed = rawTag.trim();

    // Skip si vide après trim
    if (!trimmed) {
      continue;
    }

    // Skip si déjà présent (dé-duplication)
    if (seenTags.has(trimmed)) {
      console.warn('[sanitizeAITags] Tag dupliqué ignoré:', trimmed);
      continue;
    }

    // Validation avec Zod
    try {
      tagSchema.parse(trimmed);
      validTags.push(trimmed);
      seenTags.add(trimmed);
    } catch (error) {
      console.warn('[sanitizeAITags] Tag invalide ignoré:', trimmed, error);
    }

    // Limite à MAX_COUNT tags
    if (validTags.length >= TAG_CONSTRAINTS.MAX_COUNT) {
      console.warn(`[sanitizeAITags] Limite de ${TAG_CONSTRAINTS.MAX_COUNT} tags atteinte, tags supplémentaires ignorés`);
      break;
    }
  }

  return validTags;
}
