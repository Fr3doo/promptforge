import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { promptSchema, variableSchema } from "@/lib/validation";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useTagManager } from "@/hooks/useTagManager";
import { useVariableManager } from "@/hooks/useVariableManager";
import type { Prompt, Variable, PromptFormData } from "../types";

interface UsePromptFormOptions {
  prompt?: Prompt;
  existingVariables?: Variable[];
  isEditMode: boolean;
}

export function usePromptForm({ prompt, existingVariables = [], isEditMode }: UsePromptFormOptions) {
  const navigate = useNavigate();
  const { notifyError } = useToastNotifier();
  
  // Mutations
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  
  // Tag management
  const { tags, setTags, tagInput, setTagInput, addTag, removeTag } = useTagManager();
  
  // Variable management
  const { variables, addVariablesFromContent, updateVariable, deleteVariable } = useVariableManager({
    content,
    initialVariables: existingVariables,
  });

  // Initialize form with existing data
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setDescription(prompt.description || "");
      setContent(prompt.content);
      setVisibility(prompt.visibility || "PRIVATE");
      setTags(prompt.tags || []);
    }
  }, [prompt]);


  const handleSave = async (promptId?: string) => {
    try {
      // Validation
      promptSchema.parse({
        title,
        description,
        content,
        tags,
        visibility,
      });

      // Validate variables
      const validatedVariables = variables.map(v => variableSchema.parse(v));

      const promptData: PromptFormData = {
        title,
        description: description || "",
        content,
        tags,
        visibility,
      };

      if (isEditMode && promptId) {
        // Update existing
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
              if (validatedVariables.length > 0) {
                saveVariables({ 
                  promptId, 
                  variables: validatedVariables.map(v => ({
                    name: v.name,
                    type: v.type,
                    required: v.required,
                    default_value: v.default_value,
                    help: v.help,
                    pattern: v.pattern,
                    options: v.options,
                    order_index: 0,
                  }))
                });
              }
              navigate("/prompts");
            },
          }
        );
      } else {
        // Create new
        createPrompt({
          ...promptData,
          description: promptData.description || null,
          is_favorite: false,
          version: "1.0.0",
          status: "PUBLISHED",
        }, {
          onSuccess: (newPrompt) => {
            if (validatedVariables.length > 0) {
              saveVariables({ 
                promptId: newPrompt.id, 
                variables: validatedVariables.map(v => ({
                  name: v.name,
                  type: v.type,
                  required: v.required,
                  default_value: v.default_value,
                  help: v.help,
                  pattern: v.pattern,
                  options: v.options,
                  order_index: 0,
                }))
              });
            }
            navigate("/prompts");
          },
        });
      }
    } catch (error: any) {
      if (error?.errors?.[0]?.message) {
        notifyError("Validation échouée", error.errors[0].message);
      }
    }
  };



  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    visibility,
    setVisibility,
    tags,
    tagInput,
    setTagInput,
    variables,
    variableValues,
    setVariableValues,
    
    // Actions
    handleSave,
    addTag,
    removeTag,
    detectVariables: addVariablesFromContent,
    updateVariable,
    deleteVariable,
    
    // Status
    isSaving: creating || updating,
  };
}
