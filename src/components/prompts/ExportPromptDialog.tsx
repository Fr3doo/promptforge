/**
 * Dialog d'export de prompt
 * Permet de sélectionner le format, les options et prévisualiser l'export
 */

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { messages } from "@/constants/messages";
import { usePromptExport } from "@/hooks/usePromptExport";
import type { Tables } from "@/integrations/supabase/types";
import type { ExportFormat } from "@/lib/promptExport";

type Prompt = Tables<"prompts">;
type Variable = Tables<"variables">;
type Version = Tables<"versions">;

export interface ExportPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt;
  variables: Variable[];
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: "json", label: "JSON", description: "Intégration API" },
  { value: "markdown", label: "Markdown", description: "Documentation" },
  { value: "toon", label: "TOON", description: "Optimisé LLM" },
];

export function ExportPromptDialog({
  open,
  onOpenChange,
  prompt,
  variables,
}: ExportPromptDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [includeVersions, setIncludeVersions] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    exportPrompt,
    generatePreview,
    loadVersions,
    isExporting,
    isLoadingVersions,
  } = usePromptExport({ prompt, variables });

  const exportMessages = messages.prompts.export;

  // Charger les versions quand l'option est activée
  useEffect(() => {
    if (includeVersions && versions.length === 0 && open) {
      loadVersions().then(setVersions);
    }
  }, [includeVersions, versions.length, open, loadVersions]);

  // Reset state quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      setFormat("json");
      setIncludeVersions(false);
      setVersions([]);
      setIsFullscreen(false);
    }
  }, [open]);

  // Générer l'aperçu
  const preview = useMemo(() => {
    return generatePreview(format, includeVersions, versions);
  }, [format, includeVersions, versions, generatePreview]);

  const handleCopy = async () => {
    await exportPrompt({ format, action: "copy", includeVersions });
  };

  const handleDownload = async () => {
    await exportPrompt({ format, action: "download", includeVersions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "flex flex-col transition-all duration-200",
          isFullscreen 
            ? "w-screen h-screen max-w-none max-h-none rounded-none" 
            : "sm:max-w-[900px] lg:max-w-[1100px] max-h-[98vh]"
        )}
      >
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <DialogTitle>{exportMessages.title}</DialogTitle>
            <DialogDescription>
              {exportMessages.description(prompt.title)}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="shrink-0"
            aria-label={isFullscreen ? "Réduire" : "Agrandir"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </DialogHeader>

        <div className={cn(
          "space-y-6 flex flex-col",
          isFullscreen ? "flex-1 min-h-0" : ""
        )}>
          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{exportMessages.format}</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="flex flex-wrap gap-4"
            >
              {FORMAT_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`format-${option.value}`} />
                  <Label
                    htmlFor={`format-${option.value}`}
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="include-versions"
              checked={includeVersions}
              onCheckedChange={(checked) => setIncludeVersions(checked === true)}
            />
            <Label
              htmlFor="include-versions"
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              {exportMessages.options.includeVersions}
              {isLoadingVersions && <Loader2 className="h-3 w-3 animate-spin" />}
            </Label>
          </div>

          {/* Preview */}
          <div className={cn(
            "space-y-2 flex flex-col",
            isFullscreen ? "flex-1 min-h-0" : ""
          )}>
            <Label className="text-sm font-medium">{exportMessages.preview}</Label>
            <ScrollArea 
              className={cn(
                "rounded-md border bg-muted/30",
                isFullscreen 
                  ? "flex-1" 
                  : "h-[300px] sm:h-[400px] lg:h-[450px]"
              )}
            >
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                {preview}
              </pre>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {exportMessages.actions.copy}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exportMessages.actions.download}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
