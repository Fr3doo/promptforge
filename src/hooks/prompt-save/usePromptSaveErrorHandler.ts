import { ZodError } from "zod";
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { extractZodError } from "@/lib/zodErrorUtils";
import { isRetryableError } from "@/lib/network";

/**
 * Types d'erreurs strictement typés pour la sauvegarde de prompts
 */
export type SaveErrorType =
  | "VALIDATION"
  | "PERMISSION"
  | "NETWORK"
  | "DUPLICATE"
  | "SERVER";

/**
 * Classifie une erreur en SaveErrorType pour un traitement exhaustif
 * Fonction pure exportée pour tests isolés
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
 * Helper pour garantir l'exhaustivité du switch au compile-time
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled error type: ${x}`);
}

/**
 * Hook pour gérer TOUTES les erreurs de sauvegarde de manière centralisée
 * Utilise un switch exhaustif garanti par TypeScript
 */
export function usePromptSaveErrorHandler() {
  const promptMessages = usePromptMessages();

  const handleError = (
    error: unknown,
    context: "CREATE" | "UPDATE",
    retry?: () => void
  ) => {
    const errorType = classifyError(error);
    const createAction = "créer le prompt";
    const updateAction = "mettre à jour le prompt";
    const action = context === "CREATE" ? createAction : updateAction;

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
        promptMessages.showNetworkError(action, retry);
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
        promptMessages.showServerError(serverAction, retry);
        return;
      }

      default:
        assertNever(errorType);
    }
  };

  return { handleError };
}
