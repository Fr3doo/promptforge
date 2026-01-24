/**
 * @file AnalysisHistoryRepositoryContext.tsx
 * @description React Context for injecting AnalysisHistoryRepository (DIP compliance)
 * 
 * Pattern: Dependency Injection via React Context
 * - Production: Uses default Supabase implementation
 * - Testing: Allows injection of mock repositories
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AnalysisHistoryRepository } from "@/repositories/AnalysisHistoryRepository.interfaces";
import { createAnalysisHistoryRepository } from "@/repositories/AnalysisHistoryRepository";

const AnalysisHistoryRepositoryContext = createContext<AnalysisHistoryRepository | null>(null);

export interface AnalysisHistoryRepositoryProviderProps {
  children: ReactNode;
  /**
   * Optional repository instance for dependency injection (testing)
   * If not provided, a default Supabase implementation is created
   */
  repository?: AnalysisHistoryRepository;
}

/**
 * Provider component for AnalysisHistoryRepository
 * 
 * @example
 * // Production usage (automatic default)
 * <AnalysisHistoryRepositoryProvider>
 *   <App />
 * </AnalysisHistoryRepositoryProvider>
 * 
 * @example
 * // Testing with mock
 * <AnalysisHistoryRepositoryProvider repository={mockRepository}>
 *   <ComponentUnderTest />
 * </AnalysisHistoryRepositoryProvider>
 */
export function AnalysisHistoryRepositoryProvider({
  children,
  repository,
}: AnalysisHistoryRepositoryProviderProps) {
  const repositoryInstance = useMemo(
    () => repository ?? createAnalysisHistoryRepository(),
    [repository]
  );

  return (
    <AnalysisHistoryRepositoryContext.Provider value={repositoryInstance}>
      {children}
    </AnalysisHistoryRepositoryContext.Provider>
  );
}

/**
 * Hook to access the AnalysisHistoryRepository from context
 * 
 * @throws {Error} If used outside of AnalysisHistoryRepositoryProvider
 * @returns The AnalysisHistoryRepository instance
 * 
 * @example
 * const repository = useAnalysisHistoryRepository();
 * const stats = await repository.fetchDailyStats(7);
 */
export function useAnalysisHistoryRepository(): AnalysisHistoryRepository {
  const context = useContext(AnalysisHistoryRepositoryContext);
  
  if (!context) {
    throw new Error(
      "useAnalysisHistoryRepository must be used within AnalysisHistoryRepositoryProvider"
    );
  }
  
  return context;
}
