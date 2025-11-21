import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type Prompt = Tables<"prompts"> & { share_count?: number };

export interface PromptRepository {
  fetchAll(userId: string): Promise<Prompt[]>;
  fetchOwned(userId: string): Promise<Prompt[]>;
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
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
      .order("updated_at", { ascending: false});
    
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
}
