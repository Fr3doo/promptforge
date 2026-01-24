/**
 * @file AnalysisHistoryChart.tsx
 * @description Chart component for visualizing analysis usage over time
 * 
 * Uses Recharts (already installed) for visualization.
 * Follows SRP: Single responsibility - display analysis history chart
 */

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { messages } from "@/constants/messages";

const DAILY_LIMIT = 50;

/**
 * Format date for display on X axis
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { weekday: "short" });
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const date = new Date(label);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="font-medium text-sm">{formattedDate}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm text-muted-foreground">
          Analyses : <span className="font-semibold text-foreground">{data.count}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Taux de succès : <span className="font-semibold text-foreground">{data.successRate}%</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Chart displaying analysis usage over the past 7 days
 * 
 * @example
 * <AnalysisHistoryChart />
 */
export function AnalysisHistoryChart() {
  const { data: history, isLoading, error } = useAnalysisHistory(7);

  const totalAnalyses = useMemo(() => {
    if (!history) return 0;
    return history.reduce((sum, day) => sum + day.count, 0);
  }, [history]);

  if (error) {
    return null; // Graceful degradation
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {messages.quota.history.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Don't show if no data at all
  if (!history || history.every((day) => day.count === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {messages.quota.history.title}
            </CardTitle>
          </div>
          <CardDescription className="text-right">
            {messages.quota.history.total(totalAnalyses)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[0, (max: number) => Math.max(max + 5, 10)]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={DAILY_LIMIT}
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#analysisGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {messages.quota.history.limitNote}
        </p>
      </CardContent>
    </Card>
  );
}
