import type { Tables } from "@/integrations/supabase/types";

export type Prompt = Tables<"prompts"> & { share_count?: number };

/**
 * Interface de lecture (Query) - CQRS pattern
 * Utilisée par les hooks de lecture (usePrompts, useOwnedPrompts, etc.)
 * 
 * Principe ISP : Les consommateurs reçoivent uniquement les méthodes de lecture
 */
export interface PromptQueryRepository {
  /**
   * Récupère tous les prompts accessibles par l'utilisateur
   * (prompts possédés + prompts partagés avec lui)
   */
  fetchAll(userId: string): Promise<Prompt[]>;
  
  /**
   * Récupère uniquement les prompts possédés par l'utilisateur
   */
  fetchOwned(userId: string): Promise<Prompt[]>;
  
  /**
   * Récupère uniquement les prompts partagés avec l'utilisateur
   */
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  
  /**
   * Récupère un prompt par son ID
   */
  fetchById(id: string): Promise<Prompt>;
}

/**
 * Interface d'écriture (Command) - CQRS pattern
 * Utilisée par les hooks d'écriture (useCreatePrompt, useDeletePrompt)
 * 
 * Principe ISP : Les consommateurs reçoivent uniquement les méthodes d'écriture complètes
 */
export interface PromptCommandRepository {
  /**
   * Crée un nouveau prompt
   */
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  
  /**
   * Met à jour un prompt existant
   */
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  
  /**
   * Supprime un prompt
   */
  delete(id: string): Promise<void>;
}

/**
 * Interface de mutation légère (Update only)
 * Utilisée par les services qui ne font QUE des mises à jour partielles
 * (PromptFavoriteService, PromptVisibilityService)
 * 
 * Principe ISP : Exposition minimale - 1 seule méthode au lieu de 7
 */
export interface PromptMutationRepository {
  /**
   * Met à jour un prompt existant (update partiel)
   */
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
}

/**
 * Interface complète (backward compatibility)
 * Combine Query + Command pour les consommateurs qui ont besoin de tout
 * (PromptDuplicationService qui fait read + create)
 * 
 * Principe : Composition d'interfaces ségrégées
 */
export interface PromptRepository extends PromptQueryRepository, PromptCommandRepository {
  // Hérite de toutes les méthodes (7 au total)
}
