import type { Tables } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";

export type Prompt = Tables<"prompts"> & { share_count?: number };
export type Variable = Tables<"variables">;

export interface PromptFormData {
  title: string;
  description: string | null;
  content: string;
  visibility: "PRIVATE" | "SHARED";
  tags: string[];
}

export interface PromptEditorState extends PromptFormData {
  variables: Variable[];
  variableValues: Record<string, string>;
}

export interface DashboardSectionProps {
  icon: LucideIcon;
  title: string;
  prompts: Prompt[];
  currentUserId?: string;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  onToggleVisibility: (
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    permission?: "READ" | "WRITE"
  ) => Promise<void>;
  onPromptClick: (id: string) => void;
}
