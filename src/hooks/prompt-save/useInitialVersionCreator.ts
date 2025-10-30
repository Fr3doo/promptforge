import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SimpleVariable {
  name: string;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "DATE" | "ENUM" | "MULTISTRING";
  required: boolean;
  default_value?: string;
  help?: string;
  pattern?: string;
  options?: string[];
}

export interface InitialVersionOptions {
  promptId: string;
  content: string;
  variables: SimpleVariable[];
}

/**
 * Hook pour créer automatiquement la version initiale d'un prompt
 * Isole la logique complexe de création de version (lignes 165-206)
 */
export function useInitialVersionCreator() {
  const createInitialVersion = async (
    options: InitialVersionOptions
  ): Promise<{ success: boolean; skipped?: boolean }> => {
    try {
      const { data: versionData, error: versionError } = await supabase.functions.invoke(
        "create-initial-version",
        {
          body: {
            prompt_id: options.promptId,
            content: options.content,
            semver: "1.0.0",
            message: "Version initiale",
            variables: options.variables.map((v, index) => ({
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
        }
      );

      if (versionError) {
        console.error("Erreur création version initiale:", versionError);
        // Ne pas bloquer l'utilisateur, juste notifier
        toast.warning("Prompt créé", {
          description:
            "La version initiale n'a pas pu être créée. Vous pouvez créer une version manuellement.",
        });
        return { success: false };
      }

      if (versionData?.skipped) {
        console.log("Version initiale déjà existante");
        return { success: true, skipped: true };
      }

      console.log("Version initiale créée avec succès");
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'appel à create-initial-version:", error);
      // Ne pas bloquer l'utilisateur
      toast.warning("Prompt créé", {
        description:
          "La version initiale n'a pas pu être créée. Vous pouvez créer une version manuellement.",
      });
      return { success: false };
    }
  };

  return { createInitialVersion };
}
