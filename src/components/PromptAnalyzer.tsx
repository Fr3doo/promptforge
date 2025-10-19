import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Download, Copy, FileJson, FileText } from "lucide-react";
import { successToast, errorToast, loadingToast } from "@/lib/toastUtils";

interface AnalysisResult {
  sections: {
    contexte?: string;
    role?: string;
    instructions?: string;
    format?: string;
    contraintes?: string;
  };
  variables: Array<{
    name: string;
    description: string;
    type: string;
    default_value?: string;
    options?: string[];
  }>;
  prompt_template: string;
  metadata: {
    role: string;
    objectifs: string[];
    etapes?: string[];
    criteres?: string[];
    categories?: string[];
  };
}

interface ExportData {
  json: any;
  markdown: string;
}

export function PromptAnalyzer() {
  const [promptContent, setPromptContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [exports, setExports] = useState<ExportData | null>(null);

  const analyzePrompt = async () => {
    if (!promptContent.trim()) {
      errorToast("Erreur", "Veuillez saisir un prompt à analyser");
      return;
    }

    setIsAnalyzing(true);
    const toastId = loadingToast("Analyse du prompt en cours...");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-prompt', {
        body: { promptContent }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.data);
      setExports(data.exports);
      successToast("Analyse terminée", "Votre prompt a été structuré avec succès");
    } catch (error: any) {
      console.error('Erreur analyse:', error);
      errorToast("Erreur d'analyse", error.message || "Impossible d'analyser le prompt");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    successToast("Copié", `${label} copié dans le presse-papier`);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    successToast("Téléchargé", `Fichier ${filename} téléchargé`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Analyseur de Prompts IA
          </CardTitle>
          <CardDescription>
            Extrayez automatiquement les sections, variables et métadonnées de vos prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Collez votre prompt ici pour l'analyser..."
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button 
            onClick={analyzePrompt} 
            disabled={isAnalyzing || !promptContent.trim()}
            className="w-full gap-2"
          >
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAnalyzing ? "Analyse en cours..." : "Analyser le prompt"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de l'analyse</CardTitle>
            <CardDescription>
              Prompt structuré avec variables et métadonnées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metadata">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="metadata" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Rôle</h3>
                  <p className="text-sm text-muted-foreground">{result.metadata.role}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Objectifs</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.metadata.objectifs.map((obj, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{obj}</li>
                    ))}
                  </ul>
                </div>

                {result.metadata.etapes && result.metadata.etapes.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Étapes</h3>
                      <ol className="list-decimal list-inside space-y-1">
                        {result.metadata.etapes.map((step, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}

                {result.metadata.criteres && result.metadata.criteres.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Critères de qualité</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {result.metadata.criteres.map((crit, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{crit}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {result.metadata.categories && result.metadata.categories.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Tags suggérés</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.metadata.categories.map((cat, i) => (
                          <Badge key={i} variant="secondary">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="sections" className="space-y-4">
                {Object.entries(result.sections).map(([key, value]) => (
                  value && (
                    <div key={key}>
                      <h3 className="font-semibold mb-2 capitalize">{key}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{value}</p>
                      <Separator className="mt-4" />
                    </div>
                  )
                ))}
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                {result.variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune variable détectée</p>
                ) : (
                  result.variables.map((variable, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-mono">
                          {`{{${variable.name}}}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Type:</span>{' '}
                            <Badge variant="outline">{variable.type}</Badge>
                          </div>
                          {variable.default_value && (
                            <div>
                              <span className="font-semibold">Défaut:</span>{' '}
                              <code className="text-xs">{variable.default_value}</code>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{variable.description}</p>
                        {variable.options && variable.options.length > 0 && (
                          <div>
                            <span className="text-sm font-semibold">Options: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {variable.options.map((opt, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {opt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="template" className="space-y-4">
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>{result.prompt_template}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 gap-2"
                    onClick={() => copyToClipboard(result.prompt_template, "Template")}
                  >
                    <Copy className="h-3 w-3" />
                    Copier
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        Export JSON
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                        <code>{JSON.stringify(exports?.json, null, 2)}</code>
                      </pre>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => copyToClipboard(JSON.stringify(exports?.json, null, 2), "JSON")}
                        >
                          <Copy className="h-3 w-3" />
                          Copier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => downloadFile(
                            JSON.stringify(exports?.json, null, 2),
                            'prompt-structure.json',
                            'application/json'
                          )}
                        >
                          <Download className="h-3 w-3" />
                          Télécharger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export Markdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-64">
                        <code>{exports?.markdown}</code>
                      </pre>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => copyToClipboard(exports?.markdown || "", "Markdown")}
                        >
                          <Copy className="h-3 w-3" />
                          Copier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => downloadFile(
                            exports?.markdown || "",
                            'prompt-structure.md',
                            'text/markdown'
                          )}
                        >
                          <Download className="h-3 w-3" />
                          Télécharger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
