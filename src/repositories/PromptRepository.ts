import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import type { VariableRepository } from "./VariableRepository";

export type Prompt = Tables<"prompts">;

export interface PromptRepository {
  fetchAll(): Promise<Prompt[]>;
  fetchOwned(): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
  toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED", publicPermission?: "READ" | "WRITE"): Promise<"PRIVATE" | "SHARED">;
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

  async fetchOwned(): Promise<Prompt[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié");
    
    const result = await supabase
      .from("prompts")
      .select("*")
      .eq("owner_id", user.id)
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

  /**
   * Duplicates a prompt and its variables
   * Uses VariableRepository for clean separation of concerns
   * 
   * @param userId - ID of the authenticated user creating the duplicate
   * @param promptId - ID of the prompt to duplicate
   * @param variableRepository - Repository for managing variables
   * @returns The newly created duplicate prompt
   */
  async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
    if (!userId) throw new Error("ID utilisateur requis");

    // Step 1: Fetch the original prompt
    const fetchResult = await supabase
      .from("prompts")
      .select("*")
      .eq("id", promptId)
      .single();
    
    handleSupabaseError(fetchResult);

    // Step 2: Fetch original variables using VariableRepository
    const originalVariables = await variableRepository.fetch(promptId);

    // Step 3: Create the duplicate prompt
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
        owner_id: userId,
      })
      .select()
      .single();
    
    handleSupabaseError(insertResult);

    // Step 4: Duplicate variables using VariableRepository.upsertMany
    if (originalVariables.length > 0) {
      const variablesToDuplicate = originalVariables.map(v => ({
        name: v.name,
        type: v.type,
        required: v.required,
        default_value: v.default_value,
        help: v.help,
        pattern: v.pattern,
        options: v.options,
        order_index: v.order_index,
      }));

      await variableRepository.upsertMany(insertResult.data.id, variablesToDuplicate);
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

  async toggleVisibility(
    id: string, 
    currentVisibility: "PRIVATE" | "SHARED",
    publicPermission?: "READ" | "WRITE"
  ): Promise<"PRIVATE" | "SHARED"> {
    // If already shared and only the permission is changing, update only public_permission
    if (currentVisibility === "SHARED" && publicPermission) {
      const permResult = await supabase
        .from("prompts")
        .update({ public_permission: publicPermission })
        .eq("id", id);

      handleSupabaseError(permResult);
      return "SHARED";
    }

    // Otherwise, toggle PRIVATE <-> SHARED
    const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
    
    const updateData: { 
      visibility: "PRIVATE" | "SHARED"; 
      status?: "PUBLISHED";
      public_permission?: "READ" | "WRITE";
    } = {
      visibility: newVisibility
    };

    // Only force PUBLISHED status when going public, not when returning to private
    if (newVisibility === "SHARED") {
      updateData.status = "PUBLISHED";
      if (publicPermission) {
        updateData.public_permission = publicPermission;
      }
    }
    
    const result = await supabase
      .from("prompts")
      .update(updateData)
      .eq("id", id);
    
    handleSupabaseError(result);
    return newVisibility;
  }
}
