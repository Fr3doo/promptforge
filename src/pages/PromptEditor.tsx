import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrompt } from "@/hooks/usePrompts";
import { useVariables } from "@/hooks/useVariables";
import { useAuth } from "@/hooks/useAuth";
import { usePromptForm } from "@/features/prompts/hooks/usePromptForm";
import { PromptMetadataForm } from "@/features/prompts/components/PromptMetadataForm";
import { PromptContentEditor } from "@/features/prompts/components/PromptContentEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!id;

  // Queries
  const { data: prompt, isLoading: loadingPrompt } = usePrompt(id);
  const { data: existingVariables = [], isLoading: loadingVariables } = useVariables(id);

  // Form hook with all logic
  const form = usePromptForm({
    prompt,
    existingVariables,
    isEditMode,
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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/prompts")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => form.handleSave(id)} disabled={form.isSaving} className="gap-2">
              {form.isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {form.isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </header>

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

        {/* Content Editor Section */}
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
      </main>
    </div>
  );
};

export default PromptEditorPage;
