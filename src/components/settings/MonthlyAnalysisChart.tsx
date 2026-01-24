/**
 * @file MonthlyAnalysisChart.tsx
 * @description Bar chart displaying monthly analysis statistics
 * 
 * Follows SRP: Single responsibility for monthly chart visualization.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAnalysisMonthlyStats } from "@/hooks/useAnalysisMonthlyStats";
import { messages } from "@/constants/messages";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

export function MonthlyAnalysisChart() {
  const { data: monthlyStats, isLoading, error } = useAnalysisMonthlyStats(6);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {messages.labels.error}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart with readable month names
  const chartData = (monthlyStats || []).map((stat) => {
    const date = parse(stat.month, "yyyy-MM", new Date());
    return {
      ...stat,
      monthLabel: format(date, "MMM yyyy", { locale: fr }),
    };
  });

  const totalThisMonth = chartData.length > 0 ? chartData[chartData.length - 1].count : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {messages.quota.statistics.monthly.title}
        </CardTitle>
        <CardDescription>
          {messages.quota.statistics.monthly.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || chartData.every((d) => d.count === 0) ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            {messages.quota.statistics.overview.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [value, "Analyses"]}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {messages.quota.statistics.monthly.currentMonth}: <strong>{totalThisMonth}</strong> analyses
        </div>
      </CardContent>
    </Card>
  );
}
