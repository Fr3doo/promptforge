import { createContext, useContext, useMemo, type ReactNode } from "react";
import { SupabasePromptFavoriteService, type PromptFavoriteService } from "@/services/PromptFavoriteService";
import { usePromptMutationRepository } from "./PromptMutationRepositoryContext";

const PromptFavoriteServiceContext = createContext<PromptFavoriteService | null>(null);

interface PromptFavoriteServiceProviderProps {
  children: ReactNode;
  service?: PromptFavoriteService;
}

export function PromptFavoriteServiceProvider({ 
  children, 
  service 
}: PromptFavoriteServiceProviderProps) {
  const mutationRepository = usePromptMutationRepository();
  const defaultService = useMemo(
    () => service || new SupabasePromptFavoriteService(mutationRepository),
    [service, mutationRepository]
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
