/**
 * SupabasePromptCommandRepository - Implémentation spécialisée ÉCRITURE seule
 * 
 * Phase 2 de la migration SRP : séparer les opérations d'écriture du "god service"
 * 
 * Responsabilités :
 * - create : création de nouveaux prompts
 * - update : mise à jour partielle (favoris, visibilité, contenu)
 * - delete : suppression de prompts
 * 
 * Consommateurs prévus :
 * - useCreatePrompt, useUpdatePrompt, useDeletePrompt
 * - PromptDuplicationService (création de la copie)
 * - PromptFavoriteService (via PromptMutationRepository)
 * - PromptVisibilityService (via PromptMutationRepository)
 * 
 * Note : Cette classe implémente aussi PromptMutationRepository
 * car update() est commun aux deux interfaces.
 */

import type { 
  PromptCommandRepository, 
  PromptMutationRepository,
  Prompt 
} from "./PromptRepository.interfaces";
import { qb } from "@/lib/supabaseQueryBuilder";
import { requireId } from "@/lib/validation/requireId";

export class SupabasePromptCommandRepository
  implements PromptCommandRepository, PromptMutationRepository {
  
  async create(
    userId: string, 
    promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">
  ): Promise<Prompt> {
    requireId(userId, "ID utilisateur");
    return qb.insertOne<Prompt, typeof promptData & { owner_id: string }>(
      "prompts", 
      { ...promptData, owner_id: userId }
    );
  }

  async update(id: string, updates: Partial<Prompt>): Promise<Prompt> {
    requireId(id, "ID");
    return qb.updateById<Prompt>("prompts", id, updates);
  }

  async updateVersion(promptId: string, semver: string): Promise<void> {
    requireId(promptId, "ID prompt");
    await qb.updateWhere("prompts", "id", promptId, { version: semver });
  }

  async delete(id: string): Promise<void> {
    requireId(id, "ID");
    return qb.deleteById("prompts", id);
  }
}
