import type { PromptRepository } from "@/repositories/PromptRepository";

/**
 * Service dédié à la gestion des favoris de prompts
 * Responsabilité unique : Toggle et gestion du statut favori
 */
export interface PromptFavoriteService {
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
}

export class SupabasePromptFavoriteService implements PromptFavoriteService {
  constructor(private promptRepository: PromptRepository) {}

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.promptRepository.update(id, { is_favorite: !currentState });
  }
}
