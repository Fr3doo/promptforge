import type { ReactNode } from "react";
import { useLowQuotaNotification } from "@/hooks/useLowQuotaNotification";

/**
 * Wrapper qui invoque useLowQuotaNotification pour afficher
 * des avertissements proactifs quand les quotas d'analyse sont bas.
 * 
 * IMPORTANT: Doit être placé APRÈS AnalysisQuotaRepositoryProvider
 * dans l'arbre des providers car useLowQuotaNotification dépend de
 * useAnalysisQuotaRepository via Context.
 */
export function LowQuotaNotificationWrapper({ children }: { children: ReactNode }) {
  useLowQuotaNotification();
  return <>{children}</>;
}
