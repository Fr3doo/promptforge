import type { 
  PromptQueryRepository, 
  PromptCommandRepository,
  Prompt 
} from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";
import { requireId } from "@/lib/validation/requireId";
import { toVariableUpsertInputs } from "@/lib/variables/variableMappers";

/**
 * Service dédié à la duplication de prompts et de leurs variables
 * 
 * Responsabilité unique : Gérer la copie complète d'un prompt (métadonnées + variables)
 * 
 * @example
 * ```typescript
 * const service = new SupabasePromptDuplicationService();
 * 
 * // Dupliquer un prompt avec ses variables
 * const duplicate = await service.duplicate(
 *   "user-id",
 *   "prompt-id",
 *   variableRepository
 * );
 * // => Nouveau prompt avec titre "${original} (Copie)", visibility=PRIVATE, status=DRAFT
 * ```
 */
export interface PromptDuplicationService {
  /**
   * Duplique un prompt et ses variables associées
   * 
   * @param userId - ID de l'utilisateur créant la copie
   * @param promptId - ID du prompt à dupliquer
   * @param variableRepository - Repository des variables pour copier les variables associées
   * @returns Le prompt dupliqué (nouveau prompt avec toutes ses variables)
   * 
   * @remarks
   * Le prompt dupliqué aura :
   * - Titre : "${original} (Copie)"
   * - visibility : PRIVATE (toujours)
   * - status : DRAFT (toujours)
   * - version : 1.0.0 (reset)
   * - is_favorite : false (reset)
   * - Même contenu, description, tags que l'original
   * - Variables : Copie exacte des variables de l'original (nouveaux IDs)
   * 
   * @throws {Error} "ID utilisateur requis" si userId est vide
   * @throws {Error} Erreurs Supabase si fetch ou insert échouent
   */
  duplicate(
    userId: string,
    promptId: string,
    variableRepository: VariableRepository
  ): Promise<Prompt>;
}

export class SupabasePromptDuplicationService implements PromptDuplicationService {
  constructor(
    private queryRepository: PromptQueryRepository,
    private commandRepository: PromptCommandRepository
  ) {}

  async duplicate(
    userId: string,
    promptId: string,
    variableRepository: VariableRepository
  ): Promise<Prompt> {
    requireId(userId, "ID utilisateur");

    // Step 1: Fetch original prompt (delegated to repository)
    const originalPrompt = await this.queryRepository.fetchById(promptId);

    // Step 2: Fetch original variables
    const originalVariables = await variableRepository.fetch(promptId);

    // Step 3: Create duplicate prompt (delegated to repository)
    const duplicatedPrompt = await this.commandRepository.create(userId, {
      title: `${originalPrompt.title} (Copie)`,
      content: originalPrompt.content,
      description: originalPrompt.description,
      tags: originalPrompt.tags,
      visibility: "PRIVATE",
      version: "1.0.0",
      status: "DRAFT",
      is_favorite: false,
      public_permission: "READ",
    });

    // Step 4: Duplicate variables if any exist (using centralized mapper)
    if (originalVariables.length > 0) {
      const variableInputs = toVariableUpsertInputs(originalVariables);
      await variableRepository.upsertMany(duplicatedPrompt.id, variableInputs);
    }

    return duplicatedPrompt;
  }
}
