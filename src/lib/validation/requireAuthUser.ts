/**
 * Erreur levée lorsqu'un utilisateur authentifié est requis mais absent.
 *
 * @remarks
 * Hérite de Error standard pour compatibilité avec :
 * - try/catch classiques
 * - classifyError() qui filtre par code/message
 * - Les gestionnaires onError qui vérifient error.message === "SESSION_EXPIRED"
 *
 * Le message est personnalisable pour conserver les codes d'erreur
 * spécifiques utilisés par certains hooks (ex: "SESSION_EXPIRED").
 */
export class UnauthenticatedError extends Error {
  constructor(message: string = "Utilisateur non authentifié") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

/**
 * Vérifie qu'un utilisateur est authentifié.
 *
 * @param user - Objet utilisateur à valider
 * @param message - Message ou code d'erreur à utiliser si l'utilisateur est absent
 * @returns L'utilisateur validé avec type narrowing (NonNullable<T>)
 * @throws {UnauthenticatedError} Si l'utilisateur est undefined ou null
 *
 * @example
 * ```typescript
 * // Avant (9 occurrences répétées)
 * if (!user) throw new Error("Utilisateur non authentifié");
 *
 * // Après (DRY + type narrowing garanti)
 * const validUser = requireAuthUser(user);
 * // validUser: User (pas User | null)
 *
 * // Avec message personnalisé (pour compatibilité SESSION_EXPIRED)
 * requireAuthUser(user, "SESSION_EXPIRED");
 * ```
 */
export function requireAuthUser<T>(
  user: T,
  message: string = "Utilisateur non authentifié"
): NonNullable<T> {
  if (user === undefined || user === null) {
    throw new UnauthenticatedError(message);
  }
  return user;
}
