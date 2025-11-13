import { VariableConfigItem } from "./VariableConfigItem";
import { VariableEmptyState } from "./VariableEmptyState";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { messages } from "@/constants/messages";
import type { Variable } from "@/features/prompts/types";

interface VariableConfigPanelProps {
  variables: Variable[];
  onVariableUpdate: (index: number, variable: Variable) => void;
  onVariableDelete: (index: number) => void;
  onDetectVariables: () => void;
}

export const VariableConfigPanel = ({
  variables,
  onVariableUpdate,
  onVariableDelete,
  onDetectVariables,
}: VariableConfigPanelProps) => {
  return (
    <div className="space-y-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onDetectVariables} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {messages.editor.detectVariablesAuto}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{messages.tooltips.variables.detectAuto}</p>
        </TooltipContent>
      </Tooltip>
      
      {variables.length === 0 ? (
        <VariableEmptyState message={messages.variables.emptyStateWithButton} />
      ) : (
        variables.map((variable, index) => (
          <VariableConfigItem
            key={variable.id || index}
            variable={variable}
            index={index}
            onUpdate={onVariableUpdate}
            onDelete={onVariableDelete}
          />
        ))
      )}
    </div>
  );
};
