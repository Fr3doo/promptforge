import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type Prompt = Tables<"prompts">;

export interface PromptRepository {
  fetchAll(): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  create(promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  duplicate(promptId: string): Promise<Prompt>;
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
  toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED"): Promise<"PRIVATE" | "SHARED">;
}

export class SupabasePromptRepository implements PromptRepository {
  async fetchAll(): Promise<Prompt[]> {
    const result = await supabase
      .from("prompts")
      .select("*")
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

  async create(promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const result = await supabase
      .from("prompts")
      .insert({
        ...promptData,
        owner_id: user.id,
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

  async duplicate(promptId: string): Promise<Prompt> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    // Récupérer le prompt original
    const fetchResult = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .single();
    
    handleSupabaseError(fetchResult);

    // Créer une copie
    const insertResult = await supabase
      .from("prompts")
      .insert({
        title: `${fetchResult.data.title} (Copie)`,
        content: fetchResult.data.content,
        description: fetchResult.data.description,
        tags: fetchResult.data.tags,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: user.id,
      })
      .select()
      .single();
    
    handleSupabaseError(insertResult);

    // Récupérer et dupliquer les variables
    const { data: originalVariables } = await supabase
      .from("variables")
      .select("*")
      .eq("prompt_id", promptId);

    if (originalVariables && originalVariables.length > 0) {
      const variablesToInsert = originalVariables.map(v => ({
        prompt_id: insertResult.data.id,
        name: v.name,
        type: v.type,
        required: v.required,
        default_value: v.default_value,
        help: v.help,
        pattern: v.pattern,
        options: v.options,
        order_index: v.order_index,
      }));

      await supabase.from("variables").insert(variablesToInsert);
    }

    return insertResult.data;
  }

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    const result = await supabase
      .from("prompts")
      .update({ is_favorite: !currentState })
      .eq("id", id);
    
    handleSupabaseError(result);
  }

  async toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED"): Promise<"PRIVATE" | "SHARED"> {
    const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
    
    const result = await supabase
      .from("prompts")
      .update({ 
        visibility: newVisibility,
        status: "PUBLISHED"
      })
      .eq("id", id);
    
    handleSupabaseError(result);
    return newVisibility;
  }
}
