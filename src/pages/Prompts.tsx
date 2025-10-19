import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePrompts, useToggleFavorite } from "@/hooks/usePrompts";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Star, Eye, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";

const Prompts = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: prompts = [], isLoading } = usePrompts();
  const { mutate: toggleFavorite } = useToggleFavorite();

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const filteredPrompts = useMemo(() => 
    prompts.filter((prompt) =>
      prompt.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      prompt.tags?.some((tag: string) => tag.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ),
    [prompts, debouncedSearch]
  );

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, description ou tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <PromptListSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="cursor-pointer transition-all hover:border-primary"
                onClick={() => navigate(`/prompts/${prompt.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({ id: prompt.id, currentState: prompt.is_favorite ?? false });
                      }}
                      className="text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          prompt.is_favorite ? "fill-accent text-accent" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {prompt.description || "Aucune description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {prompt.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {prompt.tags && prompt.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prompt.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {prompt.visibility === "SHARED" ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      <span>{prompt.visibility === "SHARED" ? "Partagé" : "Privé"}</span>
                    </div>
                    <span>v{prompt.version}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPrompts.length === 0 && !isLoading && (
          <Card className="p-12 text-center border-dashed">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Aucun prompt ne correspond à votre recherche"
                : "Aucun prompt créé pour le moment"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/prompts/new")}>
                Créer votre premier prompt
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default Prompts;
