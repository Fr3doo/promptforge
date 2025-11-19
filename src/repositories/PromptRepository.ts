import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import type { VariableRepository, VariableUpsertInput, Variable } from "./VariableRepository";

export type Prompt = Tables<"prompts"> & { share_count?: number };

export interface PromptRepository {
  fetchAll(userId: string): Promise<Prompt[]>;
  fetchOwned(userId: string): Promise<Prompt[]>;
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
}

export class SupabasePromptRepository implements PromptRepository {
  async fetchAll(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchOwned(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchSharedWithMe(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    // Fetch prompt_ids shared with the current user
    const sharesResult = await supabase
      .from("prompt_shares")
      .select("prompt_id")
      .eq("shared_with_user_id", userId);
    
    handleSupabaseError(sharesResult);
    
    if (!sharesResult.data || sharesResult.data.length === 0) {
      return [];
    }
    
    const promptIds = sharesResult.data.map(share => share.prompt_id);
    
    // Fetch the actual prompts
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .in("id", promptIds)
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchById(id: string): Promise<Prompt> {
    if (!id) throw new Error("ID requis");
    
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();
    
    handleSupabaseError(result);
    return result.data as Prompt;
  }

  async create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
    if (!userId) throw new Error("ID utilisateur requis");

    const result = await supabase
      .from("prompts")
      .insert({
        ...promptData,
        owner_id: userId,
      })
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async update(id: string, updates: Partial<Prompt>): Promise<Prompt> {
    const result = await supabase
      .from("prompts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async delete(id: string): Promise<void> {
    const result = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);
    
    handleSupabaseError(result);
  }

  /**
   * Fetches the original prompt to be duplicated
   * @private
   * @param promptId - ID of the prompt to fetch
   * @returns The original prompt
   * @throws Error if prompt not found or database error
   */
  private async fetchOriginalPrompt(promptId: string): Promise<Prompt> {
    const fetchResult = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .single();
    
    handleSupabaseError(fetchResult);
    return fetchResult.data as Prompt;
  }

  /**
   * Creates a duplicate prompt with default values
   * @private
   * @param userId - ID of the user creating the duplicate
   * @param original - The original prompt to duplicate
   * @returns The newly created duplicate prompt
   * @throws Error if creation fails
   */
  private async createDuplicatePrompt(userId: string, original: Prompt): Promise<Prompt> {
    const insertResult = await supabase
      .from("prompts")
      .insert({
        title: `${original.title} (Copie)`,
        content: original.content,
        description: original.description,
        tags: original.tags,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: userId,
      })
      .select()
      .single();
    
    handleSupabaseError(insertResult);
    return insertResult.data as Prompt;
  }

  /**
   * Maps original variables to the format needed for duplication
   * Removes id and prompt_id to allow creation of new variable records
   * @private
   * @param originalVariables - The variables from the original prompt
   * @returns Array of variable data ready for upsertMany
   */
  private mapVariablesForDuplication(originalVariables: Variable[]): VariableUpsertInput[] {
    return originalVariables.map(v => ({
      name: v.name,
      type: v.type,
      required: v.required,
      default_value: v.default_value,
      help: v.help,
      pattern: v.pattern,
      options: v.options,
      order_index: v.order_index,
    }));
  }

  /**
   * Duplicates a prompt and its variables
   * Uses VariableRepository for clean separation of concerns
   * 
   * Implementation is split into private methods for better readability (KISS principle):
   * - {@link fetchOriginalPrompt} - Retrieves the source prompt from database
   * - {@link createDuplicatePrompt} - Creates the new prompt with default values (PRIVATE, DRAFT, version 1.0.0)
   * - {@link mapVariablesForDuplication} - Transforms variables for insertion (removes id and prompt_id)
   * 
   * @param userId - ID of the authenticated user creating the duplicate
   * @param promptId - ID of the prompt to duplicate
   * @param variableRepository - Repository for managing variables
   * @returns The newly created duplicate prompt
   * @throws {Error} If userId is missing ("ID utilisateur requis")
   * @throws {Error} If original prompt not found (propagated from fetchOriginalPrompt)
   * @throws {Error} If duplication fails (propagated from createDuplicatePrompt or upsertMany)
   * 
   * @example
   * ```typescript
   * const duplicated = await promptRepository.duplicate(
   *   "user-uuid",
   *   "prompt-uuid",
   *   variableRepository
   * );
   * console.log(duplicated.title); // "Original Title (Copie)"
   * console.log(duplicated.visibility); // "PRIVATE"
   * console.log(duplicated.version); // "1.0.0"
   * ```
   */
  async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
    if (!userId) throw new Error("ID utilisateur requis");

    // Step 1: Fetch the original prompt
    const original = await this.fetchOriginalPrompt(promptId);

    // Step 2: Fetch original variables using VariableRepository
    const originalVariables = await variableRepository.fetch(promptId);

    // Step 3: Create the duplicate prompt with default values
    const duplicated = await this.createDuplicatePrompt(userId, original);

    // Step 4: Duplicate variables if any exist
    if (originalVariables.length > 0) {
      const variablesToDuplicate = this.mapVariablesForDuplication(originalVariables);
      await variableRepository.upsertMany(duplicated.id, variablesToDuplicate);
    }

    return duplicated;
  }


}
