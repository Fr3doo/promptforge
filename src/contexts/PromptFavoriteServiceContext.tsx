import { createContext, useContext, type ReactNode } from "react";
import { SupabasePromptFavoriteService, type PromptFavoriteService } from "@/services/PromptFavoriteService";

const PromptFavoriteServiceContext = createContext<PromptFavoriteService | null>(null);

interface PromptFavoriteServiceProviderProps {
  children: ReactNode;
  service?: PromptFavoriteService;
}

export function PromptFavoriteServiceProvider({ 
  children, 
  service = new SupabasePromptFavoriteService() 
}: PromptFavoriteServiceProviderProps) {
  return (
    <PromptFavoriteServiceContext.Provider value={service}>
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
