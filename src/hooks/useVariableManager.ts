import { useState, useEffect, useCallback } from "react";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { useVariableDetection } from "@/hooks/useVariableDetection";
import { messages } from "@/constants/messages";
import type { Variable } from "@/features/prompts/types";

interface UseVariableManagerOptions {
  content: string;
  initialVariables?: Variable[];
}

/**
 * Hook to manage variables in a prompt
 * Handles detection, creation, update, and deletion of variables
 * Automatically synchronizes variables with content changes
 */
export function useVariableManager({ content, initialVariables = [] }: UseVariableManagerOptions) {
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const { detectedNames } = useVariableDetection(content);
  const { notifySuccess, notifyInfo } = useToastNotifier();

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

  /**
   * Detects and adds new variables from content
   * Shows success notification with count of added variables
   */
  const addVariablesFromContent = useCallback(() => {
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
      notifySuccess(messages.success.variablesDetected(newVariables.length));
    } else {
      notifyInfo(messages.info.noNewVariables);
    }
  }, [detectedNames, variables, notifySuccess, notifyInfo]);

  /**
   * Updates a variable at a specific index
   */
  const updateVariable = useCallback((index: number, variable: Variable) => {
    const newVars = [...variables];
    newVars[index] = variable;
    setVariables(newVars);
  }, [variables]);

  /**
   * Deletes a variable at a specific index
   */
  const deleteVariable = useCallback((index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  }, [variables]);

  /**
   * Checks if there are undetected variables in content
   */
  const hasUndetectedVariables = useCallback(() => {
    return detectedNames.some(name => !variables.some(v => v.name === name));
  }, [detectedNames, variables]);

  return {
    variables,
    setVariables,
    detectedNames,
    addVariablesFromContent,
    updateVariable,
    deleteVariable,
    hasUndetectedVariables,
  };
}
