import { ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { logInfo } from '@/lib/logger';
import { messages } from '@/constants/messages';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

/**
 * User-friendly error fallback UI
 * 
 * Displays when an uncaught error occurs in the component tree.
 * Provides options to:
 * - Retry the failed operation
 * - Return to home page
 * - View technical details (in development)
 * - Report the error (future feature)
 */
export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isDevelopment = import.meta.env.DEV;
  const uiMessages = messages.ui.errorFallback;

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReportError = () => {
    logInfo('Report error feature - to be implemented');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">{uiMessages.title}</CardTitle>
              <CardDescription>{uiMessages.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{uiMessages.technicalError}</AlertTitle>
            <AlertDescription>
              {error?.message || uiMessages.unknownError}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            {uiMessages.apologyMessage}
          </p>

          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>{uiMessages.instructions.retry}</li>
            <li>{uiMessages.instructions.goHome}</li>
            <li>{uiMessages.instructions.refresh}</li>
            {isDevelopment && <li>{uiMessages.instructions.viewDetails}</li>}
          </ul>

          {isDevelopment && error && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <Bug className="h-4 w-4" />
                  {showDetails 
                    ? uiMessages.buttons.hideDetails 
                    : uiMessages.buttons.showDetails}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">
                    {uiMessages.debug.errorMessage}
                  </h4>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>

                {error.stack && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                      {uiMessages.debug.stackTrace}
                    </h4>
                    <pre className="text-xs overflow-auto max-h-64">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                      {uiMessages.debug.componentStack}
                    </h4>
                    <pre className="text-xs overflow-auto max-h-64">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 flex-wrap">
          <Button onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {uiMessages.buttons.retry}
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            {uiMessages.buttons.goHome}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}