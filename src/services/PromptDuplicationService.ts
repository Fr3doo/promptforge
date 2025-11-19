import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import type { Prompt } from "@/repositories/PromptRepository";
import type { VariableRepository, VariableUpsertInput, Variable } from "@/repositories/VariableRepository";

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
  async duplicate(
    userId: string,
    promptId: string,
    variableRepository: VariableRepository
  ): Promise<Prompt> {
    if (!userId) throw new Error("ID utilisateur requis");

    // Step 1: Fetch original prompt
    const originalPrompt = await this.fetchOriginalPrompt(promptId);

    // Step 2: Fetch original variables
    const originalVariables = await variableRepository.fetch(promptId);

    // Step 3: Create duplicate prompt
    const duplicatedPrompt = await this.createDuplicatePrompt(userId, originalPrompt);

    // Step 4: Duplicate variables if any exist
    if (originalVariables.length > 0) {
      const variableInputs = this.mapVariablesForDuplication(originalVariables);
      await variableRepository.upsertMany(duplicatedPrompt.id, variableInputs);
    }

    return duplicatedPrompt;
  }

  /**
   * Fetches the original prompt to be duplicated
   * @private
   * @param promptId - ID of the prompt to fetch
   * @returns The original prompt data
   */
  private async fetchOriginalPrompt(promptId: string): Promise<Prompt> {
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .single();

    handleSupabaseError(result);
    return result.data as Prompt;
  }

  /**
   * Creates a new prompt as a duplicate of the original
   * @private
   * @param userId - ID of the user creating the duplicate
   * @param originalPrompt - The original prompt data
   * @returns The newly created duplicated prompt
   */
  private async createDuplicatePrompt(userId: string, originalPrompt: Prompt): Promise<Prompt> {
    const duplicatedTitle = `${originalPrompt.title} (Copie)`;

    const result = await supabase
      .from("prompts")
      .insert({
        title: duplicatedTitle,
        content: originalPrompt.content,
        description: originalPrompt.description,
        tags: originalPrompt.tags,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: userId,
      })
      .select()
      .single();

    handleSupabaseError(result);
    return result.data as Prompt;
  }

  /**
   * Maps original variables to input format for duplication
   * @private
   * @param originalVariables - Array of original variables
   * @returns Array of variable inputs ready for upsert (without IDs and prompt_id)
   */
  private mapVariablesForDuplication(originalVariables: Variable[]): VariableUpsertInput[] {
    return originalVariables.map((variable) => ({
      name: variable.name,
      type: variable.type,
      required: variable.required,
      default_value: variable.default_value,
      help: variable.help,
      pattern: variable.pattern,
      options: variable.options,
      order_index: variable.order_index,
    }));
  }
}
