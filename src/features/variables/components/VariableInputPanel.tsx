import { VariableInputItem } from "./VariableInputItem";
import { VariableEmptyState } from "./VariableEmptyState";
import type { Variable } from "@/features/prompts/types";

interface VariableInputPanelProps {
  variables: Variable[];
  values: Record<string, string>;
  onValueChange: (name: string, value: string) => void;
}

export const VariableInputPanel = ({
  variables,
  values,
  onValueChange,
}: VariableInputPanelProps) => {
  if (variables.length === 0) {
    return <VariableEmptyState />;
  }

  return (
    <div className="space-y-4">
      {variables.map((variable) => (
        <VariableInputItem
          key={variable.id || variable.name}
          variable={variable}
          value={values[variable.name] || ""}
          onChange={onValueChange}
        />
      ))}
    </div>
  );
};
