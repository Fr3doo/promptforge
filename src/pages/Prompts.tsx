import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOwnedPrompts, useSharedWithMePrompts, useToggleFavorite, useDeletePrompt, useDuplicatePrompt, useToggleVisibility } from "@/hooks/usePrompts";
import { useDebounce } from "@/hooks/useDebounce";
import { usePromptFilters } from "@/features/prompts/hooks/usePromptFilters";
import { PromptList } from "@/features/prompts/components/PromptList";
import { PromptSearchBar } from "@/features/prompts/components/PromptSearchBar";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { PromptAnalyzer } from "@/components/PromptAnalyzer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Prompts = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const navigate = useNavigate();
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: prompts = [], isLoading } = useOwnedPrompts();
  const { data: sharedWithMe = [], isLoading: isLoadingShared } = useSharedWithMePrompts();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: deletePrompt } = useDeletePrompt();
  const { mutate: duplicatePrompt } = useDuplicatePrompt();
  const { mutate: toggleVisibility } = useToggleVisibility();
  const { filteredPrompts } = usePromptFilters(prompts, debouncedSearch);
  const { filteredPrompts: filteredSharedPrompts } = usePromptFilters(sharedWithMe, debouncedSearch);

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

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mes Prompts</h1>
            <div className="flex gap-2">
              <Drawer open={analyzerOpen} onOpenChange={setAnalyzerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analyser un prompt
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
              <Button onClick={() => navigate("/prompts/new")} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau prompt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-12">
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
            searchQuery={searchQuery}
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
            searchQuery={searchQuery}
            currentUserId={user?.id}
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Prompts;
