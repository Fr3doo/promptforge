import { createContext, useContext, ReactNode } from "react";
import { VariableRepository, SupabaseVariableRepository } from "@/repositories/VariableRepository";

const VariableRepositoryContext = createContext<VariableRepository | null>(null);

interface VariableRepositoryProviderProps {
  children: ReactNode;
  repository?: VariableRepository;
}

export function VariableRepositoryProvider({ 
  children, 
  repository = new SupabaseVariableRepository() 
}: VariableRepositoryProviderProps) {
  return (
    <VariableRepositoryContext.Provider value={repository}>
      {children}
    </VariableRepositoryContext.Provider>
  );
}

export function useVariableRepository(): VariableRepository {
  const context = useContext(VariableRepositoryContext);
  if (!context) {
    throw new Error("useVariableRepository must be used within VariableRepositoryProvider");
  }
  return context;
}
