import { createContext, useContext, type ReactNode } from "react";
import { SupabasePromptShareRepository, type PromptShareRepository } from "@/repositories/PromptShareRepository";

const PromptShareRepositoryContext = createContext<PromptShareRepository | null>(null);

interface PromptShareRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptShareRepository;
}

export function PromptShareRepositoryProvider({ 
  children, 
  repository = new SupabasePromptShareRepository() 
}: PromptShareRepositoryProviderProps) {
  return (
    <PromptShareRepositoryContext.Provider value={repository}>
      {children}
    </PromptShareRepositoryContext.Provider>
  );
}

export function usePromptShareRepository(): PromptShareRepository {
  const context = useContext(PromptShareRepositoryContext);
  if (!context) {
    throw new Error("usePromptShareRepository must be used within PromptShareRepositoryProvider");
  }
  return context;
}
