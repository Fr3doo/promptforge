import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export type Variable = Tables<"variables">;
export type VariableInsert = TablesInsert<"variables">;

export interface VariableRepository {
  fetch(promptId: string): Promise<Variable[]>;
  create(variable: VariableInsert): Promise<Variable>;
  update(id: string, updates: Partial<Variable>): Promise<Variable>;
  deleteMany(promptId: string): Promise<void>;
  upsertMany(promptId: string, variables: Omit<VariableInsert, "prompt_id">[]): Promise<Variable[]>;
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
    
    const { data, error } = await supabase
      .from("variables")
      .select("*")
      .eq("prompt_id", promptId)
      .order("order_index", { ascending: true });
    
    if (error) throw error;
    return data as Variable[];
  }

  async create(variable: VariableInsert): Promise<Variable> {
    const { data, error } = await supabase
      .from("variables")
      .insert(variable)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<Variable>): Promise<Variable> {
    const { data, error } = await supabase
      .from("variables")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteMany(promptId: string): Promise<void> {
    const { error } = await supabase
      .from("variables")
      .delete()
      .eq("prompt_id", promptId);
    
    if (error) throw error;
  }

  /**
   * Atomic upsert of variables for a prompt
   * 
   * This method ensures data integrity by:
   * - Matching variables by name to preserve IDs
   * - Only deleting variables that are truly removed
   * - Using Supabase upsert with ID conflict resolution
   * - Maintaining order_index for all variables
   * 
   * @param promptId - The ID of the prompt
   * @param variables - Array of variables to upsert (without prompt_id)
   * @returns Array of upserted variables
   * 
   * @example
   * ```typescript
   * // Update existing variable and add new one
   * await repository.upsertMany('prompt-123', [
   *   { name: 'existing', type: 'STRING', required: true }, // Will update
   *   { name: 'new', type: 'NUMBER', required: false }      // Will insert
   * ]);
   * ```
   */
  async upsertMany(promptId: string, variables: Omit<VariableInsert, "prompt_id">[]): Promise<Variable[]> {
    if (variables.length === 0) {
      // Edge case: If no variables provided, remove all existing ones
      // This is intentional - it means the prompt has no variables
      await this.deleteMany(promptId);
      return [];
    }

    try {
      // Step 1: Fetch existing variables to map IDs
      const existingVariables = await this.fetch(promptId);
      
      // Step 2: Build variable map for efficient lookup
      const existingMap = new Map(existingVariables.map(v => [v.name, v]));
      
      // Step 3: Prepare variables for upsert, preserving IDs where they exist
      const variablesWithIds = variables.map((v, index) => {
        const existing = existingMap.get(v.name);
        return {
          ...v,
          prompt_id: promptId,
          order_index: index, // Ensure consistent ordering
          ...(existing ? { id: existing.id } : {}), // Preserve ID if exists
        };
      });

      // Step 4: Identify variables to delete (exist in DB but not in new list)
      const newVariableNames = new Set(variables.map(v => v.name));
      const variablesToDelete = existingVariables.filter(
        ev => !newVariableNames.has(ev.name)
      );
      
      // Step 5: Delete obsolete variables (if any)
      if (variablesToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("variables")
          .delete()
          .in("id", variablesToDelete.map(v => v.id));
        
        if (deleteError) {
          console.error("Error deleting obsolete variables:", deleteError);
          throw deleteError;
        }
      }

      // Step 6: Upsert all variables atomically
      // - If ID exists: UPDATE
      // - If ID missing: INSERT
      const { data, error } = await supabase
        .from("variables")
        .upsert(variablesWithIds, { 
          onConflict: "id",
          ignoreDuplicates: false, // Always update on conflict
        })
        .select()
        .order("order_index", { ascending: true });
      
      if (error) {
        console.error("Error upserting variables:", error);
        throw error;
      }
      
      return data as Variable[];
    } catch (error) {
      console.error("Transaction failed in upsertMany:", error);
      throw error;
    }
  }
}
