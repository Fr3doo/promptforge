import { useNavigate } from "react-router-dom";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useToastNotifier } from "@/hooks/useToastNotifier";

export interface SimpleVariable {
  name: string;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM" | "MULTISTRING";
  required: boolean;
  default_value?: string;
  help?: string;
  pattern?: string;
  options?: string[];
}

export interface PromptFormData {
  title: string;
  description: string | null;
  content: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onCreateSuccess?: (promptId: string) => Promise<void>;
}

/**
 * Hook pour encapsuler les mutations de prompts (create/update)
 * Sépare la logique CRUD de la logique métier
 */
export function usePromptMutations() {
  const navigate = useNavigate();
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();
  const { notifyPromptCreated, notifyPromptUpdated } = useToastNotifier();

  const saveVariablesForPrompt = (promptId: string, variables: SimpleVariable[]) => {
    if (variables.length === 0) return;

    saveVariables({
      promptId,
      variables: variables.map((v, index) => ({
        name: v.name,
        type: v.type,
        required: v.required,
        default_value: v.default_value || "",
        help: v.help || "",
        pattern: v.pattern || "",
        options: v.options || [],
        order_index: index,
      })),
    });
  };

  const create = (
    promptData: PromptFormData,
    variables: SimpleVariable[],
    options?: MutationOptions
  ) => {
    createPrompt(
      {
        ...promptData,
        is_favorite: false,
        version: "1.0.0",
        status: "PUBLISHED",
        public_permission: "READ" as const,
      },
      {
        onSuccess: async (newPrompt) => {
          // Sauvegarder les variables
          saveVariablesForPrompt(newPrompt.id, variables);

          // Appeler le callback avec le promptId (pour création version initiale)
          if (options?.onCreateSuccess) {
            await options.onCreateSuccess(newPrompt.id);
          }

          // Notification
          notifyPromptCreated(promptData.title);

          // Callback utilisateur
          options?.onSuccess?.();

          // Navigation
          navigate(`/prompts?justCreated=${newPrompt.id}`);
        },
        onError: options?.onError,
      }
    );
  };

  const update = (
    promptId: string,
    promptData: PromptFormData,
    variables: SimpleVariable[],
    options?: MutationOptions
  ) => {
    updatePrompt(
      {
        id: promptId,
        updates: promptData,
      },
      {
        onSuccess: () => {
          // Sauvegarder les variables
          saveVariablesForPrompt(promptId, variables);

          // Notification
          notifyPromptUpdated(promptData.title);

          // Callback utilisateur
          options?.onSuccess?.();

          // Navigation
          navigate("/prompts");
        },
        onError: options?.onError,
      }
    );
  };

  return {
    create,
    update,
    isSaving: creating || updating,
  };
}
