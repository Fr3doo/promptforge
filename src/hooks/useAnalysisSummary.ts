/**
 * @file useAnalysisSummary.ts
 * @description Hook for fetching analysis summary statistics
 * 
 * Follows SRP: Single responsibility for summary data fetching.
 * Follows DIP: Depends on repository abstraction via context.
 */

import { useQuery } from "@tanstack/react-query";
import { useAnalysisHistoryRepository } from "@/contexts/AnalysisHistoryRepositoryContext";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching analysis summary (totals, averages, etc.)
 * 
 * @returns Query result with summary object
 */
export function useAnalysisSummary() {
  const repository = useAnalysisHistoryRepository();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analysis-summary", user?.id],
    queryFn: () => repository.fetchSummary(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
