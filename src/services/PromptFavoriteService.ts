import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";

/**
 * Service dédié à la gestion des favoris de prompts
 * Responsabilité unique : Toggle et gestion du statut favori
 */
export interface PromptFavoriteService {
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
}

export class SupabasePromptFavoriteService implements PromptFavoriteService {
  constructor(private mutationRepository: PromptMutationRepository) {}

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.mutationRepository.update(id, { is_favorite: !currentState });
  }
}
