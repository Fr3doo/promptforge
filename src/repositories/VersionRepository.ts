import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { qb } from "@/lib/supabaseQueryBuilder";
import { requireId, requireIds } from "@/lib/validation/requireId";

export type Version = Tables<"versions">;
export type VersionInsert = TablesInsert<"versions">;

/**
 * Repository pour gérer les versions des prompts
 * Isole les accès directs à Supabase pour la table versions
 */
/**
 * Repository pour gérer les versions des prompts
 * Isole les accès directs à Supabase pour la table versions
 * 
 * @remarks
 * Toutes les méthodes lèvent une erreur si la connexion à la base échoue.
 * Les implémentations doivent respecter les préconditions documentées.
 */
export interface VersionRepository {
  /**
   * Récupère toutes les versions d'un prompt, ordonnées par date décroissante
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @returns Liste des versions triées par created_at DESC
   * @throws {Error} Si promptId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchByPromptId(promptId: string): Promise<Version[]>;

  /**
   * Crée une nouvelle version pour un prompt
   * @param version - Données de la version à créer
   * @returns La version créée avec son id généré
   * @throws {Error} Si version.prompt_id est manquant
   * @throws {Error} Si version.semver est invalide
   * @throws {Error} Si violation RLS (permissions insuffisantes)
   * @throws {Error} Si la requête échoue
   */
  create(version: VersionInsert): Promise<Version>;

  /**
   * Supprime plusieurs versions par leurs identifiants
   * @param versionIds - Liste des IDs de versions à supprimer (requis, non vide)
   * @throws {Error} Si versionIds est vide
   * @throws {Error} Si violation RLS (non propriétaire du prompt parent)
   * @throws {Error} Si la requête échoue
   */
  delete(versionIds: string[]): Promise<void>;

  /**
   * Récupère plusieurs versions par leurs identifiants
   * @param versionIds - Liste des IDs de versions (requis, non vide)
   * @returns Liste des versions correspondantes
   * @throws {Error} Si versionIds est vide
   * @throws {Error} Si la requête échoue
   */
  fetchByIds(versionIds: string[]): Promise<Version[]>;

  /**
   * Récupère la version la plus récente d'un prompt
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @returns La dernière version ou null si aucune version n'existe
   * @throws {Error} Si promptId est vide ou undefined
   * @throws {Error} Si la requête échoue (hors PGRST116 qui retourne null)
   */
  fetchLatestByPromptId(promptId: string): Promise<Version | null>;

  /**
   * Vérifie si une version avec un semver spécifique existe déjà
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @param semver - Version semver à vérifier (requis, non vide)
   * @returns true si la version existe, false sinon
   * @throws {Error} Si promptId est vide ou undefined
   * @throws {Error} Si semver est vide ou undefined
   */
  existsBySemver(promptId: string, semver: string): Promise<boolean>;
}

export class SupabaseVersionRepository implements VersionRepository {
  async fetchByPromptId(promptId: string): Promise<Version[]> {
    requireId(promptId, "ID prompt");
    return qb.selectMany<Version>("versions", {
      filters: { eq: { prompt_id: promptId } },
      order: { column: "created_at", ascending: false },
    });
  }

  async create(version: VersionInsert): Promise<Version> {
    return qb.insertOne<Version, VersionInsert>("versions", version);
  }

  async delete(versionIds: string[]): Promise<void> {
    requireIds(versionIds, "IDs version");
    return qb.deleteByIds("versions", versionIds);
  }

  async fetchByIds(versionIds: string[]): Promise<Version[]> {
    requireIds(versionIds, "IDs version");
    return qb.selectManyByIds<Version>("versions", versionIds);
  }

  async fetchLatestByPromptId(promptId: string): Promise<Version | null> {
    requireId(promptId, "ID prompt");
    return qb.selectFirst<Version>("versions", {
      filters: { eq: { prompt_id: promptId } },
      order: { column: "created_at", ascending: false },
    });
  }

  async existsBySemver(promptId: string, semver: string): Promise<boolean> {
    requireId(promptId, "ID prompt");
    requireId(semver, "Version semver");
    return qb.exists("versions", {
      eq: { prompt_id: promptId, semver },
    });
  }
}
