import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptQueryRepositoryContext = createContext<PromptQueryRepository | null>(null);

interface PromptQueryRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptQueryRepository;
}

/**
 * Provider pour l'interface de lecture (Query) du PromptRepository
 * 
 * Principe ISP : Expose uniquement les 4 méthodes de lecture
 * - fetchAll, fetchOwned, fetchSharedWithMe, fetchById
 * 
 * Utilisé par : usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 * 
 * @example
 * ```tsx
 * <PromptQueryRepositoryProvider>
 *   <PromptList />
 * </PromptQueryRepositoryProvider>
 * ```
 */
export function PromptQueryRepositoryProvider({
  children,
  repository,
}: PromptQueryRepositoryProviderProps) {
  const promptRepository = usePromptRepository();
  
  // Par défaut, utilise le PromptRepository complet mais exposé via l'interface Query
  const defaultRepository = useMemo<PromptQueryRepository>(
    () => repository || promptRepository,
    [repository, promptRepository]
  );

  return (
    <PromptQueryRepositoryContext.Provider value={defaultRepository}>
      {children}
    </PromptQueryRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder à l'interface de lecture (Query)
 * 
 * Principe ISP : Le consommateur reçoit seulement les méthodes de lecture (4/7)
 * Réduction d'exposition : -43% des méthodes
 * 
 * @throws {Error} Si utilisé en dehors de PromptQueryRepositoryProvider
 * 
 * @example
 * ```tsx
 * const queryRepo = usePromptQueryRepository();
 * const prompts = await queryRepo.fetchAll(userId); // ✅ OK
 * await queryRepo.create(...); // ❌ Erreur TypeScript - méthode non exposée
 * ```
 */
export function usePromptQueryRepository(): PromptQueryRepository {
  const context = useContext(PromptQueryRepositoryContext);
  if (!context) {
    throw new Error(
      "usePromptQueryRepository must be used within PromptQueryRepositoryProvider"
    );
  }
  return context;
}
