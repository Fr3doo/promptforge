import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { exampleTemplates } from "@/lib/exampleTemplates";
import type { PromptRepository } from "@/repositories/PromptRepository";
import type { VariableRepository } from "@/repositories/VariableRepository";

/**
 * Service responsable de l'initialisation des templates d'exemple
 * 
 * Suit le principe SRP (Single Responsibility Principle)
 * et le principe DIP (Dependency Inversion Principle)
 * 
 * Gère uniquement la création des templates lors de la première connexion
 */
export class TemplateInitializationService {
  constructor(
    private readonly promptRepository: PromptRepository,
    private readonly variableRepository: VariableRepository
  ) {}

  /**
   * Vérifie si des templates doivent être créés pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns true si aucun prompt n'existe, false sinon
   */
  async shouldCreateTemplates(userId: string): Promise<boolean> {
    try {
      const prompts = await this.promptRepository.fetchOwned(userId);
      return prompts.length === 0;
    } catch (error) {
      logError("Error checking existing prompts", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Crée les templates d'exemple si nécessaire
   * @param userId - ID de l'utilisateur
   */
  async createTemplatesForNewUser(userId: string): Promise<void> {
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
      try {
        // Create the prompt using the repository
        const prompt = await this.promptRepository.create(userId, {
          title: template.title,
          description: template.description,
          content: template.content,
          tags: template.tags,
          visibility: template.visibility,
          public_permission: template.public_permission,
          status: "PUBLISHED",
          is_favorite: false,
          version: "1.0.0",
        });

        // Insert variables using the repository
        if (template.variables.length > 0) {
          for (const variable of template.variables) {
            try {
              await this.variableRepository.create({
                prompt_id: prompt.id,
                name: variable.name,
                type: variable.type,
                required: variable.required,
                default_value: variable.default_value,
                help: variable.help,
                order_index: variable.order_index,
              });
            } catch (error) {
              logError("Error creating template variable", {
                template: template.title,
                variable: variable.name,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }

        // Insert variable sets (using direct Supabase for now as no repository method exists)
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
      } catch (error) {
        logError("Error creating template", {
          template: template.title,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
