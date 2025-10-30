import { useState } from "react";
import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { usePromptVersioning } from "@/hooks/usePromptVersioning";
import { useDeleteVersions } from "@/hooks/useVersions";
import { VersionTimeline } from "@/features/prompts/components/VersionTimeline";
import { CreateVersionDialog } from "@/features/prompts/components/CreateVersionDialog";
import { DiffViewer } from "@/features/prompts/components/DiffViewer";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

/**
 * Versions tab component for prompt editor
 * Handles version timeline, creation, restoration, and diff viewing
 */
export function PromptEditorVersions() {
  const { prompt, variables, versions, form, canCreateVersion, promptId } = usePromptEditorContext();
  
  // Versioning
  const [diffOpen, setDiffOpen] = useState(false);
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<string | null>(null);
  
  const {
    versionMessage,
    setVersionMessage,
    versionType,
    setVersionType,
    handleCreateVersion,
    handleRestoreVersion,
    isCreating,
    isRestoring,
    hasUnsavedChanges,
  } = usePromptVersioning(prompt, variables, form.content);
  
  const deleteVersionsMutation = useDeleteVersions();
  
  const handleDeleteVersions = (versionIds: string[]) => {
    if (!promptId) return;
    deleteVersionsMutation.mutate({ 
      versionIds, 
      promptId,
      currentVersion: prompt?.version
    });
  };
  
  const handleViewDiff = (versionId: string) => {
    setSelectedVersionForDiff(versionId);
    setDiffOpen(true);
  };
  
  const selectedVersion = versions.find(v => v.id === selectedVersionForDiff);
  const selectedVersionIndex = versions.findIndex(v => v.id === selectedVersionForDiff);
  const previousVersion = selectedVersionIndex < versions.length - 1 
    ? versions[selectedVersionIndex + 1] 
    : null;
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Historique des versions</h3>
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="gap-1.5">
                <AlertCircle className="h-3 w-3" />
                Modifications non sauvegardées
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Suivez l'évolution de votre prompt avec SemVer
          </p>
        </div>
        <CreateVersionDialog
          currentVersion={prompt?.version || "1.0.0"}
          versionMessage={versionMessage}
          versionType={versionType}
          onMessageChange={setVersionMessage}
          onTypeChange={setVersionType}
          onConfirm={handleCreateVersion}
          isCreating={isCreating}
          hasUnsavedChanges={hasUnsavedChanges}
          disabled={!canCreateVersion}
        />
      </div>
      
      <VersionTimeline
        versions={versions}
        currentVersion={prompt?.version || "1.0.0"}
        onRestore={handleRestoreVersion}
        onViewDiff={handleViewDiff}
        onDelete={handleDeleteVersions}
        isRestoring={isRestoring}
        isDeleting={deleteVersionsMutation.isPending}
      />
      
      {/* Diff Dialog */}
      {selectedVersion && (
        <DiffViewer
          isOpen={diffOpen}
          onClose={() => setDiffOpen(false)}
          oldContent={previousVersion?.content || ""}
          newContent={selectedVersion.content}
          oldVersion={previousVersion?.semver || "Version précédente"}
          newVersion={selectedVersion.semver}
        />
      )}
    </div>
  );
}
