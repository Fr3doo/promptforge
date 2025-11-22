import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * Repository pour la gestion des profils utilisateur
 * 
 * Gère les opérations CRUD sur les profils stockés dans Supabase
 */
export interface ProfileRepository {
  /**
   * Récupère le profil d'un utilisateur par son ID
   * @param userId - ID de l'utilisateur
   * @returns Le profil de l'utilisateur ou null si non trouvé
   */
  fetchByUserId(userId: string): Promise<Profile | null>;

  /**
   * Met à jour le profil d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param updates - Données à mettre à jour
   * @returns Le profil mis à jour
   */
  update(userId: string, updates: Partial<ProfileUpdate>): Promise<Profile>;
}

/**
 * Implémentation Supabase du repository de profils
 */
export class SupabaseProfileRepository implements ProfileRepository {
  async fetchByUserId(userId: string): Promise<Profile | null> {
    if (!userId) throw new Error("ID utilisateur requis");

    const result = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    handleSupabaseError(result);
    return result.data;
  }

  async update(userId: string, updates: Partial<ProfileUpdate>): Promise<Profile> {
    if (!userId) throw new Error("ID utilisateur requis");

    const result = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    handleSupabaseError(result);
    return result.data;
  }
}
