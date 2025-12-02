/**
 * SupabasePromptQueryRepository - Implémentation spécialisée LECTURE seule
 * 
 * Phase 1 de la migration SRP : séparer les opérations de lecture du "god service"
 * 
 * Responsabilités :
 * - fetchAll, fetchOwned, fetchSharedWithMe, fetchById
 * - fetchRecent, fetchFavorites, fetchPublicShared, countPublic
 * 
 * Consommateurs prévus :
 * - usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 * - PromptDuplicationService (lecture du prompt original)
 * - PromptVisibilityService (lecture avant mutation)
 */

import type { PromptQueryRepository, Prompt } from "./PromptRepository.interfaces";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export class SupabasePromptQueryRepository implements PromptQueryRepository {
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

  async fetchRecent(userId: string, days: number = 7, limit: number = 5): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("owner_id", userId)
      .gte("updated_at", daysAgo.toISOString())
      .order("updated_at", { ascending: false })
      .limit(limit);
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchFavorites(userId: string, limit: number = 5): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("owner_id", userId)
      .eq("is_favorite", true)
      .order("updated_at", { ascending: false })
      .limit(limit);
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchPublicShared(userId: string, limit: number = 5): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("visibility", "SHARED")
      .neq("owner_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async countPublic(): Promise<number> {
    const result = await supabase
      .from("prompts")
      .select("*", { count: "exact", head: true })
      .eq("visibility", "SHARED")
      .eq("status", "PUBLISHED");
    
    handleSupabaseError(result);
    return result.count ?? 0;
  }
}
