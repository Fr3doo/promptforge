import type { Visibility, Permission } from "@/constants/domain-types";

export interface PromptListActionsProps {
  // Callbacks requis
  onPromptClick: (promptId: string) => void;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  
  // Callbacks optionnels (actions de gestion)
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (
    id: string,
    currentVisibility: Visibility,
    permission: Permission
  ) => Promise<void>;
  
  // Métadonnées
  currentUserId?: string;
}
