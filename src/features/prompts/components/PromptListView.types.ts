import type { Prompt } from "../types";
import type { ReactNode } from "react";

export interface PromptListViewProps {
  // Données
  prompts: Prompt[];
  
  // États de chargement
  isLoading: boolean;
  isEmpty: boolean;
  
  // Composants de slot
  loadingComponent: ReactNode;
  emptyComponent: ReactNode;
  children: ReactNode; // Les PromptCard rendus
  
  // Styles optionnels
  className?: string;
}
