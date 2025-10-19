import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { Variable } from "@/features/prompts/types";

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
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-mono text-primary">
            {variable.name}
            {variable.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <span className="text-xs text-muted-foreground">{variable.type}</span>
        </div>
        <Input
          value={value || variable.default_value || ""}
          onChange={(e) => onChange(variable.name, e.target.value)}
          placeholder={variable.default_value || `Entrez ${variable.name}...`}
          required={variable.required}
        />
        {variable.help && (
          <p className="text-xs text-muted-foreground">{variable.help}</p>
        )}
      </div>
    </Card>
  );
};
