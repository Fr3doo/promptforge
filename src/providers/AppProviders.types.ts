import type { ReactNode } from "react";
import type { AuthRepository } from "@/repositories/AuthRepository";
import type { PromptQueryRepository, PromptCommandRepository, PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";
import type { AnalysisRepository } from "@/repositories/AnalysisRepository";
import type { PromptShareRepository } from "@/repositories/PromptShareRepository";
import type { ProfileRepository } from "@/repositories/ProfileRepository";
import type { PromptUsageRepository } from "@/repositories/PromptUsageRepository.interfaces";
import type { PromptFavoriteService } from "@/services/PromptFavoriteService";
import type { PromptVisibilityService } from "@/services/PromptVisibilityService";
import type { PromptDuplicationService } from "@/services/PromptDuplicationService";
import type { PasswordCheckRepository } from "@/repositories/PasswordCheckRepository";

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
  
  /** Repository de requêtes prompts - lecture seule (optionnel pour tests) */
  queryRepository?: PromptQueryRepository;
  
  /** Repository de commandes prompts - écriture seule (optionnel pour tests) */
  commandRepository?: PromptCommandRepository;
  
  /** Repository de mutations prompts - update seul (optionnel pour tests) */
  mutationRepository?: PromptMutationRepository;
  
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
  
  /** Repository des statistiques d'utilisation (optionnel pour tests) */
  usageRepository?: PromptUsageRepository;
  
  /** Repository de vérification des mots de passe compromis (optionnel pour tests) */
  passwordCheckRepository?: PasswordCheckRepository;
}
