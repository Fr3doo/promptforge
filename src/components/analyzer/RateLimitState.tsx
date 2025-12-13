import { Clock } from "lucide-react";

interface RateLimitStateProps {
  retryAfter: number;
  reason: 'minute' | 'daily';
}

/**
 * Affiche l'état de rate limiting avec countdown
 * Composant focalisé sur le feedback utilisateur pendant l'attente
 */
export function RateLimitState({ retryAfter, reason }: RateLimitStateProps) {
  const formatTime = (seconds: number): string => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}min`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}min ${secs}s` : `${mins}min`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2 text-amber-500">
        <Clock className="h-8 w-8 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg text-foreground">
          {reason === 'daily' ? 'Limite journalière atteinte' : 'Trop de requêtes'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {reason === 'daily' 
            ? 'Vous avez utilisé vos 50 analyses quotidiennes.' 
            : 'Vous avez atteint la limite de 10 analyses par minute.'}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-border shadow-sm">
        <span className="text-sm text-muted-foreground">Réessayez dans</span>
        <span className="font-mono font-bold text-lg text-foreground">{formatTime(retryAfter)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Le bouton d'analyse sera réactivé automatiquement
      </p>
    </div>
  );
}
