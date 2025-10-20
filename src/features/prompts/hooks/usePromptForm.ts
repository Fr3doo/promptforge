import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { promptSchema, variableSchema } from "@/lib/validation";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useVariableDetection } from "@/hooks/useVariableDetection";
import type { Prompt, Variable, PromptFormData } from "../types";

interface UsePromptFormOptions {
  prompt?: Prompt;
  existingVariables?: Variable[];
  isEditMode: boolean;
}

export function usePromptForm({ prompt, existingVariables = [], isEditMode }: UsePromptFormOptions) {
  const navigate = useNavigate();
  
  // Mutations
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const { detectedNames } = useVariableDetection(content);

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

  useEffect(() => {
    if (existingVariables.length > 0) {
      setVariables(existingVariables);
    }
  }, [existingVariables]);

  // Synchroniser les variables avec le contenu
  useEffect(() => {
    // Nettoyer les variables qui ne sont plus dans le contenu
    const validVariables = variables.filter(v => detectedNames.includes(v.name));
    
    if (validVariables.length !== variables.length) {
      setVariables(validVariables);
    }
  }, [detectedNames]);

  const detectVariables = () => {
    const newVariables = detectedNames
      .filter(name => !variables.some(v => v.name === name))
      .map((name, index) => ({
        name,
        type: "STRING" as const,
        required: false,
        order_index: variables.length + index,
        default_value: "",
        help: "",
        pattern: "",
        options: [],
      } as Partial<Variable>));

    setVariables([...variables, ...newVariables] as Variable[]);
    toast({ title: `✨ ${newVariables.length} variable(s) détectée(s)` });
  };

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
        toast({ 
          title: "❌ Validation échouée", 
          description: error.errors[0].message,
          variant: "destructive" 
        });
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const updateVariable = (index: number, variable: Variable) => {
    const newVars = [...variables];
    newVars[index] = variable;
    setVariables(newVars);
  };

  const deleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
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
    detectVariables,
    updateVariable,
    deleteVariable,
    
    // Status
    isSaving: creating || updating,
  };
}
