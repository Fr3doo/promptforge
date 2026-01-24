/**
 * @file AnalysisHistoryTable.tsx
 * @description Paginated table displaying full analysis history
 * 
 * Follows SRP: Single responsibility for history table display.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useAnalysisHistoryPaginated } from "@/hooks/useAnalysisHistoryPaginated";
import { messages } from "@/constants/messages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PAGE_SIZE = 10;

export function AnalysisHistoryTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, isFetching } = useAnalysisHistoryPaginated(page, PAGE_SIZE);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {messages.labels.error}
        </CardContent>
      </Card>
    );
  }

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {messages.quota.statistics.history.title}
        </CardTitle>
        <CardDescription>
          {data?.total || 0} analyses au total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {messages.quota.statistics.overview.noData}
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{messages.quota.statistics.history.columns.date}</TableHead>
                    <TableHead>{messages.quota.statistics.history.columns.time}</TableHead>
                    <TableHead className="text-right">{messages.quota.statistics.history.columns.length}</TableHead>
                    <TableHead className="text-center">{messages.quota.statistics.history.columns.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((entry) => {
                    const date = new Date(entry.analyzedAt);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {format(date, "d MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(date, "HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.promptLength.toLocaleString()} car.
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.success ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Erreur
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {messages.quota.statistics.history.pagination.previous}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {messages.quota.statistics.history.pagination.page(page, totalPages)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                >
                  {messages.quota.statistics.history.pagination.next}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
