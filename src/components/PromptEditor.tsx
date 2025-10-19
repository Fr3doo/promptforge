import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Editor Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Éditeur</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={onDetectVariables}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Détecter variables
          </Button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Écrivez votre prompt ici... Utilisez {{variable}} pour les variables."
          className="flex-1 font-mono text-sm min-h-[400px] bg-editor-bg border-border resize-none"
        />
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Aperçu</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copié !" : "Copier"}
          </Button>
        </div>
        <Card className="flex-1 p-4 bg-preview-bg border-border min-h-[400px] overflow-auto">
          <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
            {preview || "L'aperçu s'affichera ici..."}
          </pre>
        </Card>
      </div>
    </div>
  );
};
