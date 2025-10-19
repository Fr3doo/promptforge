import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Star, Eye, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Prompts = () => {
  const { user, loading: authLoading } = useAuth();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchPrompts();
    }
  }, [user, authLoading, navigate]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des prompts");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({ is_favorite: !currentState })
        .eq("id", id);

      if (error) throw error;
      fetchPrompts();
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

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
                      toggleFavorite(prompt.id, prompt.is_favorite);
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
                  {prompt.tags?.length > 3 && (
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

        {filteredPrompts.length === 0 && !loading && (
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
