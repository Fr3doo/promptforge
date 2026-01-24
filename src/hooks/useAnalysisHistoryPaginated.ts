/**
 * @file useAnalysisHistoryPaginated.ts
 * @description Hook for fetching paginated analysis history
 * 
 * Follows SRP: Single responsibility for paginated history fetching.
 * Follows DIP: Depends on repository abstraction via context.
 */

import { useQuery } from "@tanstack/react-query";
import { useAnalysisHistoryRepository } from "@/contexts/AnalysisHistoryRepositoryContext";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook for fetching paginated analysis history for table view
 * 
 * @param page Current page number (1-indexed)
 * @param pageSize Number of items per page (default: 10)
 * @returns Query result with paginated history
 */
export function useAnalysisHistoryPaginated(page: number, pageSize: number = 10) {
  const repository = useAnalysisHistoryRepository();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analysis-history-paginated", user?.id, page, pageSize],
    queryFn: () => repository.fetchPaginatedHistory(page, pageSize),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}
