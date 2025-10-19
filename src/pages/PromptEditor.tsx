import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrompt } from "@/hooks/usePrompts";
import { useVariables } from "@/hooks/useVariables";
import { useVersions } from "@/hooks/useVersions";
import { useAuth } from "@/hooks/useAuth";
import { usePromptForm } from "@/features/prompts/hooks/usePromptForm";
import { usePromptVersioning } from "@/hooks/usePromptVersioning";
import { PromptMetadataForm } from "@/features/prompts/components/PromptMetadataForm";
import { PromptContentEditor } from "@/features/prompts/components/PromptContentEditor";
import { VersionTimeline } from "@/features/prompts/components/VersionTimeline";
import { CreateVersionDialog } from "@/features/prompts/components/CreateVersionDialog";
import { DiffViewer } from "@/features/prompts/components/DiffViewer";
import { LoadingButton } from "@/components/LoadingButton";
import { SaveProgress } from "@/components/SaveProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";

const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!id;

  // Queries
  const { data: prompt, isLoading: loadingPrompt } = usePrompt(id);
  const { data: existingVariables = [], isLoading: loadingVariables } = useVariables(id);
  const { data: versions = [] } = useVersions(id);

  // Form hook with all logic
  const form = usePromptForm({
    prompt,
    existingVariables,
    isEditMode,
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
  } = usePromptVersioning(prompt, existingVariables);

  const handleViewDiff = (versionId: string) => {
    setSelectedVersionForDiff(versionId);
    setDiffOpen(true);
  };

  const selectedVersion = versions.find(v => v.id === selectedVersionForDiff);

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
          <div className="flex items-center justify-between">
            <LoadingButton variant="ghost" onClick={() => navigate("/prompts")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </LoadingButton>
            <LoadingButton
              onClick={() => form.handleSave(id)}
              isLoading={form.isSaving}
              loadingText="Enregistrement..."
              className="gap-2"
            >
              Enregistrer
            </LoadingButton>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metadata Section */}
        <PromptMetadataForm
          title={form.title}
          onTitleChange={form.setTitle}
          description={form.description}
          onDescriptionChange={form.setDescription}
          visibility={form.visibility}
          onVisibilityChange={form.setVisibility}
          tags={form.tags}
          tagInput={form.tagInput}
          onTagInputChange={form.setTagInput}
          onAddTag={form.addTag}
          onRemoveTag={form.removeTag}
        />

        {/* Tabs for Editor, Variables, and Versions */}
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Éditeur</TabsTrigger>
            <TabsTrigger value="variables">Variables ({form.variables.length})</TabsTrigger>
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
            />
          </TabsContent>

          <TabsContent value="variables" className="mt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Variables ({form.variables.length})</h2>
              <PromptContentEditor
                content={form.content}
                onContentChange={form.setContent}
                variables={form.variables}
                variableValues={form.variableValues}
                onVariableValuesChange={form.setVariableValues}
                onDetectVariables={form.detectVariables}
                onVariableUpdate={form.updateVariable}
                onVariableDelete={form.deleteVariable}
              />
            </div>
          </TabsContent>

          <TabsContent value="versions" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Historique des versions</h3>
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
              />
            </div>

            <VersionTimeline
              versions={versions}
              currentVersion={prompt?.version || "1.0.0"}
              onRestore={handleRestoreVersion}
              onViewDiff={handleViewDiff}
              isRestoring={isRestoring}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Diff Dialog */}
      {selectedVersion && prompt && (
        <DiffViewer
          isOpen={diffOpen}
          onClose={() => setDiffOpen(false)}
          oldContent={selectedVersion.content}
          newContent={prompt.content}
          oldVersion={selectedVersion.semver}
          newVersion={prompt.version || "1.0.0"}
        />
      )}

      {/* Save Progress Indicator */}
      <SaveProgress isSaving={form.isSaving} />
    </div>
  );
};

export default PromptEditorPage;
