import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Loader2, Sparkles, Copy, Save, RotateCcw } from "lucide-react";
import { usePromptAnalysis } from "@/hooks/usePromptAnalysis";
import { useCreatePrompt } from "@/hooks/usePrompts";
import { MetadataView } from "./analyzer/MetadataView";
import { ExportActions } from "./analyzer/ExportActions";
import { Badge } from "@/components/ui/badge";
import { successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";

interface PromptAnalyzerProps {
  onClose?: () => void;
}

export function PromptAnalyzer({ onClose }: PromptAnalyzerProps) {
  const [promptContent, setPromptContent] = useState("");
  const { result, isAnalyzing, analyze, reset } = usePromptAnalysis();
  const { mutate: createPrompt, isPending: isSaving } = useCreatePrompt();

  const copyTemplate = () => {
    if (result) {
      navigator.clipboard.writeText(result.prompt_template);
      successToast(messages.success.copied, messages.copy.template);
    }
  };

  const handleSavePrompt = () => {
    if (!result) return;

    // Construire la description à partir des métadonnées
    let description = "";
    
    // Ajouter l'objectif
    if (result.metadata.objectifs && result.metadata.objectifs.length > 0) {
      description += "**Objectif:**\n" + result.metadata.objectifs.map(obj => `- ${obj}`).join('\n') + "\n\n";
    }
    
    // Ajouter les étapes
    if (result.metadata.etapes && result.metadata.etapes.length > 0) {
      description += "**Étapes:**\n" + result.metadata.etapes.map((etape, i) => `${i + 1}. ${etape}`).join('\n') + "\n\n";
    }
    
    // Ajouter les critères de qualité
    if (result.metadata.criteres && result.metadata.criteres.length > 0) {
      description += "**Critères de qualité:**\n" + result.metadata.criteres.map(crit => `- ${crit}`).join('\n');
    }
    
    // Utiliser le rôle si aucune autre information n'est disponible
    if (!description && result.metadata.role) {
      description = result.metadata.role;
    }

    const categories = result.metadata.categories || [];
    
    createPrompt(
      {
        title: result.metadata.objectifs?.[0] || "Prompt analysé",
        content: result.prompt_template,
        description: description.trim(),
        tags: categories,
        is_favorite: false,
        version: "1.0.0",
        visibility: "PRIVATE",
        status: "PUBLISHED",
        public_permission: "READ" as const,
      },
      {
        onSuccess: () => {
          successToast(messages.success.promptSaved);
          onClose?.();
        },
      }
    );
  };

  const handleNewAnalysis = () => {
    setPromptContent("");
    reset();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {messages.analyzer.title}
          </CardTitle>
          <CardDescription>
            {messages.analyzer.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={messages.placeholders.analyzerPrompt}
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
            {isAnalyzing ? messages.analyzer.analyzing : messages.analyzer.analyze}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{messages.analyzer.results}</CardTitle>
                <CardDescription>{messages.analyzer.structuredPrompt}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewAnalysis}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {messages.analyzer.newAnalysis}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePrompt}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {messages.analyzer.saving}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {messages.analyzer.save}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metadata">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metadata">{messages.analyzer.tabs.metadata}</TabsTrigger>
                <TabsTrigger value="variables">{messages.analyzer.tabs.variables} ({result.variables.length})</TabsTrigger>
                <TabsTrigger value="template">{messages.analyzer.tabs.structured}</TabsTrigger>
                <TabsTrigger value="export">{messages.analyzer.tabs.export}</TabsTrigger>
              </TabsList>

              <TabsContent value="metadata">
                <MetadataView metadata={result.metadata} />
              </TabsContent>

              <TabsContent value="variables" className="space-y-3">
                {result.variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{messages.analyzer.noVariables}</p>
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
                    {messages.copy.copyAction}
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
