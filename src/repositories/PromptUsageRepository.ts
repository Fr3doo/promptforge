import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import type { PromptUsageRepository, PromptUsageStat } from "./PromptUsageRepository.interfaces";

/**
 * Implémentation Supabase du repository des statistiques d'utilisation
 */
export class SupabasePromptUsageRepository implements PromptUsageRepository {
  /**
   * Récupère les statistiques d'utilisation des prompts d'un utilisateur
   * 
   * Logique métier encapsulée :
   * - Jointure avec prompt_usage pour récupérer les données d'utilisation
   * - Calcul du taux de succès (successfulUsage / totalUsage * 100)
   * - Filtrage des prompts avec 0 utilisation
   * - Tri par nombre d'utilisations décroissant
   * - Limitation au nombre de résultats demandés
   * 
   * @param userId - ID de l'utilisateur propriétaire des prompts
   * @param limit - Nombre maximum de résultats à retourner (défaut: tous)
   * @returns Liste des statistiques triées par usageCount décroissant
   * @throws Error si la requête échoue
   */
  async fetchUsageStats(userId: string, limit?: number): Promise<PromptUsageStat[]> {
    const { data: promptsWithUsage, error } = await supabase
      .from("prompts")
      .select(`
        id,
        title,
        prompt_usage (
          id,
          success
        )
      `)
      .eq("owner_id", userId);

    handleSupabaseError({ data: promptsWithUsage, error });

    // Transformation et calcul des statistiques
    const usageStats = (promptsWithUsage || []).map((prompt: any) => {
      const usages = prompt.prompt_usage || [];
      const totalUsage = usages.length;
      const successfulUsage = usages.filter((u: any) => u.success === true).length;

      return {
        promptId: prompt.id,
        title: prompt.title,
        usageCount: totalUsage,
        successRate: totalUsage > 0 ? (successfulUsage / totalUsage) * 100 : 0,
      };
    })
      // Filtrer les prompts sans utilisation
      .filter(stat => stat.usageCount > 0)
      // Trier par nombre d'utilisations décroissant
      .sort((a, b) => b.usageCount - a.usageCount);

    // Limiter si nécessaire
    return limit ? usageStats.slice(0, limit) : usageStats;
  }
}
