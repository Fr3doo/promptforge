import { createContext, useContext, ReactNode, useMemo } from "react";
import type { PromptCommandRepository } from "@/repositories/PromptRepository.interfaces";
import { SupabasePromptCommandRepository } from "@/repositories/PromptCommandRepository";

const PromptCommandRepositoryContext = createContext<PromptCommandRepository | null>(null);

interface PromptCommandRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptCommandRepository;
}

export function PromptCommandRepositoryProvider({ 
  children,
  repository 
}: PromptCommandRepositoryProviderProps) {
  // Utilise le repository injecté ou crée une instance spécialisée
  const commandRepository = useMemo(
    () => repository ?? new SupabasePromptCommandRepository(),
    [repository]
  );
  
  return (
    <PromptCommandRepositoryContext.Provider value={commandRepository}>
      {children}
    </PromptCommandRepositoryContext.Provider>
  );
}

export function usePromptCommandRepository(): PromptCommandRepository {
  const context = useContext(PromptCommandRepositoryContext);
  if (!context) {
    throw new Error("usePromptCommandRepository must be used within PromptCommandRepositoryProvider");
  }
  return context;
}
