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
