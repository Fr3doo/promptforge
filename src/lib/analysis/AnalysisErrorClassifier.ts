import {
  AnalysisTimeoutError,
  RateLimitError,
} from "@/repositories/AnalysisRepository";

/**
 * Types d'erreurs classifiées pour l'analyse de prompts
 */
export type AnalysisErrorType = "TIMEOUT" | "RATE_LIMIT" | "GENERIC";

/**
 * Résultat de la classification d'une erreur d'analyse
 */
export interface ClassifiedAnalysisError {
  /** Type de l'erreur classifiée */
  type: AnalysisErrorType;
  /** Délai avant nouvelle tentative (pour RATE_LIMIT) */
  retryAfter?: number;
  /** Raison du rate limit (minute ou daily) */
  reason?: "minute" | "daily";
  /** Message d'erreur pour les erreurs génériques */
  message?: string;
}

/**
 * Classifie une erreur d'analyse en type strict.
 *
 * Fonction **pure** pour testabilité maximale.
 * Extrait la logique de classification depuis usePromptAnalysis.
 *
 * @param error - L'erreur brute à classifier
 * @returns Erreur classifiée avec métadonnées selon le type
 *
 * @example
 * ```typescript
 * const classified = classifyAnalysisError(error);
 * switch (classified.type) {
 *   case "TIMEOUT":
 *     showTimeoutMessage();
 *     break;
 *   case "RATE_LIMIT":
 *     showRateLimitMessage(classified.retryAfter, classified.reason);
 *     break;
 *   case "GENERIC":
 *     showErrorMessage(classified.message);
 *     break;
 * }
 * ```
 */
export function classifyAnalysisError(error: unknown): ClassifiedAnalysisError {
  // Timeout error - analyse trop longue
  if (error instanceof AnalysisTimeoutError) {
    return { type: "TIMEOUT" };
  }

  // Rate limit error - quotas dépassés
  if (error instanceof RateLimitError) {
    return {
      type: "RATE_LIMIT",
      retryAfter: error.retryAfter,
      reason: error.reason,
    };
  }

  // Generic error - tout autre cas
  return {
    type: "GENERIC",
    message: error instanceof Error ? error.message : String(error),
  };
}
