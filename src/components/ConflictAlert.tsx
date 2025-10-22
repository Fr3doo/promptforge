import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ConflictAlertProps {
  serverUpdatedAt: string;
  onRefresh: () => void;
  onDismiss?: () => void;
}

export function ConflictAlert({ 
  serverUpdatedAt, 
  onRefresh, 
  onDismiss 
}: ConflictAlertProps) {
  const timeAgo = formatDistanceToNow(new Date(serverUpdatedAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Conflit détecté</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Ce prompt a été modifié par un autre utilisateur {timeAgo}. 
          Vos modifications risquent d'écraser les changements récents.
        </p>
        <div className="flex gap-2">
          <Button onClick={onRefresh} size="sm">
            Recharger la dernière version
          </Button>
          {onDismiss && (
            <Button onClick={onDismiss} variant="outline" size="sm">
              Continuer malgré tout
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
