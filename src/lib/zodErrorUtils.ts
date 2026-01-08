import { ZodError, type ZodIssue } from "zod";

/**
 * Résultat de l'extraction d'une erreur Zod
 */
export interface ZodErrorInfo {
  field: string;
  message: string;
}

/**
 * Extrait le champ et le message de la première issue d'une ZodError
 *
 * @param error - L'erreur à analyser (peut être n'importe quel type)
 * @returns Les informations d'erreur si c'est une ZodError valide, null sinon
 *
 * @example
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   const zodError = extractZodError(error);
 *   if (zodError) {
 *     showValidationError(zodError.field, zodError.message);
 *   }
 * }
 */
export function extractZodError(error: unknown): ZodErrorInfo | null {
  // Vérification type-safe avec instanceof
  if (!(error instanceof ZodError)) {
    return null;
  }

  // issues est le tableau canonique dans ZodError
  const firstIssue: ZodIssue | undefined = error.issues[0];

  if (!firstIssue) {
    return null;
  }

  return {
    field:
      firstIssue.path[0] !== undefined
        ? String(firstIssue.path[0])
        : "Champ",
    message: firstIssue.message,
  };
}
