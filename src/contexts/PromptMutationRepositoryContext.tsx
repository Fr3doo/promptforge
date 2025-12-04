import { createContext, useContext, ReactNode, useMemo } from "react";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
import { SupabasePromptCommandRepository } from "@/repositories/PromptCommandRepository";

const PromptMutationRepositoryContext = createContext<PromptMutationRepository | null>(null);

interface PromptMutationRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptMutationRepository;
}

export function PromptMutationRepositoryProvider({ 
  children,
  repository
}: PromptMutationRepositoryProviderProps) {
  // Utilise le repository injecté ou crée une instance spécialisée
  // SupabasePromptCommandRepository implémente PromptMutationRepository
  const mutationRepository = useMemo(
    () => repository ?? new SupabasePromptCommandRepository(),
    [repository]
  );
  
  return (
    <PromptMutationRepositoryContext.Provider value={mutationRepository}>
      {children}
    </PromptMutationRepositoryContext.Provider>
  );
}

export function usePromptMutationRepository(): PromptMutationRepository {
  const context = useContext(PromptMutationRepositoryContext);
  if (!context) {
    throw new Error("usePromptMutationRepository must be used within PromptMutationRepositoryProvider");
  }
  return context;
}
