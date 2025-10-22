import { createContext, useContext, type ReactNode } from "react";
import { SupabasePromptShareRepository, type PromptShareRepository } from "@/repositories/PromptShareRepository";

const PromptShareRepositoryContext = createContext<PromptShareRepository | null>(null);

export function PromptShareRepositoryProvider({ children }: { children: ReactNode }) {
  const repository = new SupabasePromptShareRepository();

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
