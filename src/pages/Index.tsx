import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Zap, GitBranch, FileText, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PromptForge</span>
            </div>
            <Button onClick={() => navigate("/auth")}>Connexion</Button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center max-w-3xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Gérez vos prompts comme du code
              </h1>
              <p className="text-xl text-muted-foreground">
                Créez, versionnez et réutilisez vos prompts avec variables paramétrables.
                L'outil professionnel pour les équipes qui utilisent l'IA.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                En savoir plus
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-16">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Variables dynamiques</CardTitle>
                  <CardDescription>
                    Insérez des variables avec <code className="font-mono bg-muted px-1 rounded">{"{{variable}}"}</code> pour créer des templates réutilisables
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <GitBranch className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Versioning SemVer</CardTitle>
                  <CardDescription>
                    Historique complet, diff visuel et retour arrière sur toutes vos versions
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Export/Import</CardTitle>
                  <CardDescription>
                    Exportez en JSON ou Markdown pour partager avec votre équipe
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PromptForge</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Bienvenue, {user.email}</h1>
            <p className="text-xl text-muted-foreground">
              Prêt à créer des prompts professionnels ?
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/prompts/new")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Nouveau prompt
                </CardTitle>
                <CardDescription>
                  Créez un prompt avec variables paramétrables
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/prompts")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mes prompts
                </CardTitle>
                <CardDescription>
                  Consultez et gérez tous vos prompts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
