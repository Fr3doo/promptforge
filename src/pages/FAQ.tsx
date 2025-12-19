import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { faqData } from "@/data/faqData";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";

const FAQ = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(faqData.map(f => f.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto animate-pulse space-y-8">
            <div className="text-center space-y-4">
              <div className="h-8 bg-muted rounded w-48 mx-auto" />
              <div className="h-12 bg-muted rounded w-96 mx-auto" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO 
        title="FAQ - Questions Fréquentes | PromptForge"
        description="Trouvez les réponses à toutes vos questions sur PromptForge : import de prompts, compatibilité des modèles IA, versioning, sécurité, collaboration et plus encore."
        keywords="FAQ PromptForge, questions fréquentes, aide prompts, support IA, guide utilisation, import prompts, modèles IA compatibles"
      />
      
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 pt-4">
          <PageBreadcrumb items={[{ label: messages.breadcrumb.faq }]} />
        </div>

        <main id="main-content" className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm sm:text-base font-medium">Questions Fréquentes</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold px-4">
                Comment pouvons-nous vous aider ?
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                Trouvez rapidement les réponses à vos questions sur PromptForge
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="flex-1 sm:flex-none">
                      {cat === "all" ? "Toutes" : cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border rounded-lg px-4 sm:px-6 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start gap-3 text-left">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="font-semibold">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFAQ.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucune question ne correspond à votre recherche.
                </p>
              </div>
            )}

            <div className="text-center pt-8 border-t border-border">
              <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
              <p className="text-muted-foreground mb-6">
                Notre équipe est là pour vous aider
              </p>
              <Button onClick={() => navigate(user ? "/prompts" : "/auth")}>
                Commencer avec PromptForge
              </Button>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default FAQ;
