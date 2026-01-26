import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import { qb } from "@/lib/supabaseQueryBuilder";
import {
  assertSession,
  assertNotSelfShare,
  assertPromptOwner,
  assertShareExists,
  assertShareModifyAuthorization,
} from "@/lib/authorization/ShareAuthorizationChecker";

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

// Type interne pour le profil
type ProfileInfo = {
  id: string;
  name: string | null;
  pseudo: string | null;
  image: string | null;
};

// Type interne pour vérifier le propriétaire
type OwnerRow = { owner_id: string };

export class SupabasePromptShareRepository implements PromptShareRepository {
  async getShares(promptId: string): Promise<PromptShareWithProfile[]> {
    // Fetch shares via qb
    const sharesData = await qb.selectMany<PromptShare>("prompt_shares", {
      filters: { eq: { prompt_id: promptId } },
    });

    if (sharesData.length === 0) {
      return [];
    }

    // Fetch profiles via qb
    const userIds = sharesData.map(s => s.shared_with_user_id);
    const profiles = await qb.selectManyByIds<ProfileInfo>(
      "public_profiles",
      userIds,
      "id"
    );

    // Merge profiles with shares (logique métier préservée)
    return sharesData.map(share => ({
      ...share,
      shared_with_profile: profiles.find(p => p.id === share.shared_with_user_id)
    }));
  }

  // RPC reste avec appel direct (hors scope QueryBuilder)
  async getUserByEmail(email: string): Promise<{ id: string } | null> {
    const result = await supabase.rpc("get_user_id_by_email", { user_email: email });

    if (result.error) {
      handleSupabaseError(result);
    }

    return result.data ? { id: result.data } : null;
  }

  async addShare(
    promptId: string,
    sharedWithUserId: string,
    permission: "READ" | "WRITE",
    currentUserId: string
  ): Promise<void> {
    // Vérifications d'autorisation via module dédié
    assertSession(currentUserId);
    assertNotSelfShare(sharedWithUserId, currentUserId);

    const isOwner = await this.isPromptOwner(promptId, currentUserId);
    assertPromptOwner(isOwner);

    await qb.insertWithoutReturn("prompt_shares", {
      prompt_id: promptId,
      shared_with_user_id: sharedWithUserId,
      permission,
      shared_by: currentUserId,
    });
  }

  async updateSharePermission(
    shareId: string,
    permission: "READ" | "WRITE",
    currentUserId: string
  ): Promise<void> {
    // Vérifications d'autorisation via module dédié
    assertSession(currentUserId);

    const share = await this.getShareById(shareId);
    assertShareExists(share);

    const isOwner = await this.isPromptOwner(share.prompt_id, currentUserId);
    assertShareModifyAuthorization(share, currentUserId, isOwner, "UPDATE");

    await qb.updateWhere("prompt_shares", "id", shareId, { permission });
  }

  async deleteShare(shareId: string, currentUserId: string): Promise<void> {
    // Vérifications d'autorisation via module dédié
    assertSession(currentUserId);

    const share = await this.getShareById(shareId);
    assertShareExists(share);

    const isOwner = await this.isPromptOwner(share.prompt_id, currentUserId);
    assertShareModifyAuthorization(share, currentUserId, isOwner, "DELETE");

    await qb.deleteById("prompt_shares", shareId);
  }

  async isPromptOwner(promptId: string, userId: string): Promise<boolean> {
    const result = await qb.selectFirst<OwnerRow>("prompts", {
      filters: { eq: { id: promptId } },
    }, "owner_id");

    return result?.owner_id === userId;
  }

  async getShareById(shareId: string): Promise<PromptShare | null> {
    return qb.selectOne<PromptShare>("prompt_shares", "id", shareId);
  }
}
