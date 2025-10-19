import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptEditor } from "@/components/PromptEditor";
import { VariableConfigPanel } from "@/features/variables/components/VariableConfigPanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles, Edit3 } from "lucide-react";
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
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);

  return (
    <>
      {/* Editor Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Contenu du prompt</h2>
            <div className="flex items-center gap-2">
              <Button onClick={onDetectVariables} variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Détecter variables
              </Button>
              {variables.length > 0 && (
                <Sheet open={isVariablesOpen} onOpenChange={setIsVariablesOpen} modal={false}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Variables ({variables.length})
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[46rem] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Configuration des variables</SheetTitle>
                      <SheetDescription>
                        Définissez les valeurs par défaut et les types de vos variables détectées
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <VariableConfigPanel
                        variables={variables}
                        onVariableUpdate={onVariableUpdate}
                        onVariableDelete={onVariableDelete}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
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
    </>
  );
};
