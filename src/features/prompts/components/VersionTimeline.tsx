import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, RotateCcw, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Version = Tables<"versions">;

interface VersionTimelineProps {
  versions: Version[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onViewDiff: (versionId: string) => void;
  isRestoring: boolean;
}

export function VersionTimeline({
  versions,
  currentVersion,
  onRestore,
  onViewDiff,
  isRestoring,
}: VersionTimelineProps) {
  if (versions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Aucune version enregistrée. Créez votre première version pour suivre l'historique.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version, index) => {
        const isCurrent = version.semver === currentVersion;
        const isLatest = index === 0;

        return (
          <Card key={version.id} className={isCurrent ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={isCurrent ? "default" : "secondary"} className="font-mono">
                      v{version.semver}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Actuelle
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    {version.message || `Version ${version.semver}`}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDiff(version.id)}
                    className="gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    Diff
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onRestore(version.id)}
                    disabled={isRestoring}
                    className="gap-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurer
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <time dateTime={version.created_at || ""}>
                  {version.created_at && formatDistanceToNow(new Date(version.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </time>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
