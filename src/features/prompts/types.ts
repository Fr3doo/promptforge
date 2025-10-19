import type { Tables } from "@/integrations/supabase/types";

export type Prompt = Tables<"prompts">;
export type Variable = Tables<"variables">;

export interface PromptFormData {
  title: string;
  description: string;
  content: string;
  visibility: "PRIVATE" | "SHARED";
  tags: string[];
}

export interface PromptEditorState extends PromptFormData {
  variables: Variable[];
  variableValues: Record<string, string>;
}
