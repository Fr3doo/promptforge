import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Target, Code } from "lucide-react";
import { promptingMethods, type PromptingMethod } from "@/data/promptingMethods";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { messages } from "@/constants/messages";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PromptingMethods = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>(promptingMethods[0]?.id);
  const [difficultyFilter, setDifficultyFilter] = useState<PromptingMethod["difficulty"] | "Tous">("Tous");

  if (!loading && !user) {
    navigate("/auth");
    return null;
  }

  const filteredMethods = difficultyFilter === "Tous" 
    ? promptingMethods 
    : promptingMethods.filter(method => method.difficulty === difficultyFilter);

  const scrollToMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    const element = document.getElementById(methodId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Débutant": return "bg-green-500/10 text-green-500";
      case "Intermédiaire": return "bg-yellow-500/10 text-yellow-500";
      case "Avancé": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <SEO 
        title="Méthodes de Prompting | PromptForge"
        description="Découvrez toutes les techniques de prompt engineering : Zero-shot, Few-shot, Chain-of-Thought, ReAct, et bien plus. Apprenez quand et comment utiliser chaque méthode."
        keywords="méthodes prompting, techniques prompt engineering, zero-shot, few-shot, chain-of-thought, CoT, ReAct, prompt chaining, role prompting"
      />
      
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 pt-4">
          <PageBreadcrumb items={[{ label: messages.breadcrumb.methods }]} />
        </div>

        <main id="main-content" className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm sm:text-base font-medium">Méthodes de Prompting</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold px-4">
                12 Techniques de Prompt Engineering
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground px-4">
                Maîtrisez les méthodes avancées pour créer des prompts IA performants
              </p>

              {/* Filtres */}
              <div className="flex flex-wrap justify-center gap-2 pt-4 px-4">
                <Button
                  variant={difficultyFilter === "Tous" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Tous")}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={difficultyFilter === "Débutant" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Débutant")}
                  size="sm"
                >
                  Débutant
                </Button>
                <Button
                  variant={difficultyFilter === "Intermédiaire" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Intermédiaire")}
                  size="sm"
                >
                  Intermédiaire
                </Button>
                <Button
                  variant={difficultyFilter === "Avancé" ? "default" : "outline"}
                  onClick={() => setDifficultyFilter("Avancé")}
                  size="sm"
                >
                  Avancé
                </Button>
              </div>

              {/* Mobile Navigation Dropdown */}
              <div className="lg:hidden w-full px-4">
                <Select value={selectedMethod} onValueChange={scrollToMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.icon} {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Menu - Hidden on mobile, visible on large screens */}
              <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-4">
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <nav className="space-y-1 pr-4">
                      {filteredMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => scrollToMethod(method.id)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm ${
                            selectedMethod === method.id
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted"
                          }`}
                        >
                          {method.name}
                        </button>
                      ))}
                    </nav>
                  </ScrollArea>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {filteredMethods.map((method) => (
                  <Card key={method.id} id={method.id} className="overflow-hidden scroll-mt-4">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{method.icon}</div>
                          <div>
                            <CardTitle className="text-2xl">{method.name}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {method.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getDifficultyColor(method.difficulty)}>
                          {method.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Objectif</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{method.purpose}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <span>Cas d'usage</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {method.useCases.map((useCase, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="example" className="border-none">
                          <AccordionTrigger className="hover:no-underline pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Code className="h-4 w-4 text-primary" />
                              <span>Voir un exemple</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="overflow-hidden">
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap break-words">
                              <code>{method.example}</code>
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PromptingMethods;
