/**
 * Erreur levée lorsqu'un ID requis est manquant
 *
 * @remarks
 * Hérite de Error standard pour compatibilité avec :
 * - try/catch classiques
 * - classifyError() qui filtre par code/message
 * - Les tests existants qui vérifient les messages
 *
 * Le message conserve le format existant : "${fieldName} requis"
 */
export class RequiredIdError extends Error {
  readonly fieldName: string;

  constructor(fieldName: string = "ID") {
    super(`${fieldName} requis`);
    this.name = "RequiredIdError";
    this.fieldName = fieldName;
  }
}

/**
 * Vérifie qu'un ID est défini et non vide
 *
 * @param value - Valeur à vérifier (string | undefined | null)
 * @param fieldName - Nom du champ pour le message d'erreur
 * @returns La valeur validée (type narrowing vers string)
 * @throws {RequiredIdError} Si la valeur est undefined, null ou chaîne vide
 *
 * @example
 * ```typescript
 * // Avant (15+ occurrences répétées)
 * if (!userId) throw new Error("ID utilisateur requis");
 *
 * // Après (DRY + type narrowing)
 * const validId = requireId(userId, "ID utilisateur");
 * // validId est garanti non-null ici
 * ```
 */
export function requireId(
  value: string | undefined | null,
  fieldName: string = "ID"
): string {
  if (!value) {
    throw new RequiredIdError(fieldName);
  }
  return value;
}

/**
 * Vérifie qu'un tableau d'IDs est non vide
 *
 * @param values - Tableau de valeurs à vérifier
 * @param fieldName - Nom du champ pour le message d'erreur
 * @returns Le tableau validé (type assertion)
 * @throws {RequiredIdError} Si le tableau est vide
 */
export function requireIds(
  values: string[],
  fieldName: string = "IDs"
): string[] {
  if (!values.length) {
    throw new RequiredIdError(fieldName);
  }
  return values;
}
