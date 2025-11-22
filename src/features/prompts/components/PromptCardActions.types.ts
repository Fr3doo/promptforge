import type { Prompt } from "../types";

/**
 * Props pour le composant PromptCardActions
 * Regroupe tous les callbacks nécessaires pour les actions sur une carte de prompt
 */
export interface PromptCardActionsProps {
  /** Données du prompt */
  prompt: Prompt;
  
  /** Indique si l'utilisateur courant est le propriétaire du prompt */
  isOwner: boolean;
  
  /** Callback pour basculer l'état favori */
  onToggleFavorite: (id: string, currentState: boolean) => void;
  
  /** Callback pour supprimer le prompt */
  onDelete: (id: string) => void;
  
  /** Callback pour dupliquer le prompt */
  onDuplicate: (id: string) => void;
  
  /** Callback pour basculer la visibilité */
  onToggleVisibility: (
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    permission?: "READ" | "WRITE"
  ) => Promise<void>;
  
  /** Callback pour éditer le prompt */
  onEdit: (id: string) => void;
  
  /** Callback pour gérer le partage privé (ouvre SharePromptDialog) */
  onManageSharing?: () => void;
}
