import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type Version = Tables<"versions">;
export type VersionInsert = TablesInsert<"versions">;

/**
 * Repository pour gérer les versions des prompts
 * Isole les accès directs à Supabase pour la table versions
 */
export interface VersionRepository {
  fetchByPromptId(promptId: string): Promise<Version[]>;
  create(version: VersionInsert): Promise<Version>;
  delete(versionIds: string[]): Promise<void>;
  fetchByIds(versionIds: string[]): Promise<Version[]>;
  updatePromptVersion(promptId: string, semver: string): Promise<void>;
  fetchLatestByPromptId(promptId: string): Promise<Version | null>;
}

export class SupabaseVersionRepository implements VersionRepository {
  async fetchByPromptId(promptId: string): Promise<Version[]> {
    if (!promptId) throw new Error("ID prompt requis");
    
    const result = await supabase
      .from("versions")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data;
  }

  async create(version: VersionInsert): Promise<Version> {
    const result = await supabase
      .from("versions")
      .insert(version)
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async delete(versionIds: string[]): Promise<void> {
    if (!versionIds.length) throw new Error("IDs version requis");
    
    const result = await supabase
      .from("versions")
      .delete()
      .in("id", versionIds);
    
    handleSupabaseError(result);
  }

  async fetchByIds(versionIds: string[]): Promise<Version[]> {
    if (!versionIds.length) throw new Error("IDs version requis");
    
    const result = await supabase
      .from("versions")
      .select("*")
      .in("id", versionIds);
    
    handleSupabaseError(result);
    return result.data;
  }

  async updatePromptVersion(promptId: string, semver: string): Promise<void> {
    const result = await supabase
      .from("prompts")
      .update({ version: semver })
      .eq("id", promptId);
    
    handleSupabaseError(result);
  }

  async fetchLatestByPromptId(promptId: string): Promise<Version | null> {
    if (!promptId) throw new Error("ID prompt requis");
    
    const result = await supabase
      .from("versions")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    // Si aucune version trouvée, retourner null au lieu de throw
    if (result.error?.code === 'PGRST116') {
      return null;
    }
    
    handleSupabaseError(result);
    return result.data;
  }
}
