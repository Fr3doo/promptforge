import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Zap, GitBranch, FileText, BookOpen, HelpCircle, Lightbulb, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <SEO />
        <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center max-w-3xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">
                Gérez et optimisez vos prompts IA – dans un seul outil
              </h1>
              <p className="text-xl text-muted-foreground">
                Créez, versionnez, partagez vos prompts, et mesurez leur efficacité
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Centralisez vos templates IA, automatisez vos workflows et collaborez en équipe avec un système de versioning professionnel
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
                Commencer gratuitement
              </Button>
            </div>

            {/* Workflow visuel */}
            <div className="bg-card border border-border rounded-lg p-8 mt-12">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="font-semibold">Avant</p>
                  <p className="text-sm text-muted-foreground">Prompts éparpillés, non versionnés</p>
                </div>
                <div className="flex justify-center">
                  <div className="h-0.5 w-12 bg-primary md:rotate-0 rotate-90" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Code2 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold">Après</p>
                  <p className="text-sm text-muted-foreground">Bibliothèque centralisée et optimisée</p>
                </div>
              </div>
            </div>

            {/* Use cases */}
            <div className="grid gap-6 md:grid-cols-3 mt-16">
              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Marketing</CardTitle>
                  <CardDescription>
                    Générez des campagnes ciblées avec des templates personnalisables. Créez des variations A/B et suivez les performances.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <GitBranch className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Développement</CardTitle>
                  <CardDescription>
                    Automatisez vos prompts d'IA avec versioning SemVer. Intégrez dans vos workflows CI/CD et partagez avec l'équipe.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Recherche</CardTitle>
                  <CardDescription>
                    Centralisez vos templates de recherche. Exportez en JSON/Markdown et collaborez efficacement sur vos projets.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Quick links */}
            <div className="grid gap-4 md:grid-cols-3 mt-16">
              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Ressources</CardTitle>
                  </div>
                  <CardDescription>
                    Guides et tutoriels sur le prompt engineering
                    <span className="block mt-2 text-xs italic">(Connexion requise)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Méthodes</CardTitle>
                  </div>
                  <CardDescription>
                    12 techniques de prompting expliquées
                    <span className="block mt-2 text-xs italic">(Connexion requise)</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">FAQ</CardTitle>
                  </div>
                  <CardDescription>
                    Réponses à vos questions fréquentes
                    <span className="block mt-2 text-xs italic">(Connexion requise)</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Bienvenue, {user.email}</h1>
            <p className="text-xl text-muted-foreground">
              Prêt à créer des prompts professionnels ?
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/dashboard")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Tableau de bord
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble et statistiques
                </CardDescription>
              </CardHeader>
            </Card>

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
