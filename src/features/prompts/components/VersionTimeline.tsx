import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GitBranch, RotateCcw, Eye, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { messages } from "@/constants/messages";

type Version = Tables<"versions">;

interface VersionTimelineProps {
  versions: Version[];
  currentVersion: string;
  onRestore: (versionId: string) => void;
  onViewDiff: (versionId: string) => void;
  onDelete: (versionIds: string[]) => void;
  isRestoring: boolean;
  isDeleting: boolean;
}

export function VersionTimeline({
  versions,
  currentVersion,
  onRestore,
  onViewDiff,
  onDelete,
  isRestoring,
  isDeleting,
}: VersionTimelineProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  const toggleVersion = (versionId: string, versionSemver: string) => {
    // Empêcher la sélection de la version courante
    if (versionSemver === currentVersion) {
      return;
    }
    
    setSelectedVersions(prev =>
      prev.includes(versionId)
        ? prev.filter(id => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedVersions.length > 0) {
      onDelete(selectedVersions);
      setSelectedVersions([]);
    }
  };
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
      {selectedVersions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedVersions.length} version(s) sélectionnée(s)
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{messages.tooltips.versions.deleteSelected}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
      
      {versions.map((version, index) => {
        const isCurrent = version.semver === currentVersion;
        const isLatest = index === 0;

        return (
          <Card key={version.id} className={isCurrent ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Checkbox
                      checked={selectedVersions.includes(version.id)}
                      onCheckedChange={() => toggleVersion(version.id, version.semver)}
                      disabled={isCurrent}
                      className="mt-1"
                      aria-label={messages.tooltips.versions.selectVersion}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isCurrent 
                        ? messages.tooltips.versions.currentVersionLocked 
                        : messages.tooltips.versions.selectVersion}
                    </p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isCurrent ? "default" : "secondary"} className="font-mono">
                      v{version.semver}
                    </Badge>
                    {isCurrent && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs">
                            ✓ Actuelle
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{messages.tooltips.versions.currentVersionLocked}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    {version.message || `Version ${version.semver}`}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDiff(version.id)}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <Eye className="h-3 w-3" />
                        Diff
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{messages.tooltips.versions.viewDiff}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onRestore(version.id)}
                        disabled={isRestoring}
                        className="gap-2 flex-1 sm:flex-none"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restaurer
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{messages.tooltips.versions.restoreVersion}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
