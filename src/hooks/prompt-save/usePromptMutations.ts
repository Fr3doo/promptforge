import { useNavigate } from "react-router-dom";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import type { Visibility, VariableType } from "@/constants/domain-types";
import { PERMISSION, PROMPT_STATUS } from "@/constants/domain-types";

export interface SimpleVariable {
  name: string;
  type: VariableType;
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
  visibility: Visibility;
}

export interface MutationEvent {
  type: "created" | "updated";
  title: string;
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onCreateSuccess?: (promptId: string) => Promise<void>;
  onNotify?: (event: MutationEvent) => void;
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

  // Default notifier using toast notifications
  const defaultNotify = (event: MutationEvent) => {
    if (event.type === "created") {
      notifyPromptCreated(event.title);
    } else {
      notifyPromptUpdated(event.title);
    }
  };

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
        status: PROMPT_STATUS.PUBLISHED,
        public_permission: PERMISSION.READ,
      },
      {
        onSuccess: async (newPrompt) => {
          // Sauvegarder les variables
          saveVariablesForPrompt(newPrompt.id, variables);

          // Appeler le callback avec le promptId (pour création version initiale)
          if (options?.onCreateSuccess) {
            await options.onCreateSuccess(newPrompt.id);
          }

          // Notification (via callback ou défaut)
          const notify = options?.onNotify ?? defaultNotify;
          notify({ type: "created", title: promptData.title });

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

          // Notification (via callback ou défaut)
          const notify = options?.onNotify ?? defaultNotify;
          notify({ type: "updated", title: promptData.title });

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
