/**
 * @file AnalysisHistoryRepository.ts
 * @description Supabase implementation of AnalysisHistoryRepository interface
 * 
 * Follows DIP: Implementation depends on abstract interface.
 * Follows SRP: Only responsible for analysis history data access.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/integrations/supabase/client";
import type { DailyAnalysisStats, AnalysisHistoryRepository } from "./AnalysisHistoryRepository.interfaces";

/**
 * Supabase implementation of AnalysisHistoryRepository
 */
class SupabaseAnalysisHistoryRepository implements AnalysisHistoryRepository {
  constructor(private readonly supabase: SupabaseClient = defaultClient) {}

  async fetchDailyStats(days: number = 7): Promise<DailyAnalysisStats[]> {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await this.supabase
      .from("analysis_history")
      .select("analyzed_at, success")
      .gte("analyzed_at", startDate.toISOString())
      .lte("analyzed_at", endDate.toISOString())
      .order("analyzed_at", { ascending: true });

    if (error) {
      console.error("[AnalysisHistoryRepository] Error fetching history:", error);
      throw new Error(`Failed to fetch analysis history: ${error.message}`);
    }

    // Aggregate data by day
    const dailyMap = new Map<string, { total: number; success: number }>();
    
    // Initialize all days with zeros
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split("T")[0];
      dailyMap.set(dateKey, { total: 0, success: 0 });
    }

    // Aggregate actual data
    for (const row of data || []) {
      const dateKey = new Date(row.analyzed_at).toISOString().split("T")[0];
      const existing = dailyMap.get(dateKey) || { total: 0, success: 0 };
      existing.total += 1;
      if (row.success) existing.success += 1;
      dailyMap.set(dateKey, existing);
    }

    // Convert to array
    const result: DailyAnalysisStats[] = [];
    for (const [date, stats] of dailyMap.entries()) {
      result.push({
        date,
        count: stats.total,
        successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100,
      });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }
}

/**
 * Factory function for creating AnalysisHistoryRepository instances
 * Enables dependency injection for testing
 */
export function createAnalysisHistoryRepository(
  client?: SupabaseClient
): AnalysisHistoryRepository {
  return new SupabaseAnalysisHistoryRepository(client ?? defaultClient);
}
