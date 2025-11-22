/**
 * Statistique d'utilisation d'un prompt
 */
export interface PromptUsageStat {
  promptId: string;
  title: string;
  usageCount: number;
  successRate: number;
}

/**
 * Repository pour les statistiques d'utilisation des prompts
 * Interface ségrégée suivant le principe ISP
 */
export interface PromptUsageRepository {
  /**
   * Récupère les statistiques d'utilisation des prompts d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum de résultats (optionnel)
   * @returns Liste des statistiques triées par nombre d'utilisations décroissant
   */
  fetchUsageStats(userId: string, limit?: number): Promise<PromptUsageStat[]>;
}
