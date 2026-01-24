import { supabase } from "@/integrations/supabase/client";
import type { AnalysisQuota, AnalysisQuotaRepository } from "./AnalysisQuotaRepository.interfaces";

/**
 * Implémentation Supabase du repository de quotas d'analyse
 * 
 * Appelle l'Edge Function get-analysis-quota pour récupérer
 * les quotas restants de l'utilisateur authentifié
 */
export class SupabaseAnalysisQuotaRepository implements AnalysisQuotaRepository {
  /**
   * Récupère les quotas d'analyse via l'Edge Function
   * 
   * @throws {Error} Si l'utilisateur n'est pas authentifié
   * @throws {Error} Si la requête échoue
   */
  async fetchQuota(): Promise<AnalysisQuota> {
    const { data, error } = await supabase.functions.invoke<AnalysisQuota>(
      "get-analysis-quota"
    );

    if (error) {
      // Si erreur d'authentification, la propager
      if (error.message?.includes("401") || error.message?.includes("authentifié")) {
        throw new Error("Utilisateur non authentifié");
      }
      
      // Pour les autres erreurs, log et propager
      console.error("[AnalysisQuotaRepository] Error fetching quota:", error);
      throw new Error("Impossible de récupérer les quotas d'analyse");
    }

    if (!data) {
      throw new Error("Aucune donnée de quota reçue");
    }

    return data;
  }
}

/**
 * Factory function pour créer une instance du repository
 * Permet l'injection de dépendances et facilite les tests
 */
export const createAnalysisQuotaRepository = (): AnalysisQuotaRepository => {
  return new SupabaseAnalysisQuotaRepository();
};
