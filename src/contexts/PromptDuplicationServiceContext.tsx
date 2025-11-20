import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  SupabasePromptDuplicationService,
  type PromptDuplicationService,
} from "@/services/PromptDuplicationService";
import { usePromptRepository } from "./PromptRepositoryContext";

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
export function PromptDuplicationServiceProvider({
  children,
  service,
}: PromptDuplicationServiceProviderProps) {
  const promptRepository = usePromptRepository();
  const defaultService = useMemo(
    () => service || new SupabasePromptDuplicationService(promptRepository),
    [service, promptRepository]
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
