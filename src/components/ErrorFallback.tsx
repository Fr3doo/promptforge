import { ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

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

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReportError = () => {
    // TODO: Implement error reporting
    // Could open a modal with a form to submit error details
    // Or automatically send to a support endpoint
    console.log('Report error feature - to be implemented');
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
              <CardTitle className="text-2xl">Une erreur est survenue</CardTitle>
              <CardDescription>
                L'application a rencontré un problème inattendu
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur technique</AlertTitle>
            <AlertDescription>
              {error?.message || "Une erreur inconnue s'est produite"}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            Nous nous excusons pour ce désagrément. Vous pouvez essayer de :
          </p>

          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Réessayer l'opération qui a échoué</li>
            <li>Retourner à la page d'accueil</li>
            <li>Rafraîchir la page complètement</li>
            {isDevelopment && <li>Consulter les détails techniques ci-dessous</li>}
          </ul>

          {isDevelopment && error && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <Bug className="h-4 w-4" />
                  {showDetails ? 'Masquer' : 'Afficher'} les détails techniques
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Message d'erreur</h4>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {error.message}
                  </pre>
                </div>

                {error.stack && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Stack trace</h4>
                    <pre className="text-xs overflow-auto max-h-64">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Component stack</h4>
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
            Réessayer
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          {/* Future feature: Report error button */}
          {/* <Button onClick={handleReportError} variant="ghost" size="sm" className="gap-2">
            <Bug className="h-4 w-4" />
            Signaler l'erreur
          </Button> */}
        </CardFooter>
      </Card>
    </div>
  );
}