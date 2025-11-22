import type { ReactNode } from "react";
import type { AuthRepository } from "@/repositories/AuthRepository";
import type { PromptRepository } from "@/repositories/PromptRepository";
import type { VariableRepository } from "@/repositories/VariableRepository";
import type { AnalysisRepository } from "@/repositories/AnalysisRepository";
import type { PromptShareRepository } from "@/repositories/PromptShareRepository";
import type { ProfileRepository } from "@/repositories/ProfileRepository";
import type { PromptFavoriteService } from "@/services/PromptFavoriteService";
import type { PromptVisibilityService } from "@/services/PromptVisibilityService";
import type { PromptDuplicationService } from "@/services/PromptDuplicationService";

/**
 * Props pour le composant AppProviders
 * 
 * Permet l'injection de dépendances pour les tests
 * Toutes les props sont optionnelles sauf children
 */
export interface AppProvidersProps {
  /** Contenu enfant à wrapper avec tous les providers */
  children: ReactNode;
  
  /** Repository d'authentification (optionnel pour tests) */
  authRepository?: AuthRepository;
  
  /** Repository principal des prompts (optionnel pour tests) */
  repository?: PromptRepository;
  
  /** Repository des variables (optionnel pour tests) */
  variableRepository?: VariableRepository;
  
  /** Repository d'analyse (optionnel pour tests) */
  analysisRepository?: AnalysisRepository;
  
  /** Repository de partage (optionnel pour tests) */
  shareRepository?: PromptShareRepository;
  
  /** Repository des profils (optionnel pour tests) */
  profileRepository?: ProfileRepository;
  
  /** Service de gestion des favoris (optionnel pour tests) */
  favoriteService?: PromptFavoriteService;
  
  /** Service de gestion de la visibilité (optionnel pour tests) */
  visibilityService?: PromptVisibilityService;
  
  /** Service de duplication (optionnel pour tests) */
  duplicationService?: PromptDuplicationService;
}
