import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";

/**
 * Valeur du contexte d'authentification
 * Contient l'état partagé pour toute l'application
 */
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Typage strict avec undefined pour forcer la vérification
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthContextProviderProps {
  children: ReactNode;
}

/**
 * Provider du contexte d'authentification centralisé
 * 
 * Responsabilités :
 * - Maintenir UN SEUL état d'authentification partagé pour toute l'app
 * - Gérer UN SEUL listener onAuthStateChange
 * - Garantir la synchronisation de tous les composants
 * 
 * @example
 * ```tsx
 * <AuthContextProvider>
 *   <App />
 * </AuthContextProvider>
 * ```
 */
export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const authRepository = useAuthRepository();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guard pour éviter les updates après unmount
    let isMounted = true;

    // UN SEUL listener pour toute l'application
    const subscription = authRepository.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // Récupérer la session initiale
    authRepository.getCurrentSession().then((initialSession) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, [authRepository]);

  const value: AuthContextValue = { user, session, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte d'authentification
 * @throws {Error} Si utilisé hors d'un AuthContextProvider
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }
  return context;
}
