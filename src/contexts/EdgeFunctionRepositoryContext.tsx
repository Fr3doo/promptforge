import { createContext, useContext, type ReactNode } from "react";
import {
  EdgeFunctionRepository,
  SupabaseEdgeFunctionRepository,
} from "@/repositories/EdgeFunctionRepository";

const EdgeFunctionRepositoryContext = createContext<EdgeFunctionRepository | null>(null);

export interface EdgeFunctionRepositoryProviderProps {
  children: ReactNode;
  repository?: EdgeFunctionRepository;
}

/**
 * Provider du repository des edge functions
 * Permet l'injection de dépendances pour les tests
 */
export function EdgeFunctionRepositoryProvider({
  children,
  repository = new SupabaseEdgeFunctionRepository(),
}: EdgeFunctionRepositoryProviderProps) {
  return (
    <EdgeFunctionRepositoryContext.Provider value={repository}>
      {children}
    </EdgeFunctionRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder au repository des edge functions
 * @throws {Error} Si utilisé hors d'un EdgeFunctionRepositoryProvider
 */
export function useEdgeFunctionRepository(): EdgeFunctionRepository {
  const context = useContext(EdgeFunctionRepositoryContext);
  if (!context) {
    throw new Error(
      "useEdgeFunctionRepository doit être utilisé dans un EdgeFunctionRepositoryProvider"
    );
  }
  return context;
}
