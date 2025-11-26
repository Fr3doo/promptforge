import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Code2, ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";
import { SEO } from "@/components/SEO";
import ReactMarkdown from "react-markdown";

const ResourceArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const article = blogArticles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Article non trouvé</h1>
          <Button onClick={() => navigate("/resources")}>
            Retour aux ressources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${article.title} | PromptForge`}
        description={article.description}
        keywords={article.keywords.join(", ")}
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/resources")}
                  aria-label="Retour aux ressources"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Code2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">PromptForge</span>
                </div>
              </div>
              <Button onClick={() => navigate("/prompts")}>
                Mes Prompts
              </Button>
            </div>
          </div>
        </header>

        <main id="main-content" className="container mx-auto px-4 py-8 sm:py-12">
          <article className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary">{article.category}</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold">{article.title}</h1>
              <p className="text-lg sm:text-xl text-muted-foreground">{article.description}</p>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{new Date(article.date).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>

            <Card className="p-4 sm:p-6 md:p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none prose-img:max-w-full prose-pre:max-w-full prose-pre:overflow-x-auto">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </Card>

            <div className="pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword) => (
                  <Badge key={keyword} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => navigate("/resources")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux ressources
              </Button>
            </div>
          </article>
        </main>
      </div>
    </>
  );
};

export default ResourceArticle;
