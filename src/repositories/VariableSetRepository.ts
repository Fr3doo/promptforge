import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type VariableSet = Tables<"variable_sets">;
export type VariableSetInsert = TablesInsert<"variable_sets">;

/**
 * Repository pour gérer les ensembles de variables
 * Isole les accès directs à Supabase pour la table variable_sets
 */
export interface VariableSetRepository {
  bulkInsert(sets: VariableSetInsert[]): Promise<void>;
}

export class SupabaseVariableSetRepository implements VariableSetRepository {
  async bulkInsert(sets: VariableSetInsert[]): Promise<void> {
    if (!sets.length) return;
    
    const result = await supabase
      .from("variable_sets")
      .insert(sets);
    
    handleSupabaseError(result);
  }
}
