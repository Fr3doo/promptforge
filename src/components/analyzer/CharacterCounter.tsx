import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { VALIDATION } from "@/constants/application-config";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  length: number;
}

export function CharacterCounter({ length }: CharacterCounterProps) {
  const softLimit = VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT;
  const hardLimit = VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT;
  
  const percentage = (length / hardLimit) * 100;
  
  // Déterminer le statut et les couleurs
  const getStatus = () => {
    if (length > hardLimit) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        text: "Trop long - Limite dépassée",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
      };
    }
    if (length > softLimit) {
      return {
        variant: "warning" as const,
        icon: AlertTriangle,
        text: "Prompt très long - Analyse lente",
        color: "text-amber-600 dark:text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
      };
    }
    return {
      variant: "success" as const,
      icon: CheckCircle,
      text: "Longueur optimale",
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className={cn("rounded-lg p-3 space-y-2 transition-colors", status.bgColor)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", status.color)} />
          <span className={cn("text-sm font-medium", status.color)}>
            {length.toLocaleString()} caractères
          </span>
        </div>
        <span className={cn("text-xs font-medium", status.color)}>
          {status.text}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            length > hardLimit
              ? "bg-destructive"
              : length > softLimit
                ? "bg-amber-500"
                : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Indicateurs de limites */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>0</span>
        <div className="flex items-center gap-4">
          <span className={cn(length > softLimit && "font-medium text-amber-600 dark:text-amber-500")}>
            ⚠️ {softLimit.toLocaleString()}
          </span>
          <span className={cn(length > hardLimit && "font-medium text-destructive")}>
            🚫 {hardLimit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
