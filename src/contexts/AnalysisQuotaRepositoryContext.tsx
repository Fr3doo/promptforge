import { createContext, useContext, ReactNode, useMemo } from "react";
import type { AnalysisQuotaRepository } from "@/repositories/AnalysisQuotaRepository.interfaces";
import { createAnalysisQuotaRepository } from "@/repositories/AnalysisQuotaRepository";

/**
 * Context pour l'injection du AnalysisQuotaRepository
 * Suit le principe DIP de SOLID en fournissant une abstraction via context
 */
const AnalysisQuotaRepositoryContext = createContext<AnalysisQuotaRepository | null>(null);

interface AnalysisQuotaRepositoryProviderProps {
  children: ReactNode;
  /** Repository optionnel pour injection de dépendances (tests) */
  repository?: AnalysisQuotaRepository;
}

/**
 * Provider pour le AnalysisQuotaRepository
 * 
 * Permet l'injection de dépendances pour les tests tout en
 * fournissant une instance par défaut en production
 * 
 * @example
 * ```tsx
 * // Production
 * <AnalysisQuotaRepositoryProvider>
 *   <App />
 * </AnalysisQuotaRepositoryProvider>
 * 
 * // Tests avec mock
 * <AnalysisQuotaRepositoryProvider repository={mockRepository}>
 *   <ComponentToTest />
 * </AnalysisQuotaRepositoryProvider>
 * ```
 */
export const AnalysisQuotaRepositoryProvider = ({
  children,
  repository,
}: AnalysisQuotaRepositoryProviderProps) => {
  // Mémoïser le repository pour éviter les re-créations
  const value = useMemo(
    () => repository ?? createAnalysisQuotaRepository(),
    [repository]
  );

  return (
    <AnalysisQuotaRepositoryContext.Provider value={value}>
      {children}
    </AnalysisQuotaRepositoryContext.Provider>
  );
};

/**
 * Hook pour accéder au AnalysisQuotaRepository depuis le context
 * 
 * @throws {Error} Si utilisé en dehors du AnalysisQuotaRepositoryProvider
 * @returns Instance du AnalysisQuotaRepository
 */
export const useAnalysisQuotaRepository = (): AnalysisQuotaRepository => {
  const repository = useContext(AnalysisQuotaRepositoryContext);

  if (!repository) {
    throw new Error(
      "useAnalysisQuotaRepository doit être utilisé dans un AnalysisQuotaRepositoryProvider"
    );
  }

  return repository;
};
