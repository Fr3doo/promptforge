export interface PromptListActionsProps {
  // Callbacks requis
  onPromptClick: (promptId: string) => void;
  onToggleFavorite: (id: string, currentState: boolean) => void;
  
  // Callbacks optionnels (actions de gestion)
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleVisibility?: (
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    permission: "READ" | "WRITE"
  ) => Promise<void>;
  
  // Métadonnées
  currentUserId?: string;
}
