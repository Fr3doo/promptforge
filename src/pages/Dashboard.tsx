import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToggleFavorite, useToggleVisibility } from "@/hooks/usePrompts";
import { TrendingUp, Star, Share2, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { messages } from "@/constants/messages";
import { useLoadingState } from "@/hooks/useLoadingState";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { DashboardPromptSection } from "@/components/DashboardPromptSection";

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

  const loadingState = useLoadingState({
    isLoading,
    data: dashboardData,
    loadingComponent: <DashboardSkeleton />,
    emptyComponent: (
      <Card>
        <CardHeader>
          <CardTitle>{messages.dashboard.emptyState.title}</CardTitle>
          <CardDescription>{messages.dashboard.emptyState.description}</CardDescription>
        </CardHeader>
      </Card>
    ),
    isEmpty: (data) => 
      !data?.recentPrompts?.length && 
      !data?.favoritePrompts?.length && 
      !data?.sharedPrompts?.length &&
      !data?.usageStats?.length,
  });

  if (loadingState.shouldRender) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {loadingState.content}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{messages.dashboard.title}</h1>
          <p className="text-muted-foreground">{messages.dashboard.pageDescription}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Usage Statistics */}
        {dashboardData?.usageStats && dashboardData.usageStats.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{messages.dashboard.sections.usage}</h2>
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
                        <span className="text-sm text-muted-foreground">Utilisations</span>
                        <span className="font-semibold">{stat.usageCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Taux de succès</span>
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
        <DashboardPromptSection
          icon={Clock}
          title={messages.dashboard.sections.recent}
          prompts={dashboardData?.recentPrompts || []}
          currentUserId={user?.id}
          onToggleFavorite={(id, currentState) => toggleFavorite({ id, currentState })}
          onToggleVisibility={async (id, currentVisibility, permission) => {
            if (permission !== undefined) {
              await toggleVisibility({ id, currentVisibility, publicPermission: permission });
            } else {
              await toggleVisibility({ id, currentVisibility });
            }
          }}
          onPromptClick={(id) => navigate(`/prompts/${id}`)}
        />

        {/* Favorite Prompts */}
        <DashboardPromptSection
          icon={Star}
          title={messages.dashboard.sections.favorites}
          prompts={dashboardData?.favoritePrompts || []}
          currentUserId={user?.id}
          onToggleFavorite={(id, currentState) => toggleFavorite({ id, currentState })}
          onToggleVisibility={async (id, currentVisibility, permission) => {
            if (permission !== undefined) {
              await toggleVisibility({ id, currentVisibility, publicPermission: permission });
            } else {
              await toggleVisibility({ id, currentVisibility });
            }
          }}
          onPromptClick={(id) => navigate(`/prompts/${id}`)}
        />


        {/* Shared Prompts */}
        <DashboardPromptSection
          icon={Share2}
          title={messages.dashboard.sections.shared}
          prompts={dashboardData?.sharedPrompts || []}
          currentUserId={user?.id}
          onToggleFavorite={(id, currentState) => toggleFavorite({ id, currentState })}
          onToggleVisibility={async (id, currentVisibility, permission) => {
            if (permission !== undefined) {
              await toggleVisibility({ id, currentVisibility, publicPermission: permission });
            } else {
              await toggleVisibility({ id, currentVisibility });
            }
          }}
          onPromptClick={(id) => navigate(`/prompts/${id}`)}
        />

      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
