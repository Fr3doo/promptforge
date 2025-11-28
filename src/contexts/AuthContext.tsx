import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";

// Typage strict avec undefined pour forcer la vérification
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const authRepository = useAuthRepository();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const subscription = authRepository.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

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

// Hook interne - ne pas exporter publiquement pour l'instant
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }
  return context;
}

// Export pour les tests uniquement
export { AuthContext };
