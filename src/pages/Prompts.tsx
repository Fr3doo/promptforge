import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrompts, useToggleFavorite } from "@/hooks/usePrompts";
import { useDebounce } from "@/hooks/useDebounce";
import { usePromptFilters } from "@/features/prompts/hooks/usePromptFilters";
import { PromptList } from "@/features/prompts/components/PromptList";
import { PromptSearchBar } from "@/features/prompts/components/PromptSearchBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Prompts = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: prompts = [], isLoading } = usePrompts();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { filteredPrompts } = usePromptFilters(prompts, debouncedSearch);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mes Prompts</h1>
            <Button onClick={() => navigate("/prompts/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau prompt
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <PromptSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <PromptList
          prompts={filteredPrompts}
          isLoading={isLoading}
          onToggleFavorite={(id, currentState) =>
            toggleFavorite({ id, currentState })
          }
          emptySearchState={!!searchQuery}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
};

export default Prompts;
