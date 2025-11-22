import { createContext, useContext, ReactNode } from "react";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptQueryRepositoryContext = createContext<PromptQueryRepository | null>(null);

interface PromptQueryRepositoryProviderProps {
  children: ReactNode;
}

export function PromptQueryRepositoryProvider({ 
  children 
}: PromptQueryRepositoryProviderProps) {
  // Réutilise l'instance existante de SupabasePromptRepository
  // SupabasePromptRepository implémente PromptRepository qui extends PromptQueryRepository
  const repository = usePromptRepository();
  
  return (
    <PromptQueryRepositoryContext.Provider value={repository}>
      {children}
    </PromptQueryRepositoryContext.Provider>
  );
}

export function usePromptQueryRepository(): PromptQueryRepository {
  const context = useContext(PromptQueryRepositoryContext);
  if (!context) {
    throw new Error("usePromptQueryRepository must be used within PromptQueryRepositoryProvider");
  }
  return context;
}
