import { useToastNotifier } from "@/hooks/useToastNotifier";
import { messages } from "@/constants/messages";

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
  const {
    notifyValidationError,
    notifyPermissionError,
    notifyNetworkError,
    notifyServerError,
    notifyError,
  } = useToastNotifier();

  const handleError = (
    error: any,
    context: "CREATE" | "UPDATE",
    retry?: () => void
  ) => {
    // 1. Erreurs de validation Zod
    if (error?.errors?.[0]?.message) {
      const validationError = error.errors[0];
      const field = validationError.path?.[0] || "Champ";
      notifyValidationError(field.toString(), validationError.message);
      return;
    }

    if (error?.name === "ZodError") {
      notifyError(
        messages.errors.validation.failed,
        "Veuillez vérifier les données saisies"
      );
      return;
    }

    // 2. Erreurs réseau
    if (
      error?.message?.includes("network") ||
      error?.message?.includes("fetch")
    ) {
      const action = context === "CREATE" ? "créer le prompt" : "mettre à jour le prompt";
      notifyNetworkError(action, retry);
      return;
    }

    // 3. Erreurs de permissions
    if (error?.code === "PGRST116" || error?.message?.includes("permission")) {
      notifyPermissionError("ce prompt");
      return;
    }

    // 4. Erreurs de duplication (contrainte unique)
    if (error?.code === "23505") {
      notifyError("Erreur de création", "Un prompt avec ce titre existe déjà");
      return;
    }

    // 5. Erreur serveur générique
    const action = context === "CREATE" ? "création du prompt" : "mise à jour du prompt";
    notifyServerError(action, retry);
  };

  return { handleError };
}
