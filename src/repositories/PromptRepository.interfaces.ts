import type { Tables } from "@/integrations/supabase/types";
import type { Permission } from "@/constants/domain-types";

// Type de permission de partage (alias pour rétrocompatibilité)
export type SharePermission = Permission;

// Type de base - données persistées
export type Prompt = Tables<"prompts"> & { share_count?: number };

// Type enrichi - contexte "partagé avec moi"
export type PromptWithSharePermission = Prompt & {
  shared_permission?: SharePermission;
};

/**
 * Interface ségrégée : Opérations de LECTURE seules
 * Utilisée par : usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 * 
 * @remarks
 * Toutes les méthodes lèvent une erreur si la connexion à la base échoue.
 * Les implémentations doivent respecter les préconditions documentées pour
 * garantir la substituabilité (LSP).
 */
export interface PromptQueryRepository {
  /**
   * Récupère tous les prompts accessibles par l'utilisateur (owned + shared)
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @returns Liste des prompts accessibles, peut être vide
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchAll(userId: string): Promise<Prompt[]>;

  /**
   * Récupère les prompts dont l'utilisateur est propriétaire
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @returns Liste des prompts possédés, peut être vide
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchOwned(userId: string): Promise<Prompt[]>;

  /**
   * Récupère les prompts partagés avec l'utilisateur
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @returns Liste des prompts avec leurs permissions de partage, peut être vide
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchSharedWithMe(userId: string): Promise<PromptWithSharePermission[]>;

  /**
   * Récupère un prompt par son identifiant
   * @param id - Identifiant UUID du prompt (requis, non vide)
   * @returns Le prompt correspondant
   * @throws {Error} Si id est vide ou undefined
   * @throws {Error} Si le prompt n'existe pas (code PGRST116)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchById(id: string): Promise<Prompt>;

  /**
   * Récupère les prompts récemment modifiés par l'utilisateur
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @param days - Nombre de jours à considérer (optionnel, défaut: 7)
   * @param limit - Nombre maximum de résultats (optionnel, défaut: 5)
   * @returns Liste des prompts récents ordonnés par date décroissante
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchRecent(userId: string, days?: number, limit?: number): Promise<Prompt[]>;

  /**
   * Récupère les prompts marqués comme favoris par l'utilisateur
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @param limit - Nombre maximum de résultats (optionnel)
   * @returns Liste des prompts favoris
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchFavorites(userId: string, limit?: number): Promise<Prompt[]>;

  /**
   * Récupère les prompts publiquement partagés (visibilité SHARED, statut PUBLISHED)
   * @param userId - Identifiant de l'utilisateur courant (pour exclure ses propres prompts)
   * @param limit - Nombre maximum de résultats (optionnel)
   * @returns Liste des prompts publics d'autres utilisateurs
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchPublicShared(userId: string, limit?: number): Promise<Prompt[]>;

  /**
   * Compte le nombre total de prompts publics dans le système
   * @returns Nombre de prompts publics (visibilité SHARED, statut PUBLISHED)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  countPublic(): Promise<number>;
}

/**
 * Interface ségrégée : Opérations d'ÉCRITURE complètes
 * Utilisée par : useCreatePrompt, useUpdatePrompt, useDeletePrompt, PromptDuplicationService
 * 
 * @remarks
 * Les opérations d'écriture sont soumises aux politiques RLS (Row Level Security).
 * L'utilisateur doit être authentifié et avoir les permissions appropriées.
 * Les implémentations doivent respecter les préconditions documentées pour
 * garantir la substituabilité (LSP).
 */
export interface PromptCommandRepository {
  /**
   * Crée un nouveau prompt pour l'utilisateur spécifié
   * @param userId - Identifiant du propriétaire (requis, non vide, doit correspondre à l'utilisateur authentifié)
   * @param promptData - Données du prompt (title requis et non vide, content requis)
   * @returns Le prompt créé avec son id UUID généré et timestamps
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si promptData.title est vide ou manquant
   * @throws {Error} Si promptData.content est manquant
   * @throws {Error} Si violation RLS (userId ne correspond pas à l'utilisateur authentifié)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;

  /**
   * Met à jour un prompt existant
   * @param id - Identifiant UUID du prompt (requis, non vide)
   * @param updates - Champs à mettre à jour (au moins un champ requis)
   * @returns Le prompt mis à jour avec updated_at actualisé
   * @throws {Error} Si id est vide ou undefined
   * @throws {Error} Si le prompt n'existe pas (code PGRST116)
   * @throws {Error} Si violation RLS (non propriétaire ou permission WRITE manquante)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;

  /**
   * Supprime un prompt et toutes ses données associées (versions, variables, partages)
   * @param id - Identifiant UUID du prompt (requis, non vide)
   * @throws {Error} Si id est vide ou undefined
   * @throws {Error} Si le prompt n'existe pas
   * @throws {Error} Si violation RLS (seul le propriétaire peut supprimer)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  delete(id: string): Promise<void>;
}

/**
 * Interface ségrégée : Opérations de MUTATION partielles
 * Utilisée par : PromptFavoriteService, PromptVisibilityService, VersionDeletionService
 * 
 * @remarks
 * Interface minimale pour les services ne nécessitant que la mise à jour.
 * Respecte le principe ISP (Interface Segregation Principle) en exposant
 * uniquement ce qui est nécessaire aux consommateurs.
 * Les implémentations doivent respecter les préconditions documentées pour
 * garantir la substituabilité (LSP).
 */
export interface PromptMutationRepository {
  /**
   * Met à jour un prompt existant (mutation partielle)
   * @param id - Identifiant UUID du prompt (requis, non vide)
   * @param updates - Champs à mettre à jour (typiquement is_favorite ou visibility)
   * @returns Le prompt mis à jour avec updated_at actualisé
   * @throws {Error} Si id est vide ou undefined
   * @throws {Error} Si le prompt n'existe pas (code PGRST116)
   * @throws {Error} Si violation RLS (permissions insuffisantes pour cette mutation)
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;

  /**
   * Met à jour le champ version d'un prompt (synchronisation semver)
   * Utilisé après création/suppression de versions pour maintenir la cohérence
   * 
   * @param promptId - Identifiant du prompt (requis, non vide)
   * @param semver - Nouvelle version au format semver (ex: "1.2.0")
   * @throws {Error} Si promptId est vide
   * @throws {Error} Si violation RLS (non propriétaire)
   * @throws {Error} Si la requête échoue
   */
  updateVersion(promptId: string, semver: string): Promise<void>;
}

/**
 * Interface agrégée pour la rétrocompatibilité et l'implémentation complète
 * Implémentée par : SupabasePromptRepository (legacy), SupabasePromptCommandRepository
 * Utilisée par : Providers qui nécessitent l'interface complète
 * 
 * @remarks
 * Cette interface combine Query et Command pour les cas où une implémentation
 * unique est préférable (ex: tests d'intégration, migration progressive).
 * Préférer les interfaces ségrégées (PromptQueryRepository, PromptCommandRepository)
 * pour les nouveaux consommateurs.
 */
export interface PromptRepository extends PromptQueryRepository, PromptCommandRepository {
  // 11 méthodes héritées :
  // - Query (8): fetchAll, fetchOwned, fetchSharedWithMe, fetchById, fetchRecent, fetchFavorites, fetchPublicShared, countPublic
  // - Command (3): create, update, delete
}
