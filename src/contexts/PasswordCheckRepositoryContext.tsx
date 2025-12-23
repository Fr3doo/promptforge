import { createContext, useContext, useMemo, type ReactNode } from "react";
import { 
  PasswordCheckRepository, 
  EdgeFunctionPasswordCheckRepository 
} from "@/repositories/PasswordCheckRepository";

/**
 * Context pour le repository de vérification des mots de passe
 * 
 * Permet l'injection de dépendances pour les tests (pattern Repository)
 */
const PasswordCheckRepositoryContext = createContext<PasswordCheckRepository | null>(null);

interface PasswordCheckRepositoryProviderProps {
  children: ReactNode;
  /** Repository injectable pour les tests */
  repository?: PasswordCheckRepository;
}

/**
 * Provider du repository de vérification des mots de passe
 * 
 * Fournit une instance du repository à tous les composants enfants.
 * Par défaut, utilise EdgeFunctionPasswordCheckRepository.
 * 
 * @example
 * ```tsx
 * // Production
 * <PasswordCheckRepositoryProvider>
 *   <App />
 * </PasswordCheckRepositoryProvider>
 * 
 * // Tests avec mock
 * <PasswordCheckRepositoryProvider repository={mockRepo}>
 *   <SignUp />
 * </PasswordCheckRepositoryProvider>
 * ```
 */
export function PasswordCheckRepositoryProvider({ 
  children, 
  repository 
}: PasswordCheckRepositoryProviderProps) {
  // Mémoisation pour éviter les re-créations inutiles
  const value = useMemo(
    () => repository ?? new EdgeFunctionPasswordCheckRepository(),
    [repository]
  );

  return (
    <PasswordCheckRepositoryContext.Provider value={value}>
      {children}
    </PasswordCheckRepositoryContext.Provider>
  );
}

/**
 * Hook pour accéder au repository de vérification des mots de passe
 * 
 * @throws Error si utilisé hors du provider
 * @returns Instance du PasswordCheckRepository
 */
export function usePasswordCheckRepository(): PasswordCheckRepository {
  const context = useContext(PasswordCheckRepositoryContext);
  
  if (!context) {
    throw new Error(
      "usePasswordCheckRepository must be used within a PasswordCheckRepositoryProvider"
    );
  }
  
  return context;
}
