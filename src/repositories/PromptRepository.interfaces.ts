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
