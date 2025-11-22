import { createContext, useContext, type ReactNode } from "react";
import {
  AuthRepository,
  SupabaseAuthRepository,
} from "@/repositories/AuthRepository";

const AuthRepositoryContext = createContext<AuthRepository | null>(null);

export interface AuthRepositoryProviderProps {
  children: ReactNode;
  repository?: AuthRepository;
}

/**
 * Provider du repository d'authentification
 * Permet l'injection de dépendances pour les tests
 */
export function AuthRepositoryProvider({
  children,
  repository = new SupabaseAuthRepository(),
}: AuthRepositoryProviderProps) {
  return (
    <AuthRepositoryContext.Provider value={repository}>
      {children}
    </AuthRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder au repository d'authentification
 * @throws {Error} Si utilisé hors d'un AuthRepositoryProvider
 */
export function useAuthRepository(): AuthRepository {
  const context = useContext(AuthRepositoryContext);
  if (!context) {
    throw new Error(
      "useAuthRepository doit être utilisé dans un AuthRepositoryProvider"
    );
  }
  return context;
}
