import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { qb } from "@/lib/supabaseQueryBuilder";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

/**
 * Repository pour la gestion des profils utilisateur
 * 
 * Gère les opérations CRUD sur les profils stockés dans Supabase
 * 
 * @remarks
 * Toutes les méthodes lèvent une erreur si la connexion à la base échoue.
 * Les implémentations doivent respecter les préconditions documentées.
 */
export interface ProfileRepository {
  /**
   * Récupère le profil d'un utilisateur par son ID
   * @param userId - ID de l'utilisateur (requis, non vide)
   * @returns Le profil de l'utilisateur ou null si non trouvé
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchByUserId(userId: string): Promise<Profile | null>;

  /**
   * Met à jour le profil d'un utilisateur
   * @param userId - ID de l'utilisateur (requis, non vide)
   * @param updates - Données à mettre à jour
   * @returns Le profil mis à jour
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si le profil n'existe pas (PGRST116)
   * @throws {Error} Si violation RLS (tentative de modifier un autre profil)
   * @throws {Error} Si la requête échoue
   */
  update(userId: string, updates: Partial<ProfileUpdate>): Promise<Profile>;
}

/**
 * Implémentation Supabase du repository de profils
 */
export class SupabaseProfileRepository implements ProfileRepository {
  async fetchByUserId(userId: string): Promise<Profile | null> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.selectOne<Profile>("profiles", "id", userId);
  }

  async update(userId: string, updates: Partial<ProfileUpdate>): Promise<Profile> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.updateById<Profile>("profiles", userId, updates);
  }
}
