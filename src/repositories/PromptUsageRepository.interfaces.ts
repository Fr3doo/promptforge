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
 * 
 * @remarks
 * Les statistiques sont agrégées à partir de la table prompt_usage.
 * L'accès est filtré par RLS selon l'utilisateur authentifié.
 */
export interface PromptUsageRepository {
  /**
   * Récupère les statistiques d'utilisation des prompts d'un utilisateur
   * @param userId - ID de l'utilisateur (requis, non vide)
   * @param limit - Nombre maximum de résultats (optionnel, défaut: tous)
   * @returns Liste des statistiques triées par nombre d'utilisations décroissant
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue (erreur réseau/base de données)
   */
  fetchUsageStats(userId: string, limit?: number): Promise<PromptUsageStat[]>;
}
