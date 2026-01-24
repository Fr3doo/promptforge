/**
 * @file AnalysisHistoryRepository.interfaces.ts
 * @description Interface for analysis history data access layer (DIP compliance)
 * 
 * Follows Dependency Inversion Principle - high-level modules depend on abstractions.
 */

/**
 * Daily analysis statistics for chart visualization
 */
export interface DailyAnalysisStats {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of analyses performed that day */
  count: number;
  /** Success rate percentage (0-100) */
  successRate: number;
}

/**
 * Repository interface for analysis history data access
 * 
 * LSP Contract:
 * - All implementations must handle authentication state
 * - Implementations should return empty array if no data exists
 */
export interface AnalysisHistoryRepository {
  /**
   * Fetches daily analysis statistics for the authenticated user
   * 
   * @param days Number of days of history to retrieve (default: 7)
   * @returns Promise resolving to array of daily stats, sorted by date ascending
   * 
   * @throws {Error} If user is not authenticated (PGRST301)
   * @throws {Error} If database query fails
   * 
   * @example
   * const stats = await repository.fetchDailyStats(7);
   * // Returns: [{ date: "2024-01-20", count: 5, successRate: 100 }, ...]
   */
  fetchDailyStats(days?: number): Promise<DailyAnalysisStats[]>;
}
