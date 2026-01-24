import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnalysisQuotaRepository } from "@/contexts/AnalysisQuotaRepositoryContext";
import { useAuth } from "./useAuth";
import type { AnalysisQuota } from "@/repositories/AnalysisQuotaRepository.interfaces";

/**
 * Clé de cache pour les quotas d'analyse
 * Exportée pour permettre l'invalidation depuis d'autres hooks
 */
export const ANALYSIS_QUOTA_QUERY_KEY = "analysis-quota";

/**
 * Hook pour récupérer et mettre en cache les quotas d'analyse
 * 
 * Utilise React Query pour :
 * - Mise en cache automatique
 * - Rafraîchissement périodique (30s)
 * - Gestion des erreurs gracieuse
 * 
 * @example
 * ```tsx
 * const { data: quota, isLoading } = useAnalysisQuota();
 * if (quota) {
 *   console.log(`${quota.dailyRemaining}/${quota.dailyLimit} analyses restantes`);
 * }
 * ```
 */
export function useAnalysisQuota() {
  const repository = useAnalysisQuotaRepository();
  const { user, loading } = useAuth();

  return useQuery<AnalysisQuota>({
    queryKey: [ANALYSIS_QUOTA_QUERY_KEY, user?.id],
    queryFn: () => repository.fetchQuota(),
    // Ne pas fetch si auth en cours de chargement ou pas d'utilisateur
    enabled: !loading && !!user,
    // Rafraîchir toutes les 30 secondes pour garder les quotas à jour
    refetchInterval: 30_000,
    // Considérer les données comme fraîches pendant 10 secondes
    staleTime: 10_000,
    // Ne pas retry automatiquement en cas d'erreur d'auth
    retry: (failureCount, error) => {
      if (error?.message?.includes("authentifié")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook pour invalider le cache des quotas
 * À utiliser après une analyse réussie ou un changement d'état
 */
export function useInvalidateAnalysisQuota() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [ANALYSIS_QUOTA_QUERY_KEY] });
  };
}
