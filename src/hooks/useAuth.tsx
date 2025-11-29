import { useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook d'authentification - utilise le contexte centralisé AuthContext
 * 
 * @returns {Object} État d'authentification avec user, session et loading
 * @throws {Error} Si utilisé hors d'un AuthContextProvider
 */
export function useAuth() {
  return useAuthContext();
}
