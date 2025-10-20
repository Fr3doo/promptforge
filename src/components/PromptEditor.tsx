import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VariableInputPanel } from "@/features/variables/components/VariableInputPanel";
import { Wand2, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PromptEditorProps {
  content: string;
  onChange: (content: string) => void;
  onDetectVariables: () => void;
  variables: any[];
  variableValues: Record<string, string>;
  onVariableValueChange: (name: string, value: string) => void;
}

export const PromptEditor = ({
  content,
  onChange,
  onDetectVariables,
  variables,
  variableValues,
  onVariableValueChange,
}: PromptEditorProps) => {
  const [preview, setPreview] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Render preview with variable values
    let rendered = content;
    variables.forEach((variable) => {
      const value = variableValues[variable.name] || variable.default_value || `{{${variable.name}}}`;
      const regex = new RegExp(`{{${variable.name}}}`, "g");
      rendered = rendered.replace(regex, value);
    });
    setPreview(rendered);
  }, [content, variables, variableValues]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    toast({ title: "✅ Copié dans le presse-papiers !" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Split Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt-content-editor" className="text-sm font-medium text-muted-foreground">
              Éditeur
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={onDetectVariables}
              className="gap-2"
              aria-label="Détecter les variables dans le prompt"
            >
              <Wand2 className="h-4 w-4" />
              Détecter variables
            </Button>
          </div>
          <Textarea
            id="prompt-content-editor"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Écrivez votre prompt ici... Utilisez {{variable}} pour les variables."
            className="flex-1 font-mono text-sm min-h-[400px] bg-editor-bg border-border resize-none"
            aria-label="Contenu du prompt"
          />
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground" id="preview-label">Aperçu</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
              aria-label="Copier l'aperçu du prompt"
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copié !" : "Copier"}
            </Button>
          </div>
          <Card 
            className="flex-1 p-4 bg-preview-bg border-border min-h-[400px] overflow-auto"
            role="region"
            aria-labelledby="preview-label"
          >
            <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
              {preview || "L'aperçu s'affichera ici..."}
            </pre>
          </Card>
        </div>
      </div>

      {/* Variable Inputs */}
      {variables.length > 0 && (
        <section className="space-y-4" aria-labelledby="variables-heading">
          <h3 id="variables-heading" className="text-sm font-medium text-muted-foreground">
            Valeurs des variables
          </h3>
          <VariableInputPanel
            variables={variables}
            values={variableValues}
            onValueChange={onVariableValueChange}
          />
        </section>
      )}
    </div>
  );
};
