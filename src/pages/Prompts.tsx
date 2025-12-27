import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOwnedPrompts, useSharedWithMePrompts, useToggleFavorite, useDeletePrompt, useDuplicatePrompt, useToggleVisibility, usePrompt } from "@/hooks/usePrompts";
import { useDebounce } from "@/hooks/useDebounce";
import { usePromptFilters } from "@/features/prompts/hooks/usePromptFilters";
import { PromptList } from "@/features/prompts/components/PromptList";
import { PromptSearchBar } from "@/features/prompts/components/PromptSearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Share2, X, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { PromptAnalyzer } from "@/components/PromptAnalyzer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { SharePromptDialog } from "@/features/prompts/components/SharePromptDialog";
import { ImportPromptDialog } from "@/components/prompts/ImportPromptDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { messages } from "@/constants/messages";


const Prompts = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const navigate = useNavigate();
  
  const justCreatedId = searchParams.get("justCreated");
  const { data: justCreatedPrompt } = usePrompt(justCreatedId || undefined);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: prompts = [], isLoading } = useOwnedPrompts();
  const { data: sharedWithMe = [], isLoading: isLoadingShared } = useSharedWithMePrompts();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: deletePrompt } = useDeletePrompt();
  const { mutate: duplicatePrompt } = useDuplicatePrompt();
  const { mutate: toggleVisibility } = useToggleVisibility();
  const { filteredPrompts } = usePromptFilters(prompts, debouncedSearch);
  const { filteredPrompts: filteredSharedPrompts } = usePromptFilters(sharedWithMe, debouncedSearch);

  // Detect newly created prompt and show share banner
  useEffect(() => {
    if (justCreatedId && justCreatedPrompt) {
      setShowShareBanner(true);
    }
  }, [justCreatedId, justCreatedPrompt]);

  const handleDuplicate = async (id: string) => {
    duplicatePrompt(id, {
      onSuccess: (newPrompt) => {
        navigate(`/prompts/${newPrompt.id}`);
      },
    });
  };

  const handleToggleVisibility = async (id: string, currentVisibility: "PRIVATE" | "SHARED", permission?: "READ" | "WRITE") => {
    if (permission !== undefined) {
      await toggleVisibility({ id, currentVisibility, publicPermission: permission });
    } else {
      await toggleVisibility({ id, currentVisibility });
    }
  };

  const handleDismissBanner = () => {
    setShowShareBanner(false);
    // Remove query param
    setSearchParams({});
  };

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    setShowShareBanner(false);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
    // Remove query param when dialog closes
    setSearchParams({});
  };

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <PageBreadcrumb items={[{ label: messages.breadcrumb.prompts }]} />
      </div>
      
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Mes Prompts</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Drawer open={analyzerOpen} onOpenChange={setAnalyzerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto justify-center">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Analyser un prompt</span>
                    <span className="sm:hidden">Analyser</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[95vh]">
                  <DrawerHeader>
                    <DrawerTitle>Analyseur de Prompts IA</DrawerTitle>
                    <DrawerDescription>
                      Extraction intelligente des sections, variables et métadonnées
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-y-auto px-4 pb-8">
                    <PromptAnalyzer onClose={() => setAnalyzerOpen(false)} />
                  </div>
                </DrawerContent>
              </Drawer>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="gap-2 w-full sm:w-auto justify-center">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importer</span>
                <span className="sm:hidden">Importer</span>
              </Button>
              <Button onClick={() => navigate("/prompts/new")} className="gap-2 w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4" />
                Nouveau prompt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-4 py-8 space-y-12">
        {/* Share Banner for newly created prompts */}
        {showShareBanner && justCreatedPrompt && (
          <Alert className="border-primary bg-primary/5">
            <Share2 className="h-4 w-4" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{messages.shareBanner.promptCreated}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {messages.shareBanner.shareQuestion(justCreatedPrompt.title)}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenShareDialog}
                  className="gap-2 flex-1 sm:flex-none"
                >
                  <Share2 className="h-4 w-4" />
                  {messages.buttons.shareNow}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismissBanner}
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <PromptSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">Mes Prompts</h2>
          <PromptList
            prompts={filteredPrompts}
            isLoading={isLoading}
            onToggleFavorite={(id, currentState) =>
              toggleFavorite({ id, currentState })
            }
            onDelete={(id) => deletePrompt(id)}
            onDuplicate={handleDuplicate}
            onToggleVisibility={handleToggleVisibility}
            emptySearchState={!!searchQuery}
            currentUserId={user?.id}
          />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Partagés avec moi</h2>
          </div>
          <PromptList
            prompts={filteredSharedPrompts}
            isLoading={isLoadingShared}
            onToggleFavorite={(id, currentState) =>
              toggleFavorite({ id, currentState })
            }
            onDelete={(id) => deletePrompt(id)}
            onDuplicate={handleDuplicate}
            onToggleVisibility={handleToggleVisibility}
            emptySearchState={!!searchQuery}
            currentUserId={user?.id}
            isSharedSection={true}
          />
        </section>
      </main>
      
      {/* Share Dialog */}
      {justCreatedPrompt && (
        <SharePromptDialog
          open={shareDialogOpen}
          onOpenChange={handleCloseShareDialog}
          promptId={justCreatedPrompt.id}
          promptTitle={justCreatedPrompt.title}
        />
      )}
      
      {/* Import Dialog */}
      <ImportPromptDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
      
      <Footer />
    </div>
  );
};

export default Prompts;
