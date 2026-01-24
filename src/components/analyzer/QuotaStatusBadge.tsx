/**
 * @file QuotaStatusBadge.tsx
 * @description Compact quota indicator for buttons and headers
 * 
 * Follows SRP: Single responsibility - display compact quota status
 */

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalysisQuota } from "@/hooks/useAnalysisQuota";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface QuotaStatusBadgeProps {
  /** Whether to show the sparkles icon */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Compact badge showing remaining daily quota
 * 
 * @example
 * // In a button
 * <Button>
 *   Analyser
 *   <QuotaStatusBadge showIcon={false} />
 * </Button>
 */
export function QuotaStatusBadge({ 
  showIcon = true, 
  className 
}: QuotaStatusBadgeProps) {
  const { loading: authLoading } = useAuth();
  const { data: quota, isLoading, isError } = useAnalysisQuota();

  // Afficher un skeleton compact pendant le chargement
  if (authLoading || isLoading) {
    return (
      <Badge variant="outline" className={cn("text-xs font-normal", className)}>
        {showIcon && <Skeleton className="h-3 w-3 mr-1 rounded-full" />}
        <Skeleton className="h-3 w-8" />
      </Badge>
    );
  }

  // Gestion gracieuse des erreurs - afficher "--/--" avec opacité réduite
  if (isError || !quota) {
    return (
      <Badge variant="outline" className={cn("text-xs font-normal opacity-50", className)}>
        {showIcon && <Sparkles className="h-3 w-3 mr-1" />}
        --/--
      </Badge>
    );
  }

  const isCritical = quota.dailyRemaining <= 3;
  const isLow = quota.dailyRemaining <= 10;

  return (
    <Badge
      variant={isCritical ? "destructive" : isLow ? "secondary" : "outline"}
      className={cn(
        "text-xs font-normal",
        isLow && !isCritical && "border-amber-500/50 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      {showIcon && <Sparkles className="h-3 w-3 mr-1" />}
      {quota.dailyRemaining}/{quota.dailyLimit}
    </Badge>
  );
}
