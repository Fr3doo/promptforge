import { type ReactNode } from "react";
import { useNewUserBootstrap } from "@/hooks/useNewUserBootstrap";

interface UserBootstrapWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper qui initialise les données pour les nouveaux utilisateurs
 * 
 * Ce composant doit être placé dans l'arbre après AuthContextProvider
 * pour avoir accès à l'état d'authentification.
 * 
 * Il délègue la logique au hook useNewUserBootstrap pour garder
 * une séparation claire des responsabilités.
 * 
 * @example
 * ```tsx
 * <AuthContextProvider>
 *   <UserBootstrapWrapper>
 *     <App />
 *   </UserBootstrapWrapper>
 * </AuthContextProvider>
 * ```
 */
export function UserBootstrapWrapper({ children }: UserBootstrapWrapperProps) {
  useNewUserBootstrap();
  return <>{children}</>;
}
