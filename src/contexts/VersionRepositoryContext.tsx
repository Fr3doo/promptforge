import { createContext, useContext, type ReactNode } from "react";
import {
  VersionRepository,
  SupabaseVersionRepository,
} from "@/repositories/VersionRepository";

const VersionRepositoryContext = createContext<VersionRepository | null>(null);

export interface VersionRepositoryProviderProps {
  children: ReactNode;
  repository?: VersionRepository;
}

/**
 * Provider du repository de versions
 * Permet l'injection de dépendances pour les tests
 */
export function VersionRepositoryProvider({
  children,
  repository = new SupabaseVersionRepository(),
}: VersionRepositoryProviderProps) {
  return (
    <VersionRepositoryContext.Provider value={repository}>
      {children}
    </VersionRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder au repository de versions
 * @throws {Error} Si utilisé hors d'un VersionRepositoryProvider
 */
export function useVersionRepository(): VersionRepository {
  const context = useContext(VersionRepositoryContext);
  if (!context) {
    throw new Error(
      "useVersionRepository doit être utilisé dans un VersionRepositoryProvider"
    );
  }
  return context;
}
