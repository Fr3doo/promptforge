import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook pour accéder à l'état d'authentification
 * 
 * Version simplifiée qui consomme le contexte centralisé
 * au lieu de créer son propre état local.
 * 
 * @returns {AuthContextValue} État d'authentification partagé
 * @throws {Error} Si utilisé hors d'un AuthContextProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, session, loading } = useAuth();
 *   
 *   if (loading) return <div>Chargement...</div>;
 *   if (!user) return <div>Non connecté</div>;
 *   
 *   return <div>Bonjour {user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
