/**
 * @file QuotaStatusBadge.tsx
 * @description Compact quota indicator for buttons and headers
 * 
 * Follows SRP: Single responsibility - display compact quota status
 */

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAnalysisQuota } from "@/hooks/useAnalysisQuota";
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
  const { data: quota, isLoading, isError } = useAnalysisQuota();

  // Graceful degradation - don't show if loading or error
  if (isLoading || isError || !quota) return null;

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
