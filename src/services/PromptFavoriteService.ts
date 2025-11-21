import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";

/**
 * Service dédié à la gestion des favoris de prompts
 * Responsabilité unique : Toggle et gestion du statut favori
 */
export interface PromptFavoriteService {
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
}

export class SupabasePromptFavoriteService implements PromptFavoriteService {
  /**
   * Injection ISP : Reçoit uniquement PromptMutationRepository (1 méthode)
   * Au lieu de PromptRepository complet (7 méthodes)
   * Réduction d'exposition : -86% (7 → 1)
   */
  constructor(private promptMutationRepository: PromptMutationRepository) {}

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.promptMutationRepository.update(id, { is_favorite: !currentState });
  }
}
