import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { faqData } from "@/data/faqData";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";
import { FAQFilters, FAQItem, FAQStatusLegend } from "@/components/faq";

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
            {/* Header */}
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

            {/* Filters */}
            <FAQFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />

            {/* Legend */}
            <FAQStatusLegend />

            {/* FAQ Items */}
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFAQ.map((item, index) => (
                <FAQItem key={index} item={item} index={index} />
              ))}
            </Accordion>

            {/* Empty State */}
            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Aucune question ne correspond à votre recherche.
                </p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="mt-2"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}

            {/* CTA */}
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
