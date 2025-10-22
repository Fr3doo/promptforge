import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrompt } from "@/hooks/usePrompts";
import { useVariables } from "@/hooks/useVariables";
import { useVersions, useDeleteVersions } from "@/hooks/useVersions";
import { useAuth } from "@/hooks/useAuth";
import { usePromptForm } from "@/features/prompts/hooks/usePromptForm";
import { useAutoSave } from "@/features/prompts/hooks/useAutoSave";
import { usePromptVersioning } from "@/hooks/usePromptVersioning";
import { usePromptPermission } from "@/hooks/usePromptPermission";
import { useConflictDetection } from "@/hooks/useConflictDetection";
import { PromptMetadataForm } from "@/features/prompts/components/PromptMetadataForm";
import { ConflictAlert } from "@/components/ConflictAlert";
import { PromptContentEditor } from "@/features/prompts/components/PromptContentEditor";
import { VersionTimeline } from "@/features/prompts/components/VersionTimeline";
import { CreateVersionDialog } from "@/features/prompts/components/CreateVersionDialog";
import { DiffViewer } from "@/features/prompts/components/DiffViewer";
import { LoadingButton } from "@/components/LoadingButton";
import { SaveProgress } from "@/components/SaveProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle, Eye } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!id;

  // Queries
  const { data: prompt, isLoading: loadingPrompt, refetch: refetchPrompt } = usePrompt(id);
  const { data: existingVariables = [], isLoading: loadingVariables, refetch: refetchVariables } = useVariables(id);
  const { data: versions = [] } = useVersions(id);

  // Permissions
  const { canEdit, canCreateVersion, permission, isOwner } = usePromptPermission(id);

  // Détection des conflits d'édition concurrente
  const { hasConflict, serverUpdatedAt, resetConflict } = useConflictDetection(
    id,
    prompt?.updated_at,
    canEdit // Ne vérifier que si l'utilisateur peut éditer
  );

  const handleRefreshPrompt = () => {
    refetchPrompt(); // Recharger le prompt depuis le serveur
    refetchVariables(); // Recharger les variables
    resetConflict(); // Réinitialiser l'état de conflit
  };

  // Form hook with all logic
  const form = usePromptForm({
    prompt,
    existingVariables,
    isEditMode,
    canEdit,
  });

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
  } = usePromptVersioning(prompt, existingVariables, form.content);

  const deleteVersionsMutation = useDeleteVersions();

  const handleDeleteVersions = (versionIds: string[]) => {
    if (!id) return;
    deleteVersionsMutation.mutate({ 
      versionIds, 
      promptId: id,
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

  // Auto-save hook (seulement en mode édition)
  useAutoSave({
    promptId: id,
    title: form.title,
    content: form.content,
    description: form.description,
    tags: form.tags,
    visibility: "PRIVATE", // Valeur par défaut, non modifiable depuis l'éditeur
    enabled: isEditMode && !!id,
    interval: 30000, // 30 secondes
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (loadingPrompt || loadingVariables) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <LoadingButton variant="ghost" onClick={() => navigate("/prompts")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </LoadingButton>
            
            <div className="flex items-center gap-3">
              {!canEdit && permission && (
                <Badge variant="secondary" className="gap-1.5">
                  <Eye className="h-3 w-3" />
                  Mode lecture seule
                </Badge>
              )}
              <LoadingButton
                onClick={() => form.handleSave(id, hasConflict)}
                isLoading={form.isSaving}
                loadingText="Enregistrement..."
                className="gap-2"
                disabled={!canEdit || hasConflict}
              >
                Enregistrer
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Conflict Alert */}
        {hasConflict && serverUpdatedAt && (
          <ConflictAlert 
            serverUpdatedAt={serverUpdatedAt}
            onRefresh={handleRefreshPrompt}
            onDismiss={resetConflict}
          />
        )}

        {/* Metadata Section */}
        <PromptMetadataForm
          title={form.title}
          onTitleChange={form.setTitle}
          description={form.description}
          onDescriptionChange={form.setDescription}
          tags={form.tags}
          tagInput={form.tagInput}
          onTagInputChange={form.setTagInput}
          onAddTag={form.addTag}
          onRemoveTag={form.removeTag}
          isEditMode={isEditMode}
          disabled={!canEdit}
        />

        {/* Tabs for Editor, Variables, and Versions */}
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Éditeur</TabsTrigger>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-6">
            <PromptContentEditor
              content={form.content}
              onContentChange={form.setContent}
              variables={form.variables}
              variableValues={form.variableValues}
              onVariableValuesChange={form.setVariableValues}
              onDetectVariables={form.detectVariables}
              onVariableUpdate={form.updateVariable}
              onVariableDelete={form.deleteVariable}
              disabled={!canEdit}
            />
          </TabsContent>


          <TabsContent value="versions" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
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
          </TabsContent>
        </Tabs>
      </main>

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

      {/* Save Progress Indicator */}
      <SaveProgress isSaving={form.isSaving} />
      
      <Footer />
    </div>
  );
};

export default PromptEditorPage;
