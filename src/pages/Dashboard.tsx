import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptCard } from "@/features/prompts/components/PromptCard";
import { useToggleFavorite, useToggleVisibility } from "@/hooks/usePrompts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Star, Share2, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardData, isLoading } = useDashboard();
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutateAsync: toggleVisibility } = useToggleVisibility();

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de vos prompts et statistiques</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Usage Statistics */}
        {dashboardData?.usageStats && dashboardData.usageStats.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Prompts les plus utilisés</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.usageStats.map((stat) => (
                <Card key={stat.promptId}>
                  <CardHeader>
                    <CardTitle className="text-base">{stat.title}</CardTitle>
                    <CardDescription>Statistiques d'utilisation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Utilisations:</span>
                        <span className="font-semibold">{stat.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Taux de réussite:</span>
                        <span className="font-semibold">{stat.successRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recent Prompts */}
        {dashboardData?.recentPrompts && dashboardData.recentPrompts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Prompts récemment modifiés</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.recentPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={(id, currentState) =>
                    toggleFavorite({ id, currentState })
                  }
                  onToggleVisibility={async (id, currentVisibility, permission) => {
                    if (permission !== undefined) {
                      await toggleVisibility({ id, currentVisibility, publicPermission: permission });
                    } else {
                      await toggleVisibility({ id, currentVisibility });
                    }
                  }}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Favorite Prompts */}
        {dashboardData?.favoritePrompts && dashboardData.favoritePrompts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Prompts favoris</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.favoritePrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={(id, currentState) =>
                    toggleFavorite({ id, currentState })
                  }
                  onToggleVisibility={async (id, currentVisibility, permission) => {
                    if (permission !== undefined) {
                      await toggleVisibility({ id, currentVisibility, publicPermission: permission });
                    } else {
                      await toggleVisibility({ id, currentVisibility });
                    }
                  }}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Privately Shared With Me */}
        {dashboardData?.privatelySharedWithMe && dashboardData.privatelySharedWithMe.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Partagés avec moi</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.privatelySharedWithMe.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={(id, currentState) =>
                    toggleFavorite({ id, currentState })
                  }
                  onToggleVisibility={async (id, currentVisibility, permission) => {
                    if (permission !== undefined) {
                      await toggleVisibility({ id, currentVisibility, publicPermission: permission });
                    } else {
                      await toggleVisibility({ id, currentVisibility });
                    }
                  }}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Shared Prompts */}
        {dashboardData?.sharedPrompts && dashboardData.sharedPrompts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Prompts partagés par la communauté</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboardData.sharedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={(id, currentState) =>
                    toggleFavorite({ id, currentState })
                  }
                  onToggleVisibility={async (id, currentVisibility, permission) => {
                    if (permission !== undefined) {
                      await toggleVisibility({ id, currentVisibility, publicPermission: permission });
                    } else {
                      await toggleVisibility({ id, currentVisibility });
                    }
                  }}
                  onClick={() => navigate(`/prompts/${prompt.id}`)}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(!dashboardData?.recentPrompts?.length && 
          !dashboardData?.favoritePrompts?.length && 
          !dashboardData?.sharedPrompts?.length &&
          !dashboardData?.privatelySharedWithMe?.length &&
          !dashboardData?.usageStats?.length) && (
          <Card>
            <CardHeader>
              <CardTitle>Aucune donnée disponible</CardTitle>
              <CardDescription>
                Commencez par créer des prompts pour voir vos statistiques ici.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
