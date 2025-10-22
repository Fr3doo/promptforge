import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, GripVertical } from "lucide-react";
import type { Variable } from "@/features/prompts/types";
import { messages } from "@/constants/messages";

interface VariableConfigItemProps {
  variable: Variable;
  index: number;
  onUpdate: (index: number, variable: Variable) => void;
  onDelete: (index: number) => void;
}

export const VariableConfigItem = ({
  variable,
  index,
  onUpdate,
  onDelete,
}: VariableConfigItemProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Name and Type Row */}
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <Input
            value={variable.name}
            onChange={(e) =>
              onUpdate(index, { ...variable, name: e.target.value })
            }
            placeholder={messages.placeholders.variableName}
            className="flex-1 font-mono"
          />
          <Select
            value={variable.type}
            onValueChange={(value) =>
              onUpdate(index, { ...variable, type: value as any })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRING">{messages.variables.typeLabels.STRING}</SelectItem>
              <SelectItem value="NUMBER">{messages.variables.typeLabels.NUMBER}</SelectItem>
              <SelectItem value="BOOLEAN">{messages.variables.typeLabels.BOOLEAN}</SelectItem>
              <SelectItem value="ENUM">{messages.variables.typeLabels.ENUM}</SelectItem>
              <SelectItem value="DATE">{messages.variables.typeLabels.DATE}</SelectItem>
              <SelectItem value="MULTISTRING">{messages.variables.typeLabels.MULTISTRING}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Required Switch */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`required-${index}`} className="text-xs text-muted-foreground">
            {messages.variables.requiredLabel}
          </Label>
          <Switch
            id={`required-${index}`}
            checked={variable.required || false}
            onCheckedChange={(checked) =>
              onUpdate(index, { ...variable, required: checked })
            }
          />
        </div>

        {/* Default Value */}
        <div className="space-y-2">
          <Label htmlFor={`default-${index}`} className="text-xs text-muted-foreground">
            {messages.variables.defaultValueLabel}
          </Label>
          <Input
            id={`default-${index}`}
            value={variable.default_value || ""}
            onChange={(e) =>
              onUpdate(index, { ...variable, default_value: e.target.value })
            }
            placeholder={messages.placeholders.variableDefaultValue}
          />
        </div>

        {/* Pattern */}
        <div className="space-y-2">
          <Label htmlFor={`pattern-${index}`} className="text-xs text-muted-foreground">
            {messages.variables.patternLabel}
          </Label>
          <Input
            id={`pattern-${index}`}
            value={variable.pattern || ""}
            onChange={(e) =>
              onUpdate(index, { ...variable, pattern: e.target.value })
            }
            placeholder={messages.placeholders.variablePattern}
            className="font-mono text-sm"
          />
        </div>

        {/* Help Text */}
        <div className="space-y-2">
          <Label htmlFor={`help-${index}`} className="text-xs text-muted-foreground">
            {messages.variables.helpTextLabel}
          </Label>
          <Input
            id={`help-${index}`}
            value={variable.help || ""}
            onChange={(e) =>
              onUpdate(index, { ...variable, help: e.target.value })
            }
            placeholder={messages.placeholders.variableHelp}
          />
        </div>
      </div>
    </Card>
  );
};
