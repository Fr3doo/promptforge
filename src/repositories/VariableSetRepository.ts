import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type VariableSet = Tables<"variable_sets">;
export type VariableSetInsert = TablesInsert<"variable_sets">;

/**
 * Repository pour gérer les ensembles de variables
 * Isole les accès directs à Supabase pour la table variable_sets
 * 
 * @remarks
 * Les variable sets sont liés aux versions de prompts.
 * L'accès est contrôlé par RLS via le prompt parent.
 */
export interface VariableSetRepository {
  /**
   * Insère plusieurs ensembles de variables en une seule opération
   * @param sets - Tableau des ensembles à insérer (peut être vide)
   * @throws {Error} Si violation RLS (permissions insuffisantes sur le prompt parent)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   * @remarks Retourne immédiatement si sets est vide (no-op)
   */
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
