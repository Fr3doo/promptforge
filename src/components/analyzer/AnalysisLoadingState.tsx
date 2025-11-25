import { Loader2 } from "lucide-react";
import { messages } from "@/constants/messages";

interface AnalysisLoadingStateProps {
  progressMessage: string;
  elapsedSeconds: number;
}

/**
 * Composant d'affichage de l'état de chargement pendant l'analyse
 * Affiche un spinner, le message de progression dynamique et le temps écoulé
 */
export function AnalysisLoadingState({
  progressMessage,
  elapsedSeconds,
}: AnalysisLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">{progressMessage}</p>
        <p className="text-xs text-muted-foreground">
          {messages.analysis.progress.elapsed(elapsedSeconds)}
        </p>
      </div>
    </div>
  );
}
