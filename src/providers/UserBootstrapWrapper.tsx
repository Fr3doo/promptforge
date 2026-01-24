import type { ReactNode } from "react";
import { useNewUserBootstrap } from "@/hooks/useNewUserBootstrap";

/**
 * Wrapper qui invoque le hook useNewUserBootstrap pour initialiser
 * les données des nouveaux utilisateurs (création de templates d'exemple).
 * 
 * Doit être placé après AuthContextProvider dans l'arbre des providers
 * pour que useAuth() soit disponible.
 * 
 * Note: useLowQuotaNotification est invoqué dans LowQuotaNotificationWrapper
 * qui doit être placé APRÈS AnalysisQuotaRepositoryProvider.
 */
export function UserBootstrapWrapper({ children }: { children: ReactNode }) {
  useNewUserBootstrap();
  return <>{children}</>;
}
