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

  async upsertMany(promptId: string, variables: Omit<VariableInsert, "prompt_id">[]): Promise<Variable[]> {
    if (variables.length === 0) {
      // Si aucune variable, supprimer toutes les variables existantes
      await this.deleteMany(promptId);
      return [];
    }

    // Récupérer les variables existantes pour obtenir leurs IDs
    const existingVariables = await this.fetch(promptId);
    
    // Mapper les nouvelles variables avec leurs IDs si elles existent déjà
    const variablesWithIds = variables.map((v, index) => {
      const existing = existingVariables.find(ev => ev.name === v.name);
      return {
        ...v,
        prompt_id: promptId,
        ...(existing ? { id: existing.id } : {}),
        order_index: index, // Assurer l'ordre correct
      };
    });

    // Supprimer les variables qui ne sont plus présentes
    const variablesToDelete = existingVariables.filter(
      ev => !variables.some(v => v.name === ev.name)
    );
    
    if (variablesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("variables")
        .delete()
        .in("id", variablesToDelete.map(v => v.id));
      
      if (deleteError) throw deleteError;
    }

    // Upsert les variables (insert ou update selon si id existe)
    const { data, error } = await supabase
      .from("variables")
      .upsert(variablesWithIds, { onConflict: "id" })
      .select();
    
    if (error) throw error;
    return data;
  }
}
