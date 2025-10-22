import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { Variable } from "@/features/prompts/types";
import { messages } from "@/constants/messages";

interface VariableInputItemProps {
  variable: Variable;
  value: string;
  onChange: (name: string, value: string) => void;
}

export const VariableInputItem = ({
  variable,
  value,
  onChange,
}: VariableInputItemProps) => {
  const inputId = `variable-input-${variable.name}`;
  const helpId = variable.help ? `${inputId}-help` : undefined;

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor={inputId} className="font-mono text-primary">
            {variable.name}
            {variable.required && <span className="text-destructive ml-1" aria-label="requis">*</span>}
          </Label>
          <span className="text-xs text-muted-foreground" aria-label="Type de variable">{variable.type}</span>
        </div>
        <Input
          id={inputId}
          value={value || variable.default_value || ""}
          onChange={(e) => onChange(variable.name, e.target.value)}
          placeholder={variable.default_value || messages.placeholders.variableInput(variable.name)}
          required={variable.required}
          aria-required={variable.required}
          aria-describedby={helpId}
          aria-invalid={variable.required && !value && !variable.default_value}
        />
        {variable.help && (
          <p id={helpId} className="text-xs text-muted-foreground">{variable.help}</p>
        )}
      </div>
    </Card>
  );
};
