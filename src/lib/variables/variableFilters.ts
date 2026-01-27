import type { Variable } from "@/features/prompts/types";

/**
 * Filtre les variables pour ne garder que celles présentes dans la liste de noms valides.
 * Fonction **pure** pour testabilité maximale.
 *
 * @param variables - Variables existantes à filtrer
 * @param validNames - Noms de variables détectés dans le contenu
 * @returns Variables filtrées
 */
export function filterValidVariables(
  variables: Variable[],
  validNames: string[]
): Variable[] {
  return variables.filter((v) => validNames.includes(v.name));
}

/**
 * Vérifie si un filtrage est nécessaire (optimisation pour éviter les re-renders inutiles).
 *
 * @param variables - Variables existantes
 * @param validNames - Noms de variables détectés
 * @returns true si au moins une variable doit être supprimée
 */
export function needsFiltering(
  variables: Variable[],
  validNames: string[]
): boolean {
  return variables.some((v) => !validNames.includes(v.name));
}
