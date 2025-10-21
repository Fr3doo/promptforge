import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type Variable = Tables<"variables">;
export type VariableInsert = TablesInsert<"variables">;

export type VariableUpsertInput = Omit<VariableInsert, "prompt_id"> & { id?: string };

export interface VariableRepository {
  fetch(promptId: string): Promise<Variable[]>;
  create(variable: VariableInsert): Promise<Variable>;
  update(id: string, updates: Partial<Variable>): Promise<Variable>;
  deleteMany(promptId: string): Promise<void>;
  upsertMany(promptId: string, variables: VariableUpsertInput[]): Promise<Variable[]>;
}

/**
 * Repository for managing prompt variables using Supabase
 * 
 * The upsertMany method uses an atomic transaction-like approach:
 * 1. Fetches existing variables to maintain their IDs
 * 2. Maps new variables to existing ones by name
 * 3. Deletes variables that are no longer present
 * 4. Upserts remaining variables (updates existing, inserts new)
 * 
 * This approach avoids mass deletions and preserves variable IDs,
 * ensuring referential integrity and preventing data loss.
 */
export class SupabaseVariableRepository implements VariableRepository {
  async fetch(promptId: string): Promise<Variable[]> {
    if (!promptId) return [];
    
    const result = await supabase
      .from("variables")
      .select("*")
      .eq("prompt_id", promptId)
      .order("order_index", { ascending: true });
    
    handleSupabaseError(result);
    return result.data as Variable[];
  }

  async create(variable: VariableInsert): Promise<Variable> {
    const result = await supabase
      .from("variables")
      .insert(variable)
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async update(id: string, updates: Partial<Variable>): Promise<Variable> {
    const result = await supabase
      .from("variables")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async deleteMany(promptId: string): Promise<void> {
    const result = await supabase
      .from("variables")
      .delete()
      .eq("prompt_id", promptId);
    
    handleSupabaseError(result);
  }

  /**
   * Fetches existing variables for a prompt
   * @private
   */
  private async fetchExistingVariables(promptId: string): Promise<Variable[]> {
    return await this.fetch(promptId);
  }

  /**
   * Prepares variables for upsert by mapping them to existing IDs
   * Supports both name-based matching (updates) and ID-based matching (renames)
   * @private
   */
  private prepareVariablesForUpsert(
    variables: VariableUpsertInput[],
    promptId: string,
    existingVariables: Variable[]
  ): VariableInsert[] {
    const existingByName = new Map(existingVariables.map(v => [v.name, v]));
    const existingById = new Map(existingVariables.map(v => [v.id, v]));

    return variables.map((v, index) => {
      // If the variable has an ID, use it (supports renaming)
      if (v.id && existingById.has(v.id)) {
        return {
          ...v,
          id: v.id,
          prompt_id: promptId,
          order_index: index,
        } as VariableInsert;
      }
      
      // Otherwise, try to match by name (normal update)
      const existingByNameMatch = existingByName.get(v.name);
      return {
        ...v,
        prompt_id: promptId,
        order_index: index,
        ...(existingByNameMatch ? { id: existingByNameMatch.id } : {}),
      } as VariableInsert;
    });
  }

  /**
   * Identifies and deletes variables that are no longer present
   * Takes into account both ID and name to avoid deleting renamed variables
   * @private
   */
  private async deleteObsoleteVariables(
    newVariables: VariableUpsertInput[],
    existingVariables: Variable[]
  ): Promise<void> {
    const newVariableIds = new Set(newVariables.filter(v => v.id).map(v => v.id));
    const newVariableNames = new Set(newVariables.map(v => v.name));
    
    const variablesToDelete = existingVariables.filter(
      ev => !newVariableIds.has(ev.id) && !newVariableNames.has(ev.name)
    );

    if (variablesToDelete.length > 0) {
      const deleteResult = await supabase
        .from("variables")
        .delete()
        .in("id", variablesToDelete.map(v => v.id));

      handleSupabaseError(deleteResult);
    }
  }

  /**
   * Performs the actual upsert operation on variables
   * @private
   */
  private async performVariableUpsert(
    variablesWithIds: VariableInsert[]
  ): Promise<Variable[]> {
    const result = await supabase
      .from("variables")
      .upsert(variablesWithIds, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .order("order_index", { ascending: true });

    handleSupabaseError(result);
    return result.data as Variable[];
  }

  /**
   * Atomic upsert of variables for a prompt
   * 
   * This method ensures data integrity by:
   * - Matching variables by name to preserve IDs (updates)
   * - Matching variables by ID to support renaming
   * - Only deleting variables that are truly removed
   * - Using Supabase upsert with ID conflict resolution
   * - Maintaining order_index for all variables
   * 
   * @param promptId - The ID of the prompt
   * @param variables - Array of variables to upsert (without prompt_id)
   *                    Can include optional `id` field to preserve ID during rename
   * @returns Array of upserted variables
   * 
   * @example
   * ```typescript
   * // Update existing variable and add new one
   * await repository.upsertMany('prompt-123', [
   *   { name: 'existing', type: 'STRING', required: true }, // Will update
   *   { name: 'new', type: 'NUMBER', required: false }      // Will insert
   * ]);
   * 
   * // Rename variable while preserving ID
   * await repository.upsertMany('prompt-123', [
   *   { id: 'var-1', name: 'newName', type: 'STRING', required: true } // Rename
   * ]);
   * ```
   */
  async upsertMany(promptId: string, variables: VariableUpsertInput[]): Promise<Variable[]> {
    // Edge case: No variables means remove all
    if (variables.length === 0) {
      await this.deleteMany(promptId);
      return [];
    }

    try {
      // Step 1: Fetch existing variables
      const existingVariables = await this.fetchExistingVariables(promptId);

      // Step 2: Prepare variables with preserved IDs
      const variablesWithIds = this.prepareVariablesForUpsert(
        variables,
        promptId,
        existingVariables
      );

      // Step 3: Delete obsolete variables
      await this.deleteObsoleteVariables(variables, existingVariables);

      // Step 4: Perform atomic upsert
      return await this.performVariableUpsert(variablesWithIds);
    } catch (error) {
      console.error("Transaction failed in upsertMany:", error);
      throw error;
    }
  }
}
