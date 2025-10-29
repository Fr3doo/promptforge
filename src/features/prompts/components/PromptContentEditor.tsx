import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptEditor } from "@/components/PromptEditor";
import { VariableConfigPanel } from "@/features/variables/components/VariableConfigPanel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Edit3 } from "lucide-react";
import type { Variable } from "../types";
import { messages } from "@/constants/messages";

interface PromptContentEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  variables: Variable[];
  variableValues: Record<string, string>;
  onVariableValuesChange: (values: Record<string, string>) => void;
  onDetectVariables: () => void;
  onVariableUpdate: (index: number, variable: Variable) => void;
  onVariableDelete: (index: number) => void;
  disabled?: boolean;
  errors?: {
    content?: string;
  };
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
  disabled = false,
  errors = {},
}: PromptContentEditorProps) => {
  const [isVariablesOpen, setIsVariablesOpen] = useState(false);

  return (
    <>
      {/* Editor Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{messages.editor.promptContent}</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Sheet open={isVariablesOpen} onOpenChange={setIsVariablesOpen} modal={false}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 w-full sm:w-auto justify-center" disabled={disabled}>
                    <Edit3 className="h-4 w-4" />
                    {messages.editor.variablesButton(variables.length)}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[46rem] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{messages.editor.variableConfig}</SheetTitle>
                    <SheetDescription>
                      {messages.placeholders.defaultConfigDescription}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <VariableConfigPanel
                      variables={variables}
                      onVariableUpdate={onVariableUpdate}
                      onVariableDelete={onVariableDelete}
                      onDetectVariables={onDetectVariables}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {messages.editor.variableConfigInstructions}
          </p>
          {errors.content && (
            <p className="text-sm text-destructive" role="alert">
              {errors.content}
            </p>
          )}
        </div>
        <div className={errors.content ? "ring-2 ring-destructive rounded-md" : ""}>
          <PromptEditor
            content={content}
            onChange={onContentChange}
            onDetectVariables={onDetectVariables}
            variables={variables}
            variableValues={variableValues}
            onVariableValueChange={(name, value) => 
              onVariableValuesChange({ ...variableValues, [name]: value })
            }
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
};
