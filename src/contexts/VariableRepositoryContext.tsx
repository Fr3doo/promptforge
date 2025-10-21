import { createContext, useContext, ReactNode } from "react";
import { VariableRepository, SupabaseVariableRepository } from "@/repositories/VariableRepository";

const VariableRepositoryContext = createContext<VariableRepository | null>(null);

export function VariableRepositoryProvider({ children }: { children: ReactNode }) {
  const repository = new SupabaseVariableRepository();
  
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
