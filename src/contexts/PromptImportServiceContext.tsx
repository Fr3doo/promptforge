import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  SupabasePromptImportService,
  type PromptImportService,
} from "@/services/PromptImportService";

const PromptImportServiceContext = createContext<PromptImportService | null>(null);

interface PromptImportServiceProviderProps {
  children: ReactNode;
  service?: PromptImportService;
}

/**
 * Provider pour le service d'import de prompts
 * 
 * @example
 * ```tsx
 * <PromptImportServiceProvider>
 *   <App />
 * </PromptImportServiceProvider>
 * ```
 */
export function PromptImportServiceProvider({
  children,
  service,
}: PromptImportServiceProviderProps) {
  const defaultService = useMemo(
    () => service || new SupabasePromptImportService(),
    [service]
  );

  return (
    <PromptImportServiceContext.Provider value={defaultService}>
      {children}
    </PromptImportServiceContext.Provider>
  );
}

/**
 * Hook pour accéder au service d'import de prompts
 * 
 * @throws {Error} Si utilisé en dehors de PromptImportServiceProvider
 * 
 * @example
 * ```tsx
 * const importService = usePromptImportService();
 * const imported = await importService.import(
 *   "user-id",
 *   parseResult,
 *   commandRepository,
 *   variableRepository
 * );
 * ```
 */
export function usePromptImportService(): PromptImportService {
  const context = useContext(PromptImportServiceContext);
  if (!context) {
    throw new Error(
      "usePromptImportService must be used within PromptImportServiceProvider"
    );
  }
  return context;
}
