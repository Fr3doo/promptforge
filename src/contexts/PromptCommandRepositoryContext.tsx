import { createContext, useContext, ReactNode } from "react";
import type { PromptCommandRepository } from "@/repositories/PromptRepository.interfaces";
import { usePromptRepository } from "./PromptRepositoryContext";

const PromptCommandRepositoryContext = createContext<PromptCommandRepository | null>(null);

interface PromptCommandRepositoryProviderProps {
  children: ReactNode;
}

export function PromptCommandRepositoryProvider({ 
  children 
}: PromptCommandRepositoryProviderProps) {
  // Réutilise l'instance existante de SupabasePromptRepository
  // SupabasePromptRepository implémente PromptRepository qui extends PromptCommandRepository
  const repository = usePromptRepository();
  
  return (
    <PromptCommandRepositoryContext.Provider value={repository}>
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
