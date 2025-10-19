import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Loader2, Sparkles, Copy } from "lucide-react";
import { usePromptAnalysis } from "@/hooks/usePromptAnalysis";
import { MetadataView } from "./analyzer/MetadataView";
import { ExportActions } from "./analyzer/ExportActions";
import { Badge } from "@/components/ui/badge";
import { successToast } from "@/lib/toastUtils";

export function PromptAnalyzer() {
  const [promptContent, setPromptContent] = useState("");
  const { result, isAnalyzing, analyze } = usePromptAnalysis();

  const copyTemplate = () => {
    if (result) {
      navigator.clipboard.writeText(result.prompt_template);
      successToast("Copié", "Template copié");
    }
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
            Extraction automatique des sections, variables et métadonnées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Collez votre prompt ici..."
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
          <Button 
            onClick={() => analyze(promptContent)} 
            disabled={isAnalyzing || !promptContent.trim()}
            className="w-full gap-2"
          >
            {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isAnalyzing ? "Analyse..." : "Analyser"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
            <CardDescription>Prompt structuré</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metadata">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metadata">Métadonnées</TabsTrigger>
                <TabsTrigger value="variables">Variables ({result.variables.length})</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="metadata">
                <MetadataView metadata={result.metadata} />
              </TabsContent>

              <TabsContent value="variables" className="space-y-3">
                {result.variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune variable détectée</p>
                ) : (
                  result.variables.map((v, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-mono">
                          {`{{${v.name}}}`}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{v.type}</Badge>
                          {v.default_value && (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {v.default_value}
                            </code>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                        {v.options && v.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.options.map((opt, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {opt}
                              </Badge>
                            ))}
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
                    onClick={copyTemplate}
                  >
                    <Copy className="h-3 w-3" />
                    Copier
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="export">
                <ExportActions
                  jsonData={result.exports.json}
                  markdownData={result.exports.markdown}
                  filename="prompt-structure"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
