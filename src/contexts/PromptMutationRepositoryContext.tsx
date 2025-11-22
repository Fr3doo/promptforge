import { createContext, useContext, ReactNode } from "react";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptMutationRepositoryContext = createContext<PromptMutationRepository | null>(null);

interface PromptMutationRepositoryProviderProps {
  children: ReactNode;
}

export function PromptMutationRepositoryProvider({ 
  children 
}: PromptMutationRepositoryProviderProps) {
  // Réutilise l'instance existante de SupabasePromptRepository
  // SupabasePromptRepository implémente PromptRepository qui extends PromptMutationRepository
  const repository = usePromptRepository();
  
  return (
    <PromptMutationRepositoryContext.Provider value={repository}>
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
