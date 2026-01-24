import { type ReactNode } from "react";
import { useSessionRecovery } from "@/hooks/useSessionRecovery";

/**
 * Wrapper qui active le système de récupération de session
 * 
 * Ce composant doit être placé dans l'arbre des providers,
 * après AuthContextProvider pour avoir accès à useAuth()
 * 
 * @example
 * ```tsx
 * <AuthContextProvider>
 *   <SessionRecoveryWrapper>
 *     <App />
 *   </SessionRecoveryWrapper>
 * </AuthContextProvider>
 * ```
 */
export function SessionRecoveryWrapper({ children }: { children: ReactNode }) {
  // Active le hook de récupération de session
  useSessionRecovery();
  
  return <>{children}</>;
}
