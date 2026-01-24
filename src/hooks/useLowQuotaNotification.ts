/**
 * @file useLowQuotaNotification.ts
 * @description Hook for proactive low quota warnings (SRP compliance)
 * 
 * Displays a warning toast when quotas fall below threshold.
 * Uses ref to ensure notification appears only once per session.
 */

import { useEffect, useRef } from "react";
import { useAnalysisQuota } from "@/hooks/useAnalysisQuota";
import { warningToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";

/** Threshold for showing low quota warning */
const LOW_QUOTA_THRESHOLD = 5;

/**
 * Hook that monitors analysis quotas and shows a warning when low
 * 
 * Should be called once at app level (e.g., in a wrapper component)
 * to avoid duplicate notifications.
 * 
 * @example
 * function LowQuotaNotificationWrapper({ children }) {
 *   useLowQuotaNotification();
 *   return <>{children}</>;
 * }
 */
export function useLowQuotaNotification(): void {
  // Get quota data - this will return undefined if repository is not available
  const quotaQuery = useAnalysisQuota();
  const quota = quotaQuery?.data;
  
  const hasShownRef = useRef(false);
  const previousDailyRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip if no quota data or already shown
    if (!quota || hasShownRef.current) return;

    // Only trigger when crossing the threshold (not on every render below it)
    const isLow = quota.dailyRemaining <= LOW_QUOTA_THRESHOLD && quota.dailyRemaining > 0;
    const wasAboveThreshold = previousDailyRef.current === null || 
      previousDailyRef.current > LOW_QUOTA_THRESHOLD;

    if (isLow && wasAboveThreshold) {
      warningToast(
        messages.quota.notification.lowTitle,
        messages.quota.notification.lowDescription(quota.dailyRemaining)
      );
      hasShownRef.current = true;
    }

    previousDailyRef.current = quota.dailyRemaining;
  }, [quota?.dailyRemaining]);

  // Reset when quotas are restored (new day)
  useEffect(() => {
    if (quota && quota.dailyRemaining > LOW_QUOTA_THRESHOLD) {
      hasShownRef.current = false;
    }
  }, [quota?.dailyRemaining]);
}
