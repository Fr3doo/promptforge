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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Éditeur de prompt</h2>
          <Button onClick={onDetectVariables} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Détecter variables
          </Button>
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
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Variables ({variables.length})</h2>
        <VariableConfigPanel
          variables={variables}
          onVariableUpdate={onVariableUpdate}
          onVariableDelete={onVariableDelete}
        />
      </div>
    </>
  );
};
