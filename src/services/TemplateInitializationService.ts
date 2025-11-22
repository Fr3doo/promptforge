import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { exampleTemplates } from "@/lib/exampleTemplates";

/**
 * Service responsable de l'initialisation des templates d'exemple
 * 
 * Suit le principe SRP (Single Responsibility Principle)
 * Gère uniquement la création des templates lors de la première connexion
 */
export class TemplateInitializationService {
  /**
   * Vérifie si des templates doivent être créés pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns true si aucun prompt n'existe, false sinon
   */
  async shouldCreateTemplates(userId: string): Promise<boolean> {
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);

    if (error) {
      logError("Error checking existing prompts", {
        userId,
        error: error.message,
      });
      return false;
    }

    return !prompts || prompts.length === 0;
  }

  /**
   * Crée les templates d'exemple si nécessaire
   * @param userId - ID de l'utilisateur
   */
  async createExampleTemplatesIfNeeded(userId: string): Promise<void> {
    const shouldCreate = await this.shouldCreateTemplates(userId);

    if (!shouldCreate) {
      return;
    }

    await this.createTemplates(userId);
  }

  /**
   * Crée tous les templates d'exemple pour un utilisateur
   * @param userId - ID de l'utilisateur
   */
  private async createTemplates(userId: string): Promise<void> {
    for (const template of exampleTemplates) {
      const { data: prompt, error: promptError } = await supabase
        .from("prompts")
        .insert({
          owner_id: userId,
          title: template.title,
          description: template.description,
          content: template.content,
          tags: template.tags,
          visibility: template.visibility,
          public_permission: template.public_permission,
        })
        .select()
        .single();

      if (promptError) {
        logError("Error creating template", {
          template: template.title,
          error: promptError.message,
        });
        continue;
      }

      // Insert variables
      if (template.variables.length > 0) {
        const varsToInsert = template.variables.map((v) => ({
          prompt_id: prompt.id,
          ...v,
        }));

        const { error: varsError } = await supabase
          .from("variables")
          .insert(varsToInsert);

        if (varsError) {
          logError("Error creating template variables", {
            template: template.title,
            error: varsError.message,
          });
        }
      }

      // Insert variable sets
      if (template.variableSets.length > 0) {
        const setsToInsert = template.variableSets.map((set) => ({
          prompt_id: prompt.id,
          name: set.name,
          values: set.values,
        }));

        const { error: setsError } = await supabase
          .from("variable_sets")
          .insert(setsToInsert);

        if (setsError) {
          logError("Error creating template variable sets", {
            template: template.title,
            error: setsError.message,
          });
        }
      }
    }
  }
}

/**
 * Instance singleton du service
 */
export const templateInitializationService = new TemplateInitializationService();
