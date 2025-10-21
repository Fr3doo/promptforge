import { createContext, useContext, ReactNode } from "react";
import { PromptRepository, SupabasePromptRepository } from "@/repositories/PromptRepository";

const PromptRepositoryContext = createContext<PromptRepository | null>(null);

export function PromptRepositoryProvider({ children }: { children: ReactNode }) {
  const repository = new SupabasePromptRepository();
  
  return (
    <PromptRepositoryContext.Provider value={repository}>
      {children}
    </PromptRepositoryContext.Provider>
  );
}

export function usePromptRepository(): PromptRepository {
  const context = useContext(PromptRepositoryContext);
  if (!context) {
    throw new Error("usePromptRepository must be used within PromptRepositoryProvider");
  }
  return context;
}
