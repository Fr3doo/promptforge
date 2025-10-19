import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Clock, User } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Resources = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  const categories = ["all", ...Array.from(new Set(blogArticles.map(a => a.category)))];

  const filteredArticles = blogArticles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO 
        title="Ressources - Guide du Prompt Engineering | PromptForge"
        description="Découvrez nos guides, tutoriels et bonnes pratiques pour maîtriser le prompt engineering. Apprenez à créer des prompts performants pour vos projets IA."
        keywords="guide prompt engineering, tutoriels IA, bonnes pratiques prompts, ressources IA, apprendre prompt engineering, optimisation prompts IA"
      />
      
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Centre de Ressources</span>
              </div>
              <h1 className="text-4xl font-bold">
                Maîtrisez le Prompt Engineering
              </h1>
              <p className="text-xl text-muted-foreground">
                Guides, tutoriels et bonnes pratiques pour créer des prompts IA performants
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un article, un mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList>
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat}>
                      {cat === "all" ? "Tous" : cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="grid gap-6">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => navigate(`/resources/${article.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{article.category}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{article.readTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{article.author}</span>
                          </div>
                        </div>
                        <CardTitle className="text-2xl">{article.title}</CardTitle>
                        <CardDescription className="text-base">
                          {article.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucun article ne correspond à votre recherche.
                </p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Resources;
