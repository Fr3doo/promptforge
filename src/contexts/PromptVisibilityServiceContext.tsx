import { createContext, useContext, type ReactNode } from "react";
import {
  SupabasePromptVisibilityService,
  type PromptVisibilityService,
} from "@/services/PromptVisibilityService";

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
export function PromptVisibilityServiceProvider({
  children,
  service = new SupabasePromptVisibilityService(),
}: PromptVisibilityServiceProviderProps) {
  return (
    <PromptVisibilityServiceContext.Provider value={service}>
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
