import { useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Variable = Tables<"variables">;

export function useVariableDetection(content: string) {
  const detectedNames = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
    
    return Array.from(matches);
  }, [content]);

  return { detectedNames };
}

export function useVariableSubstitution(
  content: string,
  variables: Variable[],
  values: Record<string, string>
) {
  const preview = useMemo(() => {
    let result = content;
    
    variables.forEach((variable) => {
      const value = values[variable.name] || variable.default_value || `{{${variable.name}}}`;
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
      result = result.replace(regex, value);
    });
    
    return result;
  }, [content, variables, values]);

  return { preview };
}
