import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  SupabasePromptVisibilityService,
  type PromptVisibilityService,
} from "@/services/PromptVisibilityService";
import { usePromptQueryRepository } from "./PromptQueryRepositoryContext";
import { usePromptMutationRepository } from "./PromptMutationRepositoryContext";

const PromptVisibilityServiceContext = createContext<PromptVisibilityService | null>(null);

interface PromptVisibilityServiceProviderProps {
  children: ReactNode;
  service?: PromptVisibilityService;
}

/**
 * Provider pour le service de gestion de visibilité des prompts
 * 
 * @example
 * ```tsx
 * <PromptVisibilityServiceProvider>
 *   <App />
 * </PromptVisibilityServiceProvider>
 * ```
 */
/**
 * Provider pour le service de gestion de visibilité des prompts
 * 
 * Principe ISP : Injecte Query + Mutation (5 méthodes) au lieu de Repository complet (7)
 * 
 * @example
 * ```tsx
 * <PromptVisibilityServiceProvider>
 *   <VisibilityBadge />
 * </PromptVisibilityServiceProvider>
 * ```
 */
export function PromptVisibilityServiceProvider({
  children,
  service,
}: PromptVisibilityServiceProviderProps) {
  const promptQueryRepository = usePromptQueryRepository();
  const promptMutationRepository = usePromptMutationRepository();
  
  const defaultService = useMemo(
    () => service || new SupabasePromptVisibilityService(
      promptQueryRepository,
      promptMutationRepository
    ),
    [service, promptQueryRepository, promptMutationRepository]
  );

  return (
    <PromptVisibilityServiceContext.Provider value={defaultService}>
      {children}
    </PromptVisibilityServiceContext.Provider>
  );
}

/**
 * Hook pour accéder au service de visibilité des prompts
 * 
 * @throws {Error} Si utilisé en dehors de PromptVisibilityServiceProvider
 * 
 * @example
 * ```tsx
 * const visibilityService = usePromptVisibilityService();
 * await visibilityService.toggleVisibility("prompt-id", "PRIVATE");
 * ```
 */
export function usePromptVisibilityService(): PromptVisibilityService {
  const context = useContext(PromptVisibilityServiceContext);
  if (!context) {
    throw new Error(
      "usePromptVisibilityService must be used within PromptVisibilityServiceProvider"
    );
  }
  return context;
}
