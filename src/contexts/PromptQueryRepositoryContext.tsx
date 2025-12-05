import { createContext, useContext, ReactNode, useMemo } from "react";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";
import { SupabasePromptQueryRepository } from "@/repositories/PromptQueryRepository";

const PromptQueryRepositoryContext = createContext<PromptQueryRepository | null>(null);

interface PromptQueryRepositoryProviderProps {
  children: ReactNode;
  repository?: PromptQueryRepository;
}

export function PromptQueryRepositoryProvider({ 
  children,
  repository
}: PromptQueryRepositoryProviderProps) {
  const queryRepository = useMemo(
    () => repository ?? new SupabasePromptQueryRepository(),
    [repository]
  );
  
  return (
    <PromptQueryRepositoryContext.Provider value={queryRepository}>
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
