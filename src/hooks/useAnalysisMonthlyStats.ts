/**
 * @file useAnalysisMonthlyStats.ts
 * @description Hook for fetching monthly analysis statistics
 * 
 * Follows SRP: Single responsibility for monthly stats data fetching.
 * Follows DIP: Depends on repository abstraction via context.
 */

import { useQuery } from "@tanstack/react-query";
import { useAnalysisHistoryRepository } from "@/contexts/AnalysisHistoryRepositoryContext";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching monthly analysis statistics
 * 
 * @param months Number of months of history to retrieve (default: 6)
 * @returns Query result with monthly stats array
 */
export function useAnalysisMonthlyStats(months: number = 6) {
  const repository = useAnalysisHistoryRepository();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analysis-monthly-stats", user?.id, months],
    queryFn: () => repository.fetchMonthlyStats(months),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
