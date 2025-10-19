import { VariableConfigItem } from "./VariableConfigItem";
import { VariableEmptyState } from "./VariableEmptyState";
import type { Variable } from "@/features/prompts/types";

interface VariableConfigPanelProps {
  variables: Variable[];
  onVariableUpdate: (index: number, variable: Variable) => void;
  onVariableDelete: (index: number) => void;
}

export const VariableConfigPanel = ({
  variables,
  onVariableUpdate,
  onVariableDelete,
}: VariableConfigPanelProps) => {
  if (variables.length === 0) {
    return <VariableEmptyState />;
  }

  return (
    <div className="space-y-4">
      {variables.map((variable, index) => (
        <VariableConfigItem
          key={variable.id || index}
          variable={variable}
          index={index}
          onUpdate={onVariableUpdate}
          onDelete={onVariableDelete}
        />
      ))}
    </div>
  );
};
