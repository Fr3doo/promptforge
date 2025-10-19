import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Variable {
  id?: string;
  name: string;
  type: string;
  required: boolean;
  default_value?: string;
  help?: string;
}

interface VariableManagerProps {
  variables: Variable[];
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
  onVariableUpdate?: (index: number, variable: Variable) => void;
  onVariableDelete?: (index: number) => void;
  editable?: boolean;
}

export const VariableManager = ({
  variables,
  values,
  onValuesChange,
  onVariableUpdate,
  onVariableDelete,
  editable = false,
}: VariableManagerProps) => {
  const handleValueChange = (name: string, value: string) => {
    onValuesChange({ ...values, [name]: value });
  };

  if (variables.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <p className="text-muted-foreground">
          Aucune variable détectée. Utilisez le bouton "Détecter variables" ou ajoutez des variables manuellement avec la syntaxe <code className="font-mono bg-muted px-1 rounded">{"{{nom}}"}</code>
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {variables.map((variable, index) => (
        <Card key={variable.id || index} className="p-4">
          <div className="space-y-4">
            {editable && (
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <Input
                  value={variable.name}
                  onChange={(e) =>
                    onVariableUpdate?.(index, { ...variable, name: e.target.value })
                  }
                  placeholder="Nom de la variable"
                  className="flex-1 font-mono"
                />
                <Select
                  value={variable.type}
                  onValueChange={(value) =>
                    onVariableUpdate?.(index, { ...variable, type: value })
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
                  onClick={() => onVariableDelete?.(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {!editable && (
              <div className="flex items-center justify-between mb-2">
                <Label className="font-mono text-primary">
                  {variable.name}
                  {variable.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <span className="text-xs text-muted-foreground">{variable.type}</span>
              </div>
            )}

            <div className="space-y-2">
              <Input
                value={values[variable.name] || variable.default_value || ""}
                onChange={(e) => handleValueChange(variable.name, e.target.value)}
                placeholder={variable.default_value || `Entrez ${variable.name}...`}
                required={variable.required}
              />
              {variable.help && (
                <p className="text-xs text-muted-foreground">{variable.help}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
