import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  SupabasePromptDuplicationService,
  type PromptDuplicationService,
} from "@/services/PromptDuplicationService";
import { usePromptQueryRepository } from "./PromptQueryRepositoryContext";
import { usePromptCommandRepository } from "./PromptCommandRepositoryContext";

const PromptDuplicationServiceContext = createContext<PromptDuplicationService | null>(null);

interface PromptDuplicationServiceProviderProps {
  children: ReactNode;
  service?: PromptDuplicationService;
}

/**
 * Provider pour le service de duplication de prompts
 * 
 * @example
 * ```tsx
 * <PromptDuplicationServiceProvider>
 *   <App />
 * </PromptDuplicationServiceProvider>
 * ```
 */
/**
 * Provider pour le service de duplication de prompts
 * 
 * Principe ISP : Injecte Query + Command (7 méthodes)
 * C'est le service le plus complexe, il compose 2 interfaces spécialisées
 * 
 * @example
 * ```tsx
 * <PromptDuplicationServiceProvider>
 *   <DuplicateButton />
 * </PromptDuplicationServiceProvider>
 * ```
 */
export function PromptDuplicationServiceProvider({
  children,
  service,
}: PromptDuplicationServiceProviderProps) {
  const promptQueryRepository = usePromptQueryRepository();
  const promptCommandRepository = usePromptCommandRepository();
  
  const defaultService = useMemo(
    () => service || new SupabasePromptDuplicationService(
      promptQueryRepository,
      promptCommandRepository
    ),
    [service, promptQueryRepository, promptCommandRepository]
  );

  return (
    <PromptDuplicationServiceContext.Provider value={defaultService}>
      {children}
    </PromptDuplicationServiceContext.Provider>
  );
}

/**
 * Hook pour accéder au service de duplication de prompts
 * 
 * @throws {Error} Si utilisé en dehors de PromptDuplicationServiceProvider
 * 
 * @example
 * ```tsx
 * const duplicationService = usePromptDuplicationService();
 * const duplicate = await duplicationService.duplicate(
 *   "user-id",
 *   "prompt-id",
 *   variableRepository
 * );
 * ```
 */
export function usePromptDuplicationService(): PromptDuplicationService {
  const context = useContext(PromptDuplicationServiceContext);
  if (!context) {
    throw new Error(
      "usePromptDuplicationService must be used within PromptDuplicationServiceProvider"
    );
  }
  return context;
}
