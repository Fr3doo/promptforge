import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { PromptCommandRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptCommandRepositoryContext = createContext<PromptCommandRepository | null>(null);

interface PromptCommandRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptCommandRepository;
}

/**
 * Provider pour l'interface d'écriture (Command) du PromptRepository
 * 
 * Principe ISP : Expose uniquement les 3 méthodes d'écriture
 * - create, update, delete
 * 
 * Utilisé par : useCreatePrompt, useUpdatePrompt, useDeletePrompt
 * 
 * @example
 * ```tsx
 * <PromptCommandRepositoryProvider>
 *   <PromptEditor />
 * </PromptCommandRepositoryProvider>
 * ```
 */
export function PromptCommandRepositoryProvider({
  children,
  repository,
}: PromptCommandRepositoryProviderProps) {
  const promptRepository = usePromptRepository();
  
  // Par défaut, utilise le PromptRepository complet mais exposé via l'interface Command
  const defaultRepository = useMemo<PromptCommandRepository>(
    () => repository || promptRepository,
    [repository, promptRepository]
  );

  return (
    <PromptCommandRepositoryContext.Provider value={defaultRepository}>
      {children}
    </PromptCommandRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder à l'interface d'écriture (Command)
 * 
 * Principe ISP : Le consommateur reçoit seulement les méthodes d'écriture (3/7)
 * Réduction d'exposition : -57% des méthodes
 * 
 * @throws {Error} Si utilisé en dehors de PromptCommandRepositoryProvider
 * 
 * @example
 * ```tsx
 * const commandRepo = usePromptCommandRepository();
 * const newPrompt = await commandRepo.create(userId, data); // ✅ OK
 * await commandRepo.fetchAll(userId); // ❌ Erreur TypeScript - méthode non exposée
 * ```
 */
export function usePromptCommandRepository(): PromptCommandRepository {
  const context = useContext(PromptCommandRepositoryContext);
  if (!context) {
    throw new Error(
      "usePromptCommandRepository must be used within PromptCommandRepositoryProvider"
    );
  }
  return context;
}
