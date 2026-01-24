/**
 * @file useAnalysisHistory.ts
 * @description React Query hook for fetching analysis history stats
 * 
 * Follows SRP: Single responsibility - fetch and cache analysis history
 * Follows DIP: Depends on repository abstraction via context
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAnalysisHistoryRepository } from "@/contexts/AnalysisHistoryRepositoryContext";
import type { DailyAnalysisStats } from "@/repositories/AnalysisHistoryRepository.interfaces";

/** Query key for analysis history cache */
export const ANALYSIS_HISTORY_QUERY_KEY = "analysis-history";

/**
 * Hook to fetch and cache analysis history statistics
 * 
 * @param days Number of days of history to fetch (default: 7)
 * @returns React Query result with daily analysis stats
 * 
 * @example
 * const { data: history, isLoading } = useAnalysisHistory(7);
 * // history: [{ date: "2024-01-20", count: 5, successRate: 100 }, ...]
 */
export function useAnalysisHistory(days: number = 7) {
  const repository = useAnalysisHistoryRepository();
  const { user } = useAuth();

  return useQuery<DailyAnalysisStats[], Error>({
    queryKey: [ANALYSIS_HISTORY_QUERY_KEY, user?.id, days],
    queryFn: () => repository.fetchDailyStats(days),
    enabled: !!user,
    staleTime: 60_000, // 1 minute - history doesn't change frequently
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get a function for invalidating analysis history cache
 * Call after a new analysis is completed to refresh the chart
 */
export function useInvalidateAnalysisHistory() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [ANALYSIS_HISTORY_QUERY_KEY] });
  };
}
