/**
 * @file SettingsAnalysisTab.tsx
 * @description Container component for the Analysis Statistics tab in Settings
 * 
 * Follows SRP: Single responsibility for composing analysis stats views.
 */

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisStatsOverview } from "./AnalysisStatsOverview";
import { MonthlyAnalysisChart } from "./MonthlyAnalysisChart";
import { AnalysisHistoryTable } from "./AnalysisHistoryTable";
import { messages } from "@/constants/messages";

export function SettingsAnalysisTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>{messages.quota.statistics.title}</CardTitle>
          <CardDescription>
            {messages.quota.statistics.description}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <AnalysisStatsOverview />

      {/* Monthly Chart */}
      <MonthlyAnalysisChart />

      {/* Full History Table */}
      <AnalysisHistoryTable />
    </div>
  );
}
