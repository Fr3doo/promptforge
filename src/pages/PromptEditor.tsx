import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAutoSave } from "@/features/prompts/hooks/useAutoSave";
import { PromptEditorProvider, usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { PromptEditorHeader } from "@/features/prompts/components/editor/PromptEditorHeader";
import { ConflictAlertContainer } from "@/features/prompts/components/editor/ConflictAlertContainer";
import { PromptEditorMetadata } from "@/features/prompts/components/editor/PromptEditorMetadata";
import { PromptEditorContent as PromptContentEditorWrapper } from "@/features/prompts/components/editor/PromptEditorContent";
import { PromptEditorVersions } from "@/features/prompts/components/editor/PromptEditorVersions";
import { SaveProgress } from "@/components/SaveProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Internal component that uses the context
 * Separated to allow context consumption
 */
function PromptEditorMainContent() {
  const { isEditMode, form, versions, promptId } = usePromptEditorContext();
  
  // Auto-save hook (only in edit mode)
  useAutoSave({
    promptId,
    title: form.title,
    content: form.content,
    description: form.description,
    tags: form.tags,
    enabled: isEditMode && !!promptId,
    interval: 30000, // 30 seconds
  });
  
  return (
    <>
      <PromptEditorHeader />
      
      <main id="main-content" className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <ConflictAlertContainer />
        
        <PromptEditorMetadata />
        
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Éditeur</TabsTrigger>
            <TabsTrigger value="versions">Versions ({versions.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-6">
            <PromptContentEditorWrapper />
          </TabsContent>
          
          <TabsContent value="versions">
            <PromptEditorVersions />
          </TabsContent>
        </Tabs>
      </main>
      
      <SaveProgress isSaving={form.isSaving} />
    </>
  );
}

/**
 * Orchestrator component for prompt editor page
 * Handles authentication and wraps children in context provider
 */
const PromptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  return (
    <PromptEditorProvider promptId={id}>
      <PromptEditorLoadingWrapper />
    </PromptEditorProvider>
  );
};

/**
 * Loading wrapper that consumes context for loading states
 */
function PromptEditorLoadingWrapper() {
  const { loading: authLoading } = useAuth();
  const { isLoadingPrompt, isLoadingVariables } = usePromptEditorContext();
  
  if (isLoadingPrompt || isLoadingVariables || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromptEditorMainContent />
      <Footer />
    </div>
  );
}

export default PromptEditorPage;
