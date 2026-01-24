/**
 * Interface pour les quotas d'analyse
 * Représente l'état actuel des limites d'utilisation
 */
export interface AnalysisQuota {
  /** Nombre d'analyses restantes dans la minute courante */
  minuteRemaining: number;
  /** Nombre d'analyses restantes pour la journée */
  dailyRemaining: number;
  /** Limite maximale par minute */
  minuteLimit: number;
  /** Limite maximale par jour */
  dailyLimit: number;
  /** Timestamp de réinitialisation du compteur minute (null si déjà réinitialisé) */
  minuteResetsAt: string | null;
  /** Timestamp de réinitialisation du compteur journalier (null si déjà réinitialisé) */
  dailyResetsAt: string | null;
}

/**
 * Repository pour la gestion des quotas d'analyse
 * 
 * Responsabilité unique (SRP) : Récupérer les quotas d'analyse de l'utilisateur
 * 
 * @example
 * ```typescript
 * const repository = useAnalysisQuotaRepository();
 * const quota = await repository.fetchQuota();
 * console.log(`${quota.dailyRemaining}/${quota.dailyLimit} analyses restantes`);
 * ```
 */
export interface AnalysisQuotaRepository {
  /**
   * Récupère les quotas d'analyse restants pour l'utilisateur authentifié
   * 
   * @returns Promise avec les quotas actuels (minute et journalier)
   * @throws {Error} Si l'utilisateur n'est pas authentifié (401)
   * @throws {Error} Si la session est invalide (401)
   * @throws {Error} En cas d'erreur réseau ou serveur (retourne limites max en fail-open)
   */
  fetchQuota(): Promise<AnalysisQuota>;
}
