import { useNavigate } from "react-router-dom";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { promptSchema, variableSchema } from "@/lib/validation";
import { messages } from "@/constants/messages";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import type { PromptFormData, Variable } from "@/features/prompts/types";

interface UsePromptSaveOptions {
  isEditMode: boolean;
  onSuccess?: () => void;
}

interface PromptSaveData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
  variables: Variable[];
}

export function usePromptSave({ isEditMode, onSuccess }: UsePromptSaveOptions = { isEditMode: false }) {
  const navigate = useNavigate();
  const { notifyError } = useToastNotifier();
  
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();

  const savePrompt = async (data: PromptSaveData, promptId?: string) => {
    try {
      // Validate prompt data
      const validatedPromptData = promptSchema.parse({
        title: data.title,
        description: data.description,
        content: data.content,
        tags: data.tags,
        visibility: data.visibility,
      });

      // Validate variables
      const validatedVariables = data.variables.map(v => variableSchema.parse(v));

      const promptData: PromptFormData = {
        title: validatedPromptData.title,
        description: validatedPromptData.description || "",
        content: validatedPromptData.content,
        tags: validatedPromptData.tags,
        visibility: validatedPromptData.visibility,
      };

      const handleVariableSave = (id: string) => {
        if (validatedVariables.length > 0) {
          saveVariables({ 
            promptId: id, 
            variables: validatedVariables.map((v, index) => ({
              name: v.name,
              type: v.type,
              required: v.required,
              default_value: v.default_value || "",
              help: v.help || "",
              pattern: v.pattern || "",
              options: v.options || [],
              order_index: index,
            }))
          });
        }
      };

      if (isEditMode && promptId) {
        // Update existing prompt
        updatePrompt(
          { 
            id: promptId, 
            updates: {
              ...promptData,
              description: promptData.description || null,
            }
          },
          {
            onSuccess: () => {
              handleVariableSave(promptId);
              onSuccess?.();
              navigate("/prompts");
            },
          }
        );
      } else {
        // Create new prompt
        createPrompt({
          ...promptData,
          description: promptData.description || null,
          is_favorite: false,
          version: "1.0.0",
          status: "PUBLISHED",
        }, {
          onSuccess: (newPrompt) => {
            handleVariableSave(newPrompt.id);
            onSuccess?.();
            navigate("/prompts");
          },
        });
      }
    } catch (error: any) {
      if (error?.errors?.[0]?.message) {
        notifyError(messages.errors.validation.failed, error.errors[0].message);
      } else {
        notifyError(messages.errors.save.failed, messages.errors.save.unexpected);
      }
    }
  };

  return {
    savePrompt,
    isSaving: creating || updating,
  };
}
