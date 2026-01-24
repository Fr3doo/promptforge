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
 * Monthly analysis statistics for settings visualization
 */
export interface MonthlyAnalysisStats {
  /** Month in YYYY-MM format */
  month: string;
  /** Number of analyses performed that month */
  count: number;
  /** Success rate percentage (0-100) */
  successRate: number;
}

/**
 * Summary of all analysis history for a user
 */
export interface AnalysisHistorySummary {
  /** Total number of analyses performed */
  totalAnalyses: number;
  /** Total successful analyses */
  totalSuccessful: number;
  /** Average prompt length in characters */
  averagePromptLength: number;
  /** Date of first analysis (ISO string) or null if no data */
  firstAnalysis: string | null;
  /** Date of last analysis (ISO string) or null if no data */
  lastAnalysis: string | null;
}

/**
 * Single analysis history entry for detailed table view
 */
export interface AnalysisHistoryEntry {
  /** Unique identifier */
  id: string;
  /** Timestamp of analysis */
  analyzedAt: string;
  /** Length of prompt analyzed */
  promptLength: number;
  /** Whether analysis succeeded */
  success: boolean;
}

/**
 * Paginated response for analysis history
 */
export interface PaginatedAnalysisHistory {
  /** Array of analysis entries for current page */
  data: AnalysisHistoryEntry[];
  /** Total number of entries across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Repository interface for analysis history data access
 * 
 * LSP Contract:
 * - All implementations must handle authentication state
 * - Implementations should return empty array/null if no data exists
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

  /**
   * Fetches monthly analysis statistics for the authenticated user
   * 
   * @param months Number of months of history to retrieve (default: 6)
   * @returns Promise resolving to array of monthly stats, sorted by month ascending
   * 
   * @throws {Error} If user is not authenticated (PGRST301)
   * @throws {Error} If database query fails
   */
  fetchMonthlyStats(months?: number): Promise<MonthlyAnalysisStats[]>;

  /**
   * Fetches summary statistics for the authenticated user
   * 
   * @returns Promise resolving to summary object
   * 
   * @throws {Error} If user is not authenticated (PGRST301)
   * @throws {Error} If database query fails
   */
  fetchSummary(): Promise<AnalysisHistorySummary>;

  /**
   * Fetches paginated analysis history for detailed table view
   * 
   * @param page Page number (1-indexed)
   * @param pageSize Number of items per page (default: 10)
   * @returns Promise resolving to paginated result
   * 
   * @throws {Error} If user is not authenticated (PGRST301)
   * @throws {Error} If database query fails
   */
  fetchPaginatedHistory(page: number, pageSize?: number): Promise<PaginatedAnalysisHistory>;
}
