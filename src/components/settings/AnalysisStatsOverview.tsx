/**
 * @file AnalysisStatsOverview.tsx
 * @description Overview cards displaying analysis summary statistics
 * 
 * Follows SRP: Single responsibility for displaying overview stats.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, CheckCircle, FileText, Calendar } from "lucide-react";
import { useAnalysisSummary } from "@/hooks/useAnalysisSummary";
import { messages } from "@/constants/messages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AnalysisStatsOverview() {
  const { data: summary, isLoading, error } = useAnalysisSummary();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary || summary.totalAnalyses === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{messages.quota.statistics.overview.noData}</p>
        </CardContent>
      </Card>
    );
  }

  const successRate = summary.totalAnalyses > 0
    ? Math.round((summary.totalSuccessful / summary.totalAnalyses) * 100)
    : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "d MMM yyyy", { locale: fr });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {messages.quota.statistics.overview.totalAnalyses}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAnalyses}</div>
          </CardContent>
        </Card>

        {/* Success rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {messages.quota.statistics.overview.successRate}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalSuccessful}/{summary.totalAnalyses}
            </p>
          </CardContent>
        </Card>

        {/* Average length */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {messages.quota.statistics.overview.averageLength}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~{summary.averagePromptLength}</div>
            <p className="text-xs text-muted-foreground">caractères</p>
          </CardContent>
        </Card>

        {/* Activity period */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {messages.quota.statistics.overview.activityPeriod}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{formatDate(summary.firstAnalysis)}</div>
            <p className="text-xs text-muted-foreground">
              → {formatDate(summary.lastAnalysis)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
