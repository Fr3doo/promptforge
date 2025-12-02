/**
 * SupabasePromptCommandRepository - Implémentation spécialisée ÉCRITURE seule
 * 
 * Phase 2 de la migration SRP : séparer les opérations d'écriture du "god service"
 * 
 * Responsabilités :
 * - create : création de nouveaux prompts
 * - update : mise à jour partielle (favoris, visibilité, contenu)
 * - delete : suppression de prompts
 * 
 * Consommateurs prévus :
 * - useCreatePrompt, useUpdatePrompt, useDeletePrompt
 * - PromptDuplicationService (création de la copie)
 * - PromptFavoriteService (via PromptMutationRepository)
 * - PromptVisibilityService (via PromptMutationRepository)
 * 
 * Note : Cette classe implémente aussi PromptMutationRepository
 * car update() est commun aux deux interfaces.
 */

import type { 
  PromptCommandRepository, 
  PromptMutationRepository,
  Prompt 
} from "./PromptRepository.interfaces";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export class SupabasePromptCommandRepository 
  implements PromptCommandRepository, PromptMutationRepository {
  
  async create(
    userId: string, 
    promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">
  ): Promise<Prompt> {
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
    if (!id) throw new Error("ID requis");
    
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
    if (!id) throw new Error("ID requis");
    
    const result = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);
    
    handleSupabaseError(result);
  }
}
