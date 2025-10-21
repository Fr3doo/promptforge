import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useVariableDetection } from "@/hooks/useVariableDetection";
import type { Variable } from "@/features/prompts/types";

interface UseVariableManagerOptions {
  content: string;
  initialVariables?: Variable[];
}

export function useVariableManager({ content, initialVariables = [] }: UseVariableManagerOptions) {
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const { detectedNames } = useVariableDetection(content);

  // Initialize with existing variables
  useEffect(() => {
    if (initialVariables.length > 0 && variables.length === 0) {
      setVariables(initialVariables);
    }
  }, [initialVariables]);

  // Synchronize variables with detected names in content
  useEffect(() => {
    // Remove variables that are no longer in content
    const validVariables = variables.filter(v => detectedNames.includes(v.name));
    
    if (validVariables.length !== variables.length) {
      setVariables(validVariables);
    }
  }, [detectedNames]);

  const addVariablesFromContent = () => {
    const newVariables = detectedNames
      .filter(name => !variables.some(v => v.name === name))
      .map((name, index) => ({
        name,
        type: "STRING" as const,
        required: false,
        order_index: variables.length + index,
        default_value: "",
        help: "",
        pattern: "",
        options: [],
      } as Partial<Variable>));

    if (newVariables.length > 0) {
      setVariables([...variables, ...newVariables] as Variable[]);
      toast({ title: `✨ ${newVariables.length} variable(s) détectée(s)` });
    } else {
      toast({ title: "ℹ️ Aucune nouvelle variable détectée" });
    }
  };

  const updateVariable = (index: number, variable: Variable) => {
    const newVars = [...variables];
    newVars[index] = variable;
    setVariables(newVars);
  };

  const deleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  return {
    variables,
    addVariablesFromContent,
    updateVariable,
    deleteVariable,
  };
}
