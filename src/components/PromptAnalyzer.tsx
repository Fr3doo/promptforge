import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Loader2, Sparkles, Copy, Save, RotateCcw } from "lucide-react";
import { usePromptAnalysis } from "@/hooks/usePromptAnalysis";
import { useCreatePrompt } from "@/hooks/usePrompts";
import { useBulkUpsertVariables } from "@/hooks/useVariables";
import { useCreateVersion } from "@/hooks/useVersions";
import { MetadataView } from "./analyzer/MetadataView";
import { ExportActions } from "./analyzer/ExportActions";
import { MobileExportActions } from "./analyzer/MobileExportActions";
import { CharacterCounter } from "./analyzer/CharacterCounter";
import { Badge } from "@/components/ui/badge";
import { successToast, errorToast } from "@/lib/toastUtils";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { promptSchema } from "@/lib/validation";
import { sanitizeAITags } from "@/lib/tagValidation";
import { messages } from "@/constants/messages";
import { captureException } from "@/lib/logger";
import { useBreakpoint } from "@/hooks/use-breakpoint";

interface PromptAnalyzerProps {
  onClose?: () => void;
}

export function PromptAnalyzer({ onClose }: PromptAnalyzerProps) {
  const [promptContent, setPromptContent] = useState("");
  const { result, isAnalyzing, analyze, reset } = usePromptAnalysis();
  const breakpoint = useBreakpoint();
  const { mutate: createPrompt, isPending: isSaving } = useCreatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();
  const { mutate: createInitialVersion } = useCreateVersion();

  const copyTemplate = () => {
    if (result) {
      navigator.clipboard.writeText(result.prompt_template);
      successToast(messages.success.copied, messages.copy.template);
    }
  };

  const handleSavePrompt = () => {
    if (!result) return;

    try {
      // 🛡️ SÉCURISATION : Nettoyer les tags de l'IA AVANT validation
      const sanitizedTags = sanitizeAITags(result.metadata.categories);
      
      // Log pour monitoring (Murphy's Law : toujours tracer)
      if (sanitizedTags.length !== result.metadata.categories?.length) {
        console.warn(
          `[PromptAnalyzer] Tags nettoyés: ${result.metadata.categories?.length} → ${sanitizedTags.length}`,
          { 
            original: result.metadata.categories,
            sanitized: sanitizedTags 
          }
        );
      }

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
      
      const promptData = {
        title: result.metadata.objectifs?.[0] || "Prompt analysé",
        content: result.exports.json.original,
        description: description.trim(),
        tags: sanitizedTags,
        is_favorite: false,
        version: "1.0.0",
        visibility: "PRIVATE" as const,
        status: "PUBLISHED" as const,
        public_permission: "READ" as const,
      };

      // Valider avec Zod avant de sauvegarder
      promptSchema.parse(promptData);

      createPrompt(promptData, {
        onSuccess: (newPrompt) => {
          // Étape 1: Sauvegarder les variables
          if (result.variables && result.variables.length > 0) {
            // Mapper le type SELECT vers ENUM (type DB réel)
            const mapVariableType = (type: string): "STRING" | "NUMBER" | "BOOLEAN" | "ENUM" => {
              const upperType = type?.toUpperCase() || "STRING";
              if (upperType === "SELECT") return "ENUM";
              if (["STRING", "NUMBER", "BOOLEAN", "ENUM"].includes(upperType)) {
                return upperType as "STRING" | "NUMBER" | "BOOLEAN" | "ENUM";
              }
              return "STRING";
            };

            const variablesToSave = result.variables.map((v, index) => ({
              name: v.name,
              type: mapVariableType(v.type),
              required: v.required !== undefined ? v.required : false,
              default_value: v.default_value || "",
              help: v.description || "",
              pattern: v.pattern || "",
              options: v.options || [],
              order_index: index,
            }));

            saveVariables(
              { promptId: newPrompt.id, variables: variablesToSave },
              {
                onSuccess: () => {
                  // Étape 2: Créer la version initiale
                  createInitialVersion(
                    {
                      prompt_id: newPrompt.id,
                      content: newPrompt.content,
                      semver: "1.0.0",
                      message: "Version initiale créée depuis l'analyseur",
                    },
                    {
                      onSuccess: () => {
                        successToast(messages.success.promptSaved);
                        onClose?.();
                      },
                      onError: (error) => {
                        // Version échouée mais prompt + variables sauvés
                        captureException(error, "Échec création version initiale depuis analyseur");
                        successToast(messages.success.promptSaved, "La version initiale n'a pas pu être créée");
                        onClose?.();
                      },
                    }
                  );
                },
                onError: (error) => {
                  captureException(error, "Échec sauvegarde variables depuis analyseur");
                  errorToast(messages.errors.variables.saveFailed, getSafeErrorMessage(error));
                  // Continuer quand même: prompt sauvé
                  onClose?.();
                },
              }
            );
          } else {
            // Pas de variables: créer juste la version initiale
            createInitialVersion(
              {
                prompt_id: newPrompt.id,
                content: newPrompt.content,
                semver: "1.0.0",
                message: "Version initiale créée depuis l'analyseur",
              },
              {
                onSuccess: () => {
                  successToast(messages.success.promptSaved);
                  onClose?.();
                },
                onError: (error) => {
                  captureException(error, "Échec création version initiale depuis analyseur");
                  successToast(messages.success.promptSaved, "La version initiale n'a pas pu être créée");
                  onClose?.();
                },
              }
            );
          }
        },
        onError: (error) => {
          captureException(error, "Échec sauvegarde prompt depuis analyseur");
          errorToast(messages.labels.error, getSafeErrorMessage(error));
        },
      });
    } catch (validationError: any) {
      captureException(validationError, "Validation échouée pour prompt analyseur");
      errorToast(
        messages.labels.error,
        validationError.errors?.[0]?.message || "Données invalides"
      );
    }
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
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-3">
            <Textarea
              placeholder={messages.placeholders.analyzerPrompt}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              rows={8}
              className="font-mono text-sm min-h-[200px] sm:min-h-[280px]"
            />
            {promptContent && (
              <CharacterCounter length={promptContent.length} />
            )}
          </div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle>{messages.analyzer.results}</CardTitle>
                <CardDescription>{messages.analyzer.structuredPrompt}</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewAnalysis}
                  className="gap-2 w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  {messages.analyzer.newAnalysis}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePrompt}
                  disabled={isSaving}
                  className="gap-2 w-full sm:w-auto"
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
            {breakpoint === 'mobile' ? (
              <Accordion type="single" collapsible defaultValue="metadata" className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.metadata}
                  </AccordionTrigger>
                  <AccordionContent>
                    <MetadataView metadata={result.metadata} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="variables">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.variables} ({result.variables.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {result.variables.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{messages.analyzer.noVariables}</p>
                    ) : (
                      result.variables.map((v, i) => (
                        <Card key={i}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-mono break-all">
                              {`{{${v.name}}}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap text-sm">
                              <Badge variant="outline">{v.type}</Badge>
                              {v.default_value && (
                                <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]" title={v.default_value}>
                                  {v.default_value}
                                </code>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground break-words">{v.description}</p>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="template">
                  <AccordionTrigger className="text-base font-semibold">
                    Template structuré
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative w-full overflow-hidden">
                      <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto max-w-full">
                        <code className="block">{result.prompt_template}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full gap-2"
                        onClick={copyTemplate}
                      >
                        <Copy className="h-3 w-3" />
                        Copier le template
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="export">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.export}
                  </AccordionTrigger>
                  <AccordionContent>
                    <MobileExportActions
                      jsonData={result.exports.json}
                      markdownData={result.exports.markdown}
                      filename="prompt-structure"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : breakpoint === 'tablet' ? (
              <Accordion type="single" collapsible defaultValue="metadata" className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.metadata}
                  </AccordionTrigger>
                  <AccordionContent>
                    <MetadataView metadata={result.metadata} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="variables">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.variables} ({result.variables.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {result.variables.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{messages.analyzer.noVariables}</p>
                    ) : (
                      result.variables.map((v, i) => (
                        <Card key={i}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-mono break-all">
                              {`{{${v.name}}}`}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap text-sm">
                              <Badge variant="outline">{v.type}</Badge>
                              {v.default_value && (
                                <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]" title={v.default_value}>
                                  {v.default_value}
                                </code>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground break-words">{v.description}</p>
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
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="template">
                  <AccordionTrigger className="text-base font-semibold">
                    Template structuré
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative w-full">
                      <pre className="p-4 bg-muted rounded-lg text-sm max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words">
                        <code className="block">{result.prompt_template}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full gap-2"
                        onClick={copyTemplate}
                      >
                        <Copy className="h-3 w-3" />
                        Copier le template
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="export">
                  <AccordionTrigger className="text-base font-semibold">
                    {messages.analyzer.tabs.export}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ExportActions
                      jsonData={result.exports.json}
                      markdownData={result.exports.markdown}
                      filename="prompt-structure"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Tabs defaultValue="metadata">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="metadata">{messages.analyzer.tabs.metadata}</TabsTrigger>
                  <TabsTrigger value="variables">
                    {messages.analyzer.tabs.variables} ({result.variables.length})
                  </TabsTrigger>
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
                          <CardTitle className="text-base font-mono break-all">
                            {`{{${v.name}}}`}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap text-sm">
                            <Badge variant="outline">{v.type}</Badge>
                            {v.default_value && (
                              <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]" title={v.default_value}>
                                {v.default_value}
                              </code>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground break-words">{v.description}</p>
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
                  <div className="relative w-full">
                    <pre className="p-4 pt-12 bg-muted rounded-lg text-sm max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words">
                      <code className="block">{result.prompt_template}</code>
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
