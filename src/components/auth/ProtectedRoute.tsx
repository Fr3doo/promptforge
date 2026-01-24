import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wrapper de protection des routes authentifiées.
 * 
 * - Affiche un spinner pendant la vérification auth
 * - Redirige vers /auth?redirectTo=... si non authentifié
 * - Rend les enfants si authentifié
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = location.pathname + location.search;
      navigate(`/auth?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [loading, user, navigate, location]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
