import { createContext, useContext, useMemo, type ReactNode } from "react";
import { SupabasePromptFavoriteService, type PromptFavoriteService } from "@/services/PromptFavoriteService";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptFavoriteServiceContext = createContext<PromptFavoriteService | null>(null);

interface PromptFavoriteServiceProviderProps {
  children: ReactNode;
  service?: PromptFavoriteService;
}

export function PromptFavoriteServiceProvider({ 
  children, 
  service 
}: PromptFavoriteServiceProviderProps) {
  const promptRepository = usePromptRepository();
  const defaultService = useMemo(
    () => service || new SupabasePromptFavoriteService(promptRepository),
    [service, promptRepository]
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
