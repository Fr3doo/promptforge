import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
              <SelectItem value="STRING">Texte</SelectItem>
              <SelectItem value="NUMBER">Nombre</SelectItem>
              <SelectItem value="BOOLEAN">Boolean</SelectItem>
              <SelectItem value="ENUM">Enum</SelectItem>
              <SelectItem value="DATE">Date</SelectItem>
              <SelectItem value="MULTISTRING">Multi-texte</SelectItem>
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

        {/* Default Value */}
        <div className="space-y-2">
          <Label htmlFor={`default-${index}`} className="text-xs text-muted-foreground">
            Valeur par défaut
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

        {/* Help Text */}
        <div className="space-y-2">
          <Label htmlFor={`help-${index}`} className="text-xs text-muted-foreground">
            Texte d'aide
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
