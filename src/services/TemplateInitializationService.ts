import { logError } from "@/lib/logger";
import { exampleTemplates, type ExampleTemplate } from "@/lib/exampleTemplates";
import type { PromptQueryRepository, PromptCommandRepository, Prompt } from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";
import type { VariableSetRepository } from "@/repositories/VariableSetRepository";

/**
 * Service responsable de l'initialisation des templates d'exemple
 * 
 * Suit le principe SRP (Single Responsibility Principle)
 * et le principe DIP (Dependency Inversion Principle)
 * 
 * Gère uniquement la création des templates lors de la première connexion
 * 
 * @remarks
 * Les méthodes privées sont décomposées en responsabilités granulaires :
 * - createAllTemplates : orchestration de la boucle
 * - createSingleTemplate : création d'un template complet
 * - createPromptFromTemplate : persistance du prompt
 * - createVariablesForPrompt : persistance des variables
 * - createVariableSetsForPrompt : persistance des sets de variables
 */
export class TemplateInitializationService {
  constructor(
    private readonly promptQueryRepository: PromptQueryRepository,
    private readonly promptCommandRepository: PromptCommandRepository,
    private readonly variableRepository: VariableRepository,
    private readonly variableSetRepository: VariableSetRepository
  ) {}

  /**
   * Vérifie si des templates doivent être créés pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns true si aucun prompt n'existe, false sinon
   */
  async shouldCreateTemplates(userId: string): Promise<boolean> {
    try {
      const prompts = await this.promptQueryRepository.fetchOwned(userId);
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

    await this.createAllTemplates(userId);
  }

  /**
   * Crée tous les templates d'exemple pour un utilisateur
   * Orchestre la boucle de création sans logique métier
   * @param userId - ID de l'utilisateur
   * @private
   */
  private async createAllTemplates(userId: string): Promise<void> {
    for (const template of exampleTemplates) {
      await this.createSingleTemplate(userId, template);
    }
  }

  /**
   * Crée un template complet (prompt + variables + sets)
   * Gère les erreurs au niveau du template pour ne pas bloquer les autres
   * @param userId - ID de l'utilisateur
   * @param template - Définition du template à créer
   * @private
   */
  private async createSingleTemplate(userId: string, template: ExampleTemplate): Promise<void> {
    try {
      const prompt = await this.createPromptFromTemplate(userId, template);
      await this.createVariablesForPrompt(prompt.id, template);
      await this.createVariableSetsForPrompt(prompt.id, template);
    } catch (error) {
      logError("Error creating template", {
        template: template.title,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Crée le prompt à partir de la définition du template
   * @param userId - ID de l'utilisateur
   * @param template - Définition du template
   * @returns Le prompt créé
   * @private
   */
  private async createPromptFromTemplate(userId: string, template: ExampleTemplate): Promise<Prompt> {
    return await this.promptCommandRepository.create(userId, {
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
  }

  /**
   * Crée les variables pour un prompt à partir du template
   * Gère les erreurs individuellement pour ne pas bloquer les autres variables
   * @param promptId - ID du prompt parent
   * @param template - Définition du template contenant les variables
   * @private
   */
  private async createVariablesForPrompt(promptId: string, template: ExampleTemplate): Promise<void> {
    if (template.variables.length === 0) return;

    for (const variable of template.variables) {
      try {
        await this.variableRepository.create({
          prompt_id: promptId,
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

  /**
   * Crée les sets de variables pour un prompt à partir du template
   * @param promptId - ID du prompt parent
   * @param template - Définition du template contenant les sets
   * @private
   */
  private async createVariableSetsForPrompt(promptId: string, template: ExampleTemplate): Promise<void> {
    if (template.variableSets.length === 0) return;

    try {
      const setsToInsert = template.variableSets.map((set) => ({
        prompt_id: promptId,
        name: set.name,
        values: set.values,
      }));

      await this.variableSetRepository.bulkInsert(setsToInsert);
    } catch (error) {
      logError("Error creating template variable sets", {
        template: template.title,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
