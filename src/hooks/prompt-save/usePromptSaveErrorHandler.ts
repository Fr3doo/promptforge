import { ZodError } from "zod";
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { extractZodError } from "@/lib/zodErrorUtils";
import { isRetryableError } from "@/lib/network";

/**
 * Types d'erreurs strictement typés pour la sauvegarde de prompts.
 *
 * Chaque type correspond à une catégorie d'erreur avec un traitement spécifique :
 * - `VALIDATION` : Erreurs de validation Zod (données invalides, schéma non respecté)
 * - `PERMISSION` : Accès refusé (RLS PostgreSQL, droits insuffisants)
 * - `NETWORK` : Erreurs transitoires rejouables (réseau, timeout, erreurs 5xx)
 * - `DUPLICATE` : Contrainte unique violée (titre de prompt déjà existant)
 * - `SERVER` : Erreur serveur générique (fallback pour erreurs non classifiées)
 *
 * @see classifyError pour la logique de classification
 * @see docs/ERROR_HANDLING_ARCHITECTURE.md pour l'architecture complète
 */
export type SaveErrorType =
  | "VALIDATION"
  | "PERMISSION"
  | "NETWORK"
  | "DUPLICATE"
  | "SERVER";

/**
 * Classifie une erreur brute en `SaveErrorType` pour un traitement exhaustif.
 *
 * Fonction **pure** exportée séparément pour permettre des tests unitaires isolés
 * sans dépendance au hook React.
 *
 * ## Priorité de classification (ordre d'évaluation)
 *
 * | Priorité | Type | Condition |
 * |----------|------|-----------|
 * | 1 | `VALIDATION` | `ZodError` ou `extractZodError()` retourne un résultat |
 * | 2 | `PERMISSION` | Code `PGRST116` ou message contenant "permission" |
 * | 3 | `DUPLICATE` | Code PostgreSQL `23505` (contrainte unique) |
 * | 4 | `NETWORK` | `isRetryableError()` retourne `true` |
 * | 5 | `SERVER` | Fallback pour toutes les autres erreurs |
 *
 * @param error - L'erreur brute à classifier (type `unknown` pour typage strict)
 * @returns Le type d'erreur correspondant (`SaveErrorType`)
 *
 * @example
 * ```typescript
 * import { classifyError } from "@/hooks/prompt-save/usePromptSaveErrorHandler";
 *
 * try {
 *   await savePrompt(data);
 * } catch (error) {
 *   const errorType = classifyError(error);
 *   // errorType: "VALIDATION" | "PERMISSION" | "DUPLICATE" | "NETWORK" | "SERVER"
 * }
 * ```
 */
export function classifyError(error: unknown): SaveErrorType {
  // 1. Erreurs de validation Zod (priorité haute)
  if (error instanceof ZodError || extractZodError(error)) {
    return "VALIDATION";
  }

  // 2. Erreurs de permissions (code PostgreSQL spécifique)
  const errorAny = error as { code?: string; message?: string };
  if (errorAny?.code === "PGRST116" || errorAny?.message?.includes("permission")) {
    return "PERMISSION";
  }

  // 3. Erreurs de duplication (contrainte unique PostgreSQL)
  if (errorAny?.code === "23505") {
    return "DUPLICATE";
  }

  // 4. Erreurs transitoires (réseau, timeout, 5xx)
  if (isRetryableError(error)) {
    return "NETWORK";
  }

  // 5. Fallback : erreur serveur générique
  return "SERVER";
}

/**
 * Helper TypeScript pour garantir l'exhaustivité du switch au compile-time.
 *
 * Si un nouveau type est ajouté à `SaveErrorType` sans mise à jour du switch,
 * TypeScript génère une erreur de compilation :
 * `Argument of type '"NEW_TYPE"' is not assignable to parameter of type 'never'.`
 *
 * @param x - Valeur qui ne devrait jamais exister (type `never`)
 * @throws Error si appelé à runtime (indique un bug dans le switch)
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled error type: ${x}`);
}

/**
 * Hook pour gérer **toutes** les erreurs de sauvegarde de prompts de manière centralisée.
 *
 * Utilise un switch exhaustif garanti par TypeScript via `assertNever`,
 * assurant qu'aucun type d'erreur ne peut être oublié.
 *
 * @returns Un objet contenant la fonction `handleError`
 *
 * @example
 * ```typescript
 * const { handleError } = usePromptSaveErrorHandler();
 *
 * try {
 *   await mutation.mutateAsync(data);
 * } catch (error) {
 *   handleError(error, "UPDATE", () => mutation.mutateAsync(data));
 * }
 * ```
 *
 * @see classifyError pour la logique de classification
 * @see docs/ERROR_HANDLING_ARCHITECTURE.md pour l'architecture complète
 */
/**
 * Options pour le gestionnaire d'erreurs
 */
export interface HandleErrorOptions {
  /** Fonction de retry à appeler en cas d'erreur rejouable */
  retry?: () => void;
  /** Indique si le retry est autorisé (limite de tentatives non atteinte) */
  canRetry?: boolean;
}

export function usePromptSaveErrorHandler() {
  const promptMessages = usePromptMessages();

  /**
   * Gère une erreur de sauvegarde avec affichage de feedback utilisateur.
   * 
   * @param error - Erreur brute à traiter
   * @param context - Contexte de l'erreur ("CREATE" ou "UPDATE")
   * @param options - Options incluant retry et canRetry
   * 
   * @remarks
   * Le retry n'est proposé que si `options.canRetry` est true (ou undefined pour rétrocompatibilité).
   * Cela permet de limiter les tentatives de retry manuels (Loi de Murphy).
   */
  const handleError = (
    error: unknown,
    context: "CREATE" | "UPDATE",
    options?: HandleErrorOptions | (() => void) // Rétrocompatibilité avec l'ancienne signature
  ) => {
    // Rétrocompatibilité : si options est une fonction, c'est l'ancien paramètre retry
    const normalizedOptions: HandleErrorOptions = typeof options === "function"
      ? { retry: options, canRetry: true }
      : options ?? {};

    const { retry, canRetry = true } = normalizedOptions;

    const errorType = classifyError(error);
    const createAction = "créer le prompt";
    const updateAction = "mettre à jour le prompt";
    const action = context === "CREATE" ? createAction : updateAction;

    // Ne proposer le retry que si autorisé (limite non atteinte)
    const safeRetry = canRetry ? retry : undefined;

    switch (errorType) {
      case "VALIDATION": {
        const zodError = extractZodError(error);
        if (zodError) {
          promptMessages.showValidationError(zodError.field, zodError.message);
        } else {
          promptMessages.showValidationError("Données", "Veuillez vérifier les données saisies");
        }
        return;
      }

      case "NETWORK": {
        promptMessages.showNetworkError(action, safeRetry);
        return;
      }

      case "PERMISSION": {
        promptMessages.showPermissionDenied();
        return;
      }

      case "DUPLICATE": {
        promptMessages.showDuplicateTitleError();
        return;
      }

      case "SERVER": {
        const serverAction = context === "CREATE" ? "création du prompt" : "mise à jour du prompt";
        promptMessages.showServerError(serverAction, safeRetry);
        return;
      }

      default:
        assertNever(errorType);
    }
  };

  return { handleError };
}
