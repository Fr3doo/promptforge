import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptMutationRepositoryContext = createContext<PromptMutationRepository | null>(null);

interface PromptMutationRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptMutationRepository;
}

/**
 * Provider pour l'interface de mutation légère du PromptRepository
 * 
 * Principe ISP : Expose UNIQUEMENT la méthode update (1/7 méthodes)
 * Réduction d'exposition maximale : -86%
 * 
 * Utilisé par : PromptFavoriteService, PromptVisibilityService
 * 
 * @example
 * ```tsx
 * <PromptMutationRepositoryProvider>
 *   <FavoriteButton />
 * </PromptMutationRepositoryProvider>
 * ```
 */
export function PromptMutationRepositoryProvider({
  children,
  repository,
}: PromptMutationRepositoryProviderProps) {
  const promptRepository = usePromptRepository();
  
  // Par défaut, utilise le PromptRepository complet mais exposé via l'interface Mutation
  const defaultRepository = useMemo<PromptMutationRepository>(
    () => repository || promptRepository,
    [repository, promptRepository]
  );

  return (
    <PromptMutationRepositoryContext.Provider value={defaultRepository}>
      {children}
    </PromptMutationRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder à l'interface de mutation légère
 * 
 * Principe ISP : Le consommateur reçoit SEULEMENT update (1/7 méthodes)
 * Réduction d'exposition maximale : -86%
 * 
 * @throws {Error} Si utilisé en dehors de PromptMutationRepositoryProvider
 * 
 * @example
 * ```tsx
 * const mutationRepo = usePromptMutationRepository();
 * await mutationRepo.update(id, { is_favorite: true }); // ✅ OK
 * await mutationRepo.create(...); // ❌ Erreur TypeScript - méthode non exposée
 * await mutationRepo.fetchAll(...); // ❌ Erreur TypeScript - méthode non exposée
 * ```
 */
export function usePromptMutationRepository(): PromptMutationRepository {
  const context = useContext(PromptMutationRepositoryContext);
  if (!context) {
    throw new Error(
      "usePromptMutationRepository must be used within PromptMutationRepositoryProvider"
    );
  }
  return context;
}
