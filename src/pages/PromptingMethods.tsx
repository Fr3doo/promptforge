import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Code2, ArrowLeft, Search, Lightbulb, Target, Code } from "lucide-react";
import { promptingMethods } from "@/data/promptingMethods";
import { SEO } from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PromptingMethods = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMethods = promptingMethods.filter(method =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.useCases.some(uc => uc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/")}
                  aria-label="Retour à l'accueil"
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

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium">Méthodes de Prompting</span>
              </div>
              <h1 className="text-4xl font-bold">
                12 Techniques de Prompt Engineering
              </h1>
              <p className="text-xl text-muted-foreground">
                Maîtrisez les méthodes avancées pour créer des prompts IA performants
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une méthode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid gap-6">
              {filteredMethods.map((method) => (
                <Card key={method.id} className="overflow-hidden">
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
                    <div className="grid md:grid-cols-2 gap-4">
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

                    <Accordion type="single" collapsible>
                      <AccordionItem value="example" className="border-none">
                        <AccordionTrigger className="hover:no-underline pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Code className="h-4 w-4 text-primary" />
                            <span>Voir un exemple</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{method.example}</code>
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMethods.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucune méthode ne correspond à votre recherche.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default PromptingMethods;
