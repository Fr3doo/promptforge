import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type PromptShare = Tables<"prompt_shares">;

export interface PromptShareWithProfile extends PromptShare {
  shared_with_profile?: {
    id: string;
    name: string | null;
    pseudo: string | null;
    image: string | null;
  };
}

/**
 * Repository pour gérer le partage de prompts entre utilisateurs
 * 
 * @remarks
 * Toutes les méthodes nécessitent un utilisateur authentifié.
 * Les opérations sont sécurisées par RLS et vérifications de propriété.
 */
export interface PromptShareRepository {
  /**
   * Récupère tous les partages d'un prompt avec les profils des destinataires
   * @param promptId - ID du prompt (requis, non vide)
   * @returns Liste des partages avec profils (pseudo, name, image)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  getShares(promptId: string): Promise<PromptShareWithProfile[]>;
  
  /**
   * Ajoute un partage pour un prompt
   * @param promptId - ID du prompt à partager (requis, non vide)
   * @param sharedWithUserId - ID du destinataire (requis, non vide)
   * @param permission - Niveau d'accès ("READ" | "WRITE")
   * @param currentUserId - ID de l'utilisateur courant (requis)
   * @throws {Error} "SESSION_EXPIRED" si currentUserId est vide
   * @throws {Error} "SELF_SHARE" si tentative de partage avec soi-même
   * @throws {Error} "NOT_PROMPT_OWNER" si l'utilisateur n'est pas propriétaire
   * @throws {Error} Si violation RLS ou requête échoue
   */
  addShare(promptId: string, sharedWithUserId: string, permission: "READ" | "WRITE", currentUserId: string): Promise<void>;
  
  /**
   * Met à jour la permission d'un partage existant
   * @param shareId - ID du partage (requis, non vide)
   * @param permission - Nouveau niveau d'accès
   * @param currentUserId - ID de l'utilisateur courant (requis)
   * @throws {Error} "SESSION_EXPIRED" si currentUserId est vide
   * @throws {Error} "SHARE_NOT_FOUND" si le partage n'existe pas
   * @throws {Error} "UNAUTHORIZED_UPDATE" si non autorisé
   * @throws {Error} Si la requête échoue
   */
  updateSharePermission(shareId: string, permission: "READ" | "WRITE", currentUserId: string): Promise<void>;
  
  /**
   * Supprime un partage
   * @param shareId - ID du partage (requis, non vide)
   * @param currentUserId - ID de l'utilisateur courant (requis)
   * @throws {Error} "SESSION_EXPIRED" si currentUserId est vide
   * @throws {Error} "SHARE_NOT_FOUND" si le partage n'existe pas
   * @throws {Error} "UNAUTHORIZED_DELETE" si non autorisé
   * @throws {Error} Si la requête échoue
   */
  deleteShare(shareId: string, currentUserId: string): Promise<void>;
  
  /**
   * Récupère l'ID d'un utilisateur par son email
   * @param email - Email de l'utilisateur (requis, format valide)
   * @returns ID de l'utilisateur ou null si non trouvé
   * @throws {Error} Si la fonction RPC échoue
   */
  getUserByEmail(email: string): Promise<{ id: string } | null>;
  
  /**
   * Vérifie si un utilisateur est propriétaire d'un prompt
   * @param promptId - ID du prompt (requis, non vide)
   * @param userId - ID de l'utilisateur (requis, non vide)
   * @returns true si propriétaire, false sinon
   * @throws {Error} Si la requête échoue (hors PGRST116)
   */
  isPromptOwner(promptId: string, userId: string): Promise<boolean>;
  
  /**
   * Récupère un partage par son ID
   * @param shareId - ID du partage (requis, non vide)
   * @returns Le partage ou null si non trouvé
   * @throws {Error} Si la requête échoue
   */
  getShareById(shareId: string): Promise<PromptShare | null>;
}

export class SupabasePromptShareRepository implements PromptShareRepository {
  async getShares(promptId: string): Promise<PromptShareWithProfile[]> {
    // Fetch shares
    const sharesResult = await supabase
      .from("prompt_shares")
      .select("*")
      .eq("prompt_id", promptId);

    handleSupabaseError(sharesResult);
    const sharesData = sharesResult.data || [];

    if (sharesData.length === 0) {
      return [];
    }

    // Fetch profiles via public_profiles view (SECURITY DEFINER, sans email)
    const userIds = sharesData.map(s => s.shared_with_user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from("public_profiles")
      .select("id, name, pseudo, image")
      .in("id", userIds);

    if (profilesError) {
      handleSupabaseError({ data: null, error: profilesError });
    }

    const profiles = profilesData || [];

    // Merge profiles with shares
    return sharesData.map(share => ({
      ...share,
      shared_with_profile: profiles.find(p => p.id === share.shared_with_user_id)
    }));
  }

  async getUserByEmail(email: string): Promise<{ id: string } | null> {
    const result = await supabase.rpc("get_user_id_by_email", { user_email: email });

    if (result.error) {
      handleSupabaseError(result);
    }

    return result.data ? { id: result.data } : null;
  }

  async addShare(promptId: string, sharedWithUserId: string, permission: "READ" | "WRITE", currentUserId: string): Promise<void> {
    if (!currentUserId) throw new Error("SESSION_EXPIRED");

    // Prevent sharing with oneself
    if (sharedWithUserId === currentUserId) {
      throw new Error("SELF_SHARE");
    }

    // Verify that the user is the prompt owner
    const isOwner = await this.isPromptOwner(promptId, currentUserId);
    if (!isOwner) {
      throw new Error("NOT_PROMPT_OWNER");
    }

    const result = await supabase
      .from("prompt_shares")
      .insert({
        prompt_id: promptId,
        shared_with_user_id: sharedWithUserId,
        permission,
        shared_by: currentUserId,
      });

    handleSupabaseError(result);
  }

  async updateSharePermission(shareId: string, permission: "READ" | "WRITE", currentUserId: string): Promise<void> {
    if (!currentUserId) throw new Error("SESSION_EXPIRED");

    // Get share details
    const share = await this.getShareById(shareId);
    if (!share) {
      throw new Error("SHARE_NOT_FOUND");
    }

    // Verify authorization: user must be either the share creator or the prompt owner
    const isSharedBy = share.shared_by === currentUserId;
    const isPromptOwner = await this.isPromptOwner(share.prompt_id, currentUserId);

    if (!isSharedBy && !isPromptOwner) {
      throw new Error("UNAUTHORIZED_UPDATE");
    }

    const result = await supabase
      .from("prompt_shares")
      .update({ permission })
      .eq("id", shareId);

    handleSupabaseError(result);
  }

  async deleteShare(shareId: string, currentUserId: string): Promise<void> {
    if (!currentUserId) throw new Error("SESSION_EXPIRED");

    // Get share details
    const share = await this.getShareById(shareId);
    if (!share) {
      throw new Error("SHARE_NOT_FOUND");
    }

    // Verify authorization: user must be either the share creator or the prompt owner
    const isSharedBy = share.shared_by === currentUserId;
    const isPromptOwner = await this.isPromptOwner(share.prompt_id, currentUserId);

    if (!isSharedBy && !isPromptOwner) {
      throw new Error("UNAUTHORIZED_DELETE");
    }

    const result = await supabase
      .from("prompt_shares")
      .delete()
      .eq("id", shareId);

    handleSupabaseError(result);
  }

  async isPromptOwner(promptId: string, userId: string): Promise<boolean> {
    const result = await supabase
      .from("prompts")
      .select("owner_id")
      .eq("id", promptId)
      .single();

    if (result.error) {
      if (result.error.code === "PGRST116") {
        return false;
      }
      handleSupabaseError(result);
    }

    return result.data?.owner_id === userId;
  }

  async getShareById(shareId: string): Promise<PromptShare | null> {
    const result = await supabase
      .from("prompt_shares")
      .select("*")
      .eq("id", shareId)
      .maybeSingle();

    if (result.error) {
      handleSupabaseError(result);
    }

    return result.data as PromptShare | null;
  }
}
