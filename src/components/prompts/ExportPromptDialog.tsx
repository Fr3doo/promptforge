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
import { Copy, Download, Loader2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{exportMessages.title}</DialogTitle>
          <DialogDescription>
            {exportMessages.description(prompt.title)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col">
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
          <div className="space-y-2">
            <Label className="text-sm font-medium">{exportMessages.preview}</Label>
            <ScrollArea className="h-[300px] sm:h-[400px] lg:h-[450px] rounded-md border bg-muted/30">
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
