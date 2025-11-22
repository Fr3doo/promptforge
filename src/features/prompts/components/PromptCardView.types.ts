import type { Prompt } from "../types";
import type { SharingState } from "./VisibilityBadge";

/**
 * Props pour le composant PromptCardView (UI pure)
 * Ce composant se concentre uniquement sur l'affichage, sans logique métier
 */
export interface PromptCardViewProps {
  /** Données du prompt à afficher */
  prompt: Prompt;
  
  /** Indique si le prompt est en mode brouillon */
  isDraft: boolean;
  
  /** Indique si l'utilisateur courant est le propriétaire du prompt */
  isOwner: boolean;
  
  /** Nombre de partages privés du prompt */
  shareCount: number;
  
  /** État de partage calculé (PRIVATE, PRIVATE_SHARED, PUBLIC) */
  sharingState: SharingState;
  
  /** Handler appelé lors du clic sur la card */
  onClick: () => void;
  
  /** Index pour l'animation staggered (optionnel) */
  index?: number;
  
  /** Slot pour les actions (boutons favoris, menu, etc.) */
  actions?: React.ReactNode;
}
