import { Button } from "@/components/ui/button";
import { PromptEditor } from "@/components/PromptEditor";
import { VariableConfigPanel } from "@/features/variables/components/VariableConfigPanel";
import { Sparkles } from "lucide-react";
import type { Variable } from "../types";

interface PromptContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  variables: Variable[];
  variableValues: Record<string, string>;
  onVariableValuesChange: (values: Record<string, string>) => void;
  onDetectVariables: () => void;
  onVariableUpdate: (index: number, variable: Variable) => void;
  onVariableDelete: (index: number) => void;
}

export const PromptContentEditor = ({
  content,
  onContentChange,
  variables,
  variableValues,
  onVariableValuesChange,
  onDetectVariables,
  onVariableUpdate,
  onVariableDelete,
}: PromptContentEditorProps) => {
  return (
    <>
      {/* Editor Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Contenu du prompt</h2>
            <Button onClick={onDetectVariables} variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Détecter variables
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Écrivez le texte de votre prompt. Utilisez <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{'{{nom_variable}}'}</code> pour ajouter des variables réutilisables.
            <br />
            <span className="text-xs">Exemple : "Résume cet article sur {'{{sujet}}'} en {'{{nombre_mots}}'} mots"</span>
          </p>
        </div>
        <PromptEditor
          content={content}
          onChange={onContentChange}
          onDetectVariables={onDetectVariables}
          variables={variables}
          variableValues={variableValues}
          onVariableValueChange={(name, value) => 
            onVariableValuesChange({ ...variableValues, [name]: value })
          }
        />
      </div>

      {/* Variables Section */}
      {variables.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Configuration des variables ({variables.length})</h2>
            <p className="text-sm text-muted-foreground">
              Définissez les valeurs par défaut et les types de vos variables
            </p>
          </div>
          <VariableConfigPanel
            variables={variables}
            onVariableUpdate={onVariableUpdate}
            onVariableDelete={onVariableDelete}
          />
        </div>
      )}
    </>
  );
};
