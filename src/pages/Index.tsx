import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Zap, GitBranch, FileText, BookOpen, HelpCircle, Lightbulb, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { messages } from "@/constants/messages";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">{messages.marketing.loading}</div>
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
            <div className="space-y-4 px-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                {messages.marketing.hero.title}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {messages.marketing.hero.subtitle}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                {messages.marketing.hero.description}
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate("/signup")} className="gap-2">
                {messages.marketing.hero.cta}
              </Button>
            </div>

            {/* Workflow visuel */}
            <div className="bg-card border border-border rounded-lg p-8 mt-12">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="font-semibold">{messages.marketing.beforeAfter.before}</p>
                  <p className="text-sm text-muted-foreground">{messages.marketing.beforeAfter.beforePoint1}</p>
                </div>
                <div className="flex justify-center">
                  <div className="h-0.5 w-12 bg-primary md:rotate-0 rotate-90" />
                </div>
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Code2 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold">{messages.marketing.beforeAfter.after}</p>
                  <p className="text-sm text-muted-foreground">{messages.marketing.beforeAfter.afterPoint1}</p>
                </div>
              </div>
            </div>

            {/* Use cases */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mt-16 px-4">
              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{messages.marketing.useCases.marketing.title}</CardTitle>
                  <CardDescription>
                    {messages.marketing.useCases.marketing.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <GitBranch className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{messages.marketing.useCases.development.title}</CardTitle>
                  <CardDescription>
                    {messages.marketing.useCases.development.description}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">{messages.marketing.useCases.research.title}</CardTitle>
                  <CardDescription>
                    {messages.marketing.useCases.research.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Quick links */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mt-16 px-4">
              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{messages.marketing.quickLinks.resources.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {messages.marketing.quickLinks.resources.description}
                    <span className="block mt-2 text-xs italic">{messages.marketing.quickLinks.resources.descriptionWithAuth}</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{messages.marketing.quickLinks.methods.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {messages.marketing.quickLinks.methods.description}
                    <span className="block mt-2 text-xs italic">{messages.marketing.quickLinks.methods.descriptionWithAuth}</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="opacity-60 cursor-not-allowed transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{messages.marketing.quickLinks.faq.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {messages.marketing.quickLinks.faq.description}
                    <span className="block mt-2 text-xs italic">{messages.marketing.quickLinks.faq.descriptionWithAuth}</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8 px-4">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold">{messages.marketing.hero.welcomeBack(profile?.pseudo || user.email)}</h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {messages.marketing.hero.welcomeDescription}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/dashboard")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  {messages.marketing.quickLinks.dashboard.title}
                </CardTitle>
                <CardDescription>
                  {messages.marketing.quickLinks.dashboard.description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/prompts/new")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {messages.marketing.quickLinks.newPrompt.title}
                </CardTitle>
                <CardDescription>
                  {messages.marketing.quickLinks.newPrompt.description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => navigate("/prompts")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {messages.marketing.quickLinks.myPrompts.title}
                </CardTitle>
                <CardDescription>
                  {messages.marketing.quickLinks.myPrompts.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
