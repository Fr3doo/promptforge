import React, { createContext, useContext } from "react";
import type { PromptUsageRepository } from "@/repositories/PromptUsageRepository.interfaces";
import { SupabasePromptUsageRepository } from "@/repositories/PromptUsageRepository";

/**
 * Context pour le repository des statistiques d'utilisation
 */
const PromptUsageRepositoryContext = createContext<PromptUsageRepository | undefined>(undefined);

/**
 * Instance singleton du repository (créée une seule fois)
 */
const defaultRepository = new SupabasePromptUsageRepository();

/**
 * Props du provider (injection de dépendances pour les tests)
 */
interface PromptUsageRepositoryProviderProps {
  children: React.ReactNode;
  repository?: PromptUsageRepository;
}

/**
 * Provider pour le repository des statistiques d'utilisation
 * Permet l'injection de dépendances pour les tests
 */
export const PromptUsageRepositoryProvider: React.FC<PromptUsageRepositoryProviderProps> = ({
  children,
  repository = defaultRepository,
}) => {
  return (
    <PromptUsageRepositoryContext.Provider value={repository}>
      {children}
    </PromptUsageRepositoryContext.Provider>
  );
};

/**
 * Hook pour accéder au repository des statistiques d'utilisation
 * @throws Error si utilisé en dehors du PromptUsageRepositoryProvider
 */
export const usePromptUsageRepository = (): PromptUsageRepository => {
  const context = useContext(PromptUsageRepositoryContext);
  
  if (!context) {
    throw new Error(
      "usePromptUsageRepository doit être utilisé dans un PromptUsageRepositoryProvider"
    );
  }
  
  return context;
};
