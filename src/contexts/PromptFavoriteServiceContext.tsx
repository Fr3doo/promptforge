import { createContext, useContext, useMemo, type ReactNode } from "react";
import { SupabasePromptFavoriteService, type PromptFavoriteService } from "@/services/PromptFavoriteService";
import { usePromptMutationRepository } from "./PromptMutationRepositoryContext";

const PromptFavoriteServiceContext = createContext<PromptFavoriteService | null>(null);

interface PromptFavoriteServiceProviderProps {
  children: ReactNode;
  service?: PromptFavoriteService;
}

/**
 * Provider pour le service de gestion des favoris
 * 
 * Principe ISP : Injecte PromptMutationRepository (1 méthode) au lieu de 7
 * 
 * @example
 * ```tsx
 * <PromptFavoriteServiceProvider>
 *   <FavoriteButton />
 * </PromptFavoriteServiceProvider>
 * ```
 */
export function PromptFavoriteServiceProvider({ 
  children, 
  service 
}: PromptFavoriteServiceProviderProps) {
  const promptMutationRepository = usePromptMutationRepository();
  const defaultService = useMemo(
    () => service || new SupabasePromptFavoriteService(promptMutationRepository),
    [service, promptMutationRepository]
  );

  return (
    <PromptFavoriteServiceContext.Provider value={defaultService}>
      {children}
    </PromptFavoriteServiceContext.Provider>
  );
}

export function usePromptFavoriteService(): PromptFavoriteService {
  const context = useContext(PromptFavoriteServiceContext);
  if (!context) {
    throw new Error("usePromptFavoriteService must be used within PromptFavoriteServiceProvider");
  }
  return context;
}
