import type { Tables } from "@/integrations/supabase/types";

export type Prompt = Tables<"prompts"> & { share_count?: number };

/**
 * Interface ségrégée : Opérations de LECTURE seules
 * Utilisée par : usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 */
export interface PromptQueryRepository {
  fetchAll(userId: string): Promise<Prompt[]>;
  fetchOwned(userId: string): Promise<Prompt[]>;
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  fetchRecent(userId: string, days?: number, limit?: number): Promise<Prompt[]>;
  fetchFavorites(userId: string, limit?: number): Promise<Prompt[]>;
  fetchPublicShared(userId: string, limit?: number): Promise<Prompt[]>;
  countPublic(): Promise<number>;
}

/**
 * Interface ségrégée : Opérations d'ÉCRITURE complètes
 * Utilisée par : useCreatePrompt, useUpdatePrompt, useDeletePrompt, PromptDuplicationService
 */
export interface PromptCommandRepository {
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
}

/**
 * Interface ségrégée : Opérations de MUTATION partielles
 * Utilisée par : PromptFavoriteService, PromptVisibilityService
 */
export interface PromptMutationRepository {
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
}

/**
 * Interface agrégée pour la rétrocompatibilité et l'implémentation complète
 * Implémentée par : SupabasePromptRepository
 * Utilisée par : PromptRepositoryProvider
 */
export interface PromptRepository extends PromptQueryRepository, PromptCommandRepository {
  // 7 méthodes héritées :
  // - Query: fetchAll, fetchOwned, fetchSharedWithMe, fetchById
  // - Command: create, update, delete
}
