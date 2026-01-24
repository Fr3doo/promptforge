import { Sparkles, AlertTriangle, XCircle } from "lucide-react";
import { useAnalysisQuota } from "@/hooks/useAnalysisQuota";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { messages } from "@/constants/messages";

/**
 * Indicateur de quotas d'analyse affiché dans le header
 * 
 * Affiche visuellement les analyses restantes avec :
 * - Barre de progression colorée selon le niveau
 * - Tooltip détaillant les quotas minute et jour
 * - Icônes adaptées à l'état (normal, bas, critique)
 * 
 * @example
 * ```tsx
 * <AuthenticatedNavigation>
 *   <AnalysisQuotaIndicator />
 * </AuthenticatedNavigation>
 * ```
 */
export function AnalysisQuotaIndicator() {
  const { data: quota, isLoading, error } = useAnalysisQuota();

  // Graceful degradation : ne pas afficher si erreur ou chargement
  if (isLoading || error || !quota) {
    return null;
  }

  const dailyPercent = (quota.dailyRemaining / quota.dailyLimit) * 100;
  const isLow = quota.dailyRemaining <= 10;
  const isCritical = quota.dailyRemaining <= 3;
  const isExhausted = quota.dailyRemaining === 0;

  // Déterminer l'icône et la couleur selon l'état
  const getStatusConfig = () => {
    if (isExhausted) {
      return {
        icon: XCircle,
        colorClass: "text-destructive",
        bgClass: "bg-destructive/10 border-destructive/30",
        progressClass: "bg-destructive",
      };
    }
    if (isCritical) {
      return {
        icon: AlertTriangle,
        colorClass: "text-destructive",
        bgClass: "bg-destructive/10 border-destructive/30",
        progressClass: "bg-destructive",
      };
    }
    if (isLow) {
      return {
        icon: AlertTriangle,
        colorClass: "text-amber-500",
        bgClass: "bg-amber-500/10 border-amber-500/30",
        progressClass: "bg-amber-500",
      };
    }
    return {
      icon: Sparkles,
      colorClass: "text-primary",
      bgClass: "bg-muted/50 border-border",
      progressClass: "",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgClass} cursor-default transition-colors`}
            role="status"
            aria-label={`${quota.dailyRemaining} analyses restantes sur ${quota.dailyLimit}`}
          >
            <Icon className={`h-4 w-4 ${config.colorClass}`} aria-hidden="true" />
            <span className="text-sm font-medium tabular-nums">
              {quota.dailyRemaining}/{quota.dailyLimit}
            </span>
            <Progress
              value={dailyPercent}
              className="w-12 h-1.5"
              aria-hidden="true"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1.5 text-sm">
            <p className="font-medium">{messages.quota.indicator.label}</p>
            <div className="space-y-1 text-muted-foreground">
              <p>
                {messages.quota.indicator.tooltip.daily}: {quota.dailyRemaining}/{quota.dailyLimit}
              </p>
              <p>
                {messages.quota.indicator.tooltip.minute}: {quota.minuteRemaining}/{quota.minuteLimit}
              </p>
            </div>
            {isExhausted && (
              <p className="text-destructive text-xs mt-2">
                {messages.quota.status.exhausted}
              </p>
            )}
            {isCritical && !isExhausted && (
              <p className="text-destructive text-xs mt-2">
                {messages.quota.status.critical}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
