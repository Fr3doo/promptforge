import { ZodError } from "zod";
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { extractZodError } from "@/lib/zodErrorUtils";
import { isRetryableError } from "@/lib/network";

export type SaveErrorType = 
  | "VALIDATION"
  | "PERMISSION"
  | "NETWORK"
  | "DUPLICATE"
  | "SERVER"
  | "UNKNOWN";

export interface SaveError {
  type: SaveErrorType;
  message?: string;
  code?: string;
}

/**
 * Hook pour gérer TOUTES les erreurs de sauvegarde de manière centralisée
 * Élimine la duplication de logique d'erreur (lignes 136-147, 213-224, 227-244)
 */
export function usePromptSaveErrorHandler() {
  const promptMessages = usePromptMessages();

  const handleError = (
    error: any,
    context: "CREATE" | "UPDATE",
    retry?: () => void
  ) => {
    // 1. Erreurs de validation Zod
    const zodError = extractZodError(error);
    if (zodError) {
      promptMessages.showValidationError(zodError.field, zodError.message);
      return;
    }

    // Fallback pour ZodError sans issues extractibles
    if (error instanceof ZodError) {
      promptMessages.showValidationError("Données", "Veuillez vérifier les données saisies");
      return;
    }

    // 2. Erreurs transitoires (réseau, timeout, 5xx) → proposer retry
    if (isRetryableError(error)) {
      const action = context === "CREATE" ? "créer le prompt" : "mettre à jour le prompt";
      promptMessages.showNetworkError(action, retry);
      return;
    }

    // 3. Erreurs de permissions
    if (error?.code === "PGRST116" || error?.message?.includes("permission")) {
      promptMessages.showPermissionDenied();
      return;
    }

    // 4. Erreurs de duplication (contrainte unique)
    if (error?.code === "23505") {
      promptMessages.showDuplicateTitleError();
      return;
    }

    // 5. Erreur serveur générique
    const action = context === "CREATE" ? "création du prompt" : "mise à jour du prompt";
    promptMessages.showServerError(action, retry);
  };

  return { handleError };
}
