import type { PromptCommandRepository, Prompt } from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";
import type { ImportResult } from "@/lib/promptImport";
import { requireId } from "@/lib/validation/requireId";
import { fromImportables } from "@/lib/variables/variableMappers";

/**
 * Service dédié à l'import de prompts et de leurs variables
 * 
 * Responsabilité unique : Gérer l'import complet d'un prompt (métadonnées + variables)
 * 
 * @example
 * ```typescript
 * const service = new SupabasePromptImportService();
 * 
 * // Importer un prompt avec ses variables
 * const imported = await service.import(
 *   "user-id",
 *   parseResult,
 *   commandRepository,
 *   variableRepository
 * );
 * // => Nouveau prompt avec visibility=PRIVATE, status=DRAFT
 * ```
 */
export interface PromptImportService {
  /**
   * Importe un prompt et ses variables associées
   * 
   * @param userId - ID de l'utilisateur créant le prompt
   * @param data - Données parsées de l'import (prompt + variables)
   * @param commandRepository - Repository pour créer le prompt
   * @param variableRepository - Repository pour créer les variables
   * @returns Le prompt créé avec son ID
   * 
   * @remarks
   * Le prompt importé aura :
   * - visibility : PRIVATE (toujours)
   * - status : PUBLISHED (prêt à utiliser)
   * - version : celle de l'import ou 1.0.0 par défaut
   * - is_favorite : false
   * - Variables : Créées avec les métadonnées importées
   * 
   * @throws {Error} "ID utilisateur requis" si userId est vide
   * @throws {Error} Erreurs Supabase si insert échoue
   */
  import(
    userId: string,
    data: ImportResult,
    commandRepository: PromptCommandRepository,
    variableRepository: VariableRepository
  ): Promise<Prompt>;
}

export class SupabasePromptImportService implements PromptImportService {
  async import(
    userId: string,
    data: ImportResult,
    commandRepository: PromptCommandRepository,
    variableRepository: VariableRepository
  ): Promise<Prompt> {
    requireId(userId, "ID utilisateur");

    const { prompt, variables } = data;

    // Step 1: Create the prompt
    const createdPrompt = await commandRepository.create(userId, {
      title: prompt.title,
      content: prompt.content,
      description: prompt.description,
      tags: prompt.tags || [],
      visibility: "PRIVATE", // Always private on import
      version: prompt.version || "1.0.0",
      status: "PUBLISHED",
      is_favorite: false,
      public_permission: "READ",
    });

    // Step 2: Create variables if any exist (using centralized mapper)
    if (variables.length > 0) {
      const variableInputs = fromImportables(variables);
      await variableRepository.upsertMany(createdPrompt.id, variableInputs);
    }

    return createdPrompt;
  }
}
