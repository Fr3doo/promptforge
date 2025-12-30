import { AlertTriangle, RefreshCw, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { commonMessages } from "@/constants/messages/common";

interface ErrorCardProps {
  /** Title of the error card */
  title?: string;
  /** Description of the error */
  description?: string;
  /** The error object (for potential debugging display) */
  error?: Error | null;
  /** Callback function for retry action */
  onRetry?: () => void;
  /** Label for the retry button */
  retryLabel?: string;
  /** Custom icon to display */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ErrorCard - Visible error state with retry action
 * 
 * Replaces silent failures (infinite skeleton or toast-only)
 * with a visible, actionable error card.
 */
export function ErrorCard({
  title = commonMessages.loadingErrors.generic.title,
  description = commonMessages.loadingErrors.generic.description,
  error,
  onRetry,
  retryLabel = commonMessages.loadingErrors.retryButton,
  icon: Icon = AlertTriangle,
  className = "",
}: ErrorCardProps) {
  return (
    <Card 
      className={`border-destructive/50 bg-destructive/5 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2">
            <Icon className="h-5 w-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-destructive">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {(onRetry || error) && (
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {retryLabel}
              </Button>
            )}
            {error && import.meta.env.DEV && (
              <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                {error.message}
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
