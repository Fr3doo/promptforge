import { createContext, useContext, ReactNode } from "react";
import { AnalysisRepository, createAnalysisRepository } from "@/repositories/AnalysisRepository";

/**
 * Context for injecting the AnalysisRepository
 * Follows SOLID DIP by providing abstraction via context
 */
const AnalysisRepositoryContext = createContext<AnalysisRepository | null>(null);

interface AnalysisRepositoryProviderProps {
  children: ReactNode;
  repository?: AnalysisRepository;
}

/**
 * Provider component for AnalysisRepository
 * Allows dependency injection for testing and flexibility
 */
export const AnalysisRepositoryProvider = ({
  children,
  repository = createAnalysisRepository(),
}: AnalysisRepositoryProviderProps) => {
  return (
    <AnalysisRepositoryContext.Provider value={repository}>
      {children}
    </AnalysisRepositoryContext.Provider>
  );
};

/**
 * Hook to access the AnalysisRepository from context
 * @throws Error if used outside of AnalysisRepositoryProvider
 */
export const useAnalysisRepository = (): AnalysisRepository => {
  const repository = useContext(AnalysisRepositoryContext);
  
  if (!repository) {
    throw new Error(
      "useAnalysisRepository must be used within an AnalysisRepositoryProvider"
    );
  }
  
  return repository;
};
