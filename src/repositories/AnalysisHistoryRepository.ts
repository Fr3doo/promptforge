/**
 * @file AnalysisHistoryRepository.ts
 * @description Supabase implementation of AnalysisHistoryRepository interface
 * 
 * Follows DIP: Implementation depends on abstract interface.
 * Follows SRP: Only responsible for analysis history data access.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/integrations/supabase/client";
import type {
  DailyAnalysisStats,
  MonthlyAnalysisStats,
  AnalysisHistorySummary,
  AnalysisHistoryEntry,
  PaginatedAnalysisHistory,
  AnalysisHistoryRepository,
} from "./AnalysisHistoryRepository.interfaces";

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

  async fetchMonthlyStats(months: number = 6): Promise<MonthlyAnalysisStats[]> {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1); // Start of month
    
    const { data, error } = await this.supabase
      .from("analysis_history")
      .select("analyzed_at, success")
      .gte("analyzed_at", startDate.toISOString())
      .lte("analyzed_at", endDate.toISOString())
      .order("analyzed_at", { ascending: true });

    if (error) {
      console.error("[AnalysisHistoryRepository] Error fetching monthly stats:", error);
      throw new Error(`Failed to fetch monthly analysis stats: ${error.message}`);
    }

    // Aggregate data by month
    const monthlyMap = new Map<string, { total: number; success: number }>();
    
    // Initialize all months with zeros
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - 1 - i));
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      monthlyMap.set(monthKey, { total: 0, success: 0 });
    }

    // Aggregate actual data
    for (const row of data || []) {
      const monthKey = new Date(row.analyzed_at).toISOString().slice(0, 7);
      const existing = monthlyMap.get(monthKey) || { total: 0, success: 0 };
      existing.total += 1;
      if (row.success) existing.success += 1;
      monthlyMap.set(monthKey, existing);
    }

    // Convert to array
    const result: MonthlyAnalysisStats[] = [];
    for (const [month, stats] of monthlyMap.entries()) {
      result.push({
        month,
        count: stats.total,
        successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100,
      });
    }

    return result.sort((a, b) => a.month.localeCompare(b.month));
  }

  async fetchSummary(): Promise<AnalysisHistorySummary> {
    const { data, error } = await this.supabase
      .from("analysis_history")
      .select("analyzed_at, success, prompt_length")
      .order("analyzed_at", { ascending: true });

    if (error) {
      console.error("[AnalysisHistoryRepository] Error fetching summary:", error);
      throw new Error(`Failed to fetch analysis summary: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalAnalyses: 0,
        totalSuccessful: 0,
        averagePromptLength: 0,
        firstAnalysis: null,
        lastAnalysis: null,
      };
    }

    const totalAnalyses = data.length;
    const totalSuccessful = data.filter((d) => d.success).length;
    const totalLength = data.reduce((sum, d) => sum + (d.prompt_length || 0), 0);
    const averagePromptLength = Math.round(totalLength / totalAnalyses);

    return {
      totalAnalyses,
      totalSuccessful,
      averagePromptLength,
      firstAnalysis: data[0].analyzed_at,
      lastAnalysis: data[data.length - 1].analyzed_at,
    };
  }

  async fetchPaginatedHistory(
    page: number,
    pageSize: number = 10
  ): Promise<PaginatedAnalysisHistory> {
    // Get total count
    const { count, error: countError } = await this.supabase
      .from("analysis_history")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("[AnalysisHistoryRepository] Error counting history:", countError);
      throw new Error(`Failed to count analysis history: ${countError.message}`);
    }

    const total = count ?? 0;
    const offset = (page - 1) * pageSize;

    // Get paginated data
    const { data, error } = await this.supabase
      .from("analysis_history")
      .select("id, analyzed_at, prompt_length, success")
      .order("analyzed_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("[AnalysisHistoryRepository] Error fetching paginated history:", error);
      throw new Error(`Failed to fetch paginated history: ${error.message}`);
    }

    const entries: AnalysisHistoryEntry[] = (data || []).map((row) => ({
      id: row.id,
      analyzedAt: row.analyzed_at,
      promptLength: row.prompt_length,
      success: row.success,
    }));

    return {
      data: entries,
      total,
      page,
      pageSize,
    };
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
