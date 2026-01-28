import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  VersionDeletionService,
  DefaultVersionDeletionService,
} from "@/services/VersionDeletionService";
import { useVersionRepository } from "@/contexts/VersionRepositoryContext";
import { usePromptMutationRepository } from "@/contexts/PromptMutationRepositoryContext";

const VersionDeletionServiceContext = createContext<VersionDeletionService | null>(null);

export interface VersionDeletionServiceProviderProps {
  children: ReactNode;
  /** Service injecté pour les tests (optionnel) */
  service?: VersionDeletionService;
}

/**
 * Provider du service de suppression de versions
 * 
 * Crée automatiquement une instance de DefaultVersionDeletionService
 * en utilisant le VersionRepository du contexte parent.
 * 
 * Permet l'injection de dépendances pour les tests via la prop service.
 * 
 * @remarks
 * Doit être placé APRÈS VersionRepositoryProvider dans l'arbre de providers
 */
export function VersionDeletionServiceProvider({
  children,
  service,
}: VersionDeletionServiceProviderProps) {
  const versionRepository = useVersionRepository();
  const promptMutationRepository = usePromptMutationRepository();

  // Mémoïser le service pour éviter les re-créations inutiles
  const deletionService = useMemo(() => {
    if (service) return service;
    return new DefaultVersionDeletionService(versionRepository, promptMutationRepository);
  }, [service, versionRepository, promptMutationRepository]);

  return (
    <VersionDeletionServiceContext.Provider value={deletionService}>
      {children}
    </VersionDeletionServiceContext.Provider>
  );
}

/**
 * Hook pour accéder au service de suppression de versions
 * @throws {Error} Si utilisé hors d'un VersionDeletionServiceProvider
 */
export function useVersionDeletionService(): VersionDeletionService {
  const context = useContext(VersionDeletionServiceContext);
  if (!context) {
    throw new Error(
      "useVersionDeletionService doit être utilisé dans un VersionDeletionServiceProvider"
    );
  }
  return context;
}
