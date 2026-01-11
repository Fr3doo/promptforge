import type { Tables } from "@/integrations/supabase/types";
import type { LucideIcon } from "lucide-react";
import type { 
  Prompt as PromptType, 
  SharePermission, 
  PromptWithSharePermission 
} from "@/repositories/PromptRepository.interfaces";
import type { Visibility, Permission } from "@/constants/domain-types";

// Réexporter depuis la source unique
export type { SharePermission, PromptWithSharePermission, Visibility, Permission };
export type Prompt = PromptType;

export type Variable = Tables<"variables">;

export interface PromptFormData {
  title: string;
  description: string | null;
  content: string;
  visibility: Visibility;
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
    currentVisibility: Visibility,
    permission?: Permission
  ) => Promise<void>;
  onPromptClick: (id: string) => void;
}
