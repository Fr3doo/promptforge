import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

/**
 * Service dédié à la gestion des favoris de prompts
 * Responsabilité unique : Toggle et gestion du statut favori
 */
export interface PromptFavoriteService {
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
}

export class SupabasePromptFavoriteService implements PromptFavoriteService {
  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    const result = await supabase
      .from("prompts")
      .update({ is_favorite: !currentState })
      .eq("id", id);
    
    handleSupabaseError(result);
  }
}
