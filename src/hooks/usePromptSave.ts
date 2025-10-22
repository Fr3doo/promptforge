import { useNavigate } from "react-router-dom";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { promptSchema, variableSchema } from "@/lib/validation";
import { messages } from "@/constants/messages";
import { useCreatePrompt, useUpdatePrompt, usePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useOptimisticLocking, type OptimisticLockError } from "@/hooks/useOptimisticLocking";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { PromptFormData, Variable } from "@/features/prompts/types";
import { toast } from "sonner";

interface UsePromptSaveOptions {
  isEditMode: boolean;
  onSuccess?: () => void;
  promptId?: string;
}

interface PromptSaveData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
  variables: Variable[];
}

export function usePromptSave({ isEditMode, onSuccess, promptId }: UsePromptSaveOptions = { isEditMode: false }) {
  const navigate = useNavigate();
  const { 
    notifyError, 
    notifyPromptCreated, 
    notifyPromptUpdated,
    notifyValidationError,
    notifyNetworkError,
    notifyServerError,
    notifyPermissionError,
  } = useToastNotifier();
  
  const { mutate: createPrompt, isPending: creating } = useCreatePrompt();
  const { mutate: updatePrompt, isPending: updating } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();
  const { checkForConflicts } = useOptimisticLocking();
  const { data: currentServerPrompt } = usePrompt(promptId);
  const { user } = useAuth();

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
        description: validatedPromptData.description ?? null,
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
        // Vérifier les permissions d'écriture
        if (currentServerPrompt) {
          const isOwner = currentServerPrompt.owner_id === user?.id;
          const isPublicWritable = currentServerPrompt.visibility === "SHARED" && 
                                   currentServerPrompt.public_permission === "WRITE";
          
          if (!isOwner && !isPublicWritable) {
            notifyPermissionError("ce prompt");
            return;
          }

          // Vérifier le verrouillage optimiste avant mise à jour
          try {
            // Créer un prompt client fictif avec updated_at de la dernière lecture
            const clientPrompt = { 
              ...currentServerPrompt,
              updated_at: currentServerPrompt.updated_at 
            };
            
            checkForConflicts(clientPrompt, currentServerPrompt);
          } catch (error) {
            const lockError = error as OptimisticLockError;
            if (lockError.type === "CONFLICT") {
              toast.error("Conflit détecté", {
                description: lockError.message,
                action: {
                  label: "Recharger",
                  onClick: () => window.location.reload()
                }
              });
              return;
            }
          }
        }

        // Update existing prompt
        updatePrompt(
          { 
            id: promptId, 
            updates: promptData
          },
          {
            onSuccess: () => {
              handleVariableSave(promptId);
              notifyPromptUpdated(promptData.title);
              onSuccess?.();
              navigate("/prompts");
            },
            onError: (error: any) => {
              // Check error type for better messaging
              if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
                notifyNetworkError("mettre à jour le prompt", () => {
                  savePrompt(data, promptId);
                });
              } else if (error?.code === "PGRST116" || error?.message?.includes("permission")) {
                notifyPermissionError("ce prompt");
              } else {
                notifyServerError("mise à jour du prompt");
              }
            },
          }
        );
      } else {
        // Create new prompt
        createPrompt({
          ...promptData,
          is_favorite: false,
          version: "1.0.0",
          status: "PUBLISHED",
          public_permission: "READ" as const,
        }, {
          onSuccess: async (newPrompt) => {
            // Sauvegarder les variables d'abord
            handleVariableSave(newPrompt.id);
            
            // Créer automatiquement la version initiale via edge function
            // pour une meilleure gestion d'erreur et atomicité
            try {
              // Récupérer la session pour passer le token d'authentification
              const { data: { session } } = await supabase.auth.getSession();
              
              const { data: versionData, error: versionError } = await supabase.functions.invoke(
                'create-initial-version',
                {
                  body: {
                    prompt_id: newPrompt.id,
                    content: newPrompt.content,
                    semver: "1.0.0",
                    message: "Version initiale",
                    variables: validatedVariables.map((v, index) => ({
                      name: v.name,
                      type: v.type,
                      required: v.required,
                      default_value: v.default_value || "",
                      help: v.help || "",
                      pattern: v.pattern || "",
                      options: v.options || [],
                      order_index: index,
                    })),
                  },
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                  },
                }
              );

              if (versionError) {
                console.error("Erreur création version initiale via edge function:", versionError);
                // Ne pas bloquer l'utilisateur, juste notifier
                toast.warning("Prompt créé", {
                  description: "La version initiale n'a pas pu être créée. Vous pouvez créer une version manuellement.",
                });
              } else if (versionData?.skipped) {
                console.log("Version initiale déjà existante");
              } else {
                console.log("Version initiale créée avec succès");
              }
            } catch (error) {
              console.error("Erreur lors de l'appel à create-initial-version:", error);
              // Ne pas bloquer l'utilisateur
              toast.warning("Prompt créé", {
                description: "La version initiale n'a pas pu être créée. Vous pouvez créer une version manuellement.",
              });
            } finally {
              // Toujours naviguer vers la liste, même en cas d'échec de version
              notifyPromptCreated(promptData.title);
              onSuccess?.();
              navigate(`/prompts?justCreated=${newPrompt.id}`);
            }
          },
          onError: (error: any) => {
            // Check error type for better messaging
            if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
              notifyNetworkError("créer le prompt", () => {
                savePrompt(data);
              });
            } else if (error?.code === "23505") {
              notifyError("Erreur de création", "Un prompt avec ce titre existe déjà");
            } else {
              notifyServerError("création du prompt");
            }
          },
        });
      }
    } catch (error: any) {
      // Validation errors
      if (error?.errors?.[0]?.message) {
        const validationError = error.errors[0];
        const field = validationError.path?.[0] || "Champ";
        notifyValidationError(
          field.toString(),
          validationError.message
        );
      } else if (error?.name === "ZodError") {
        notifyError(
          messages.errors.validation.failed,
          "Veuillez vérifier les données saisies"
        );
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
