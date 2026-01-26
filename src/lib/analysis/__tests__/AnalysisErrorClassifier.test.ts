import { describe, it, expect } from "vitest";
import { classifyAnalysisError } from "../AnalysisErrorClassifier";
import {
  AnalysisTimeoutError,
  RateLimitError,
} from "@/repositories/AnalysisRepository";

describe("AnalysisErrorClassifier", () => {
  describe("classifyAnalysisError", () => {
    // ============================================
    // Timeout errors
    // ============================================
    describe("AnalysisTimeoutError", () => {
      it("devrait retourner type TIMEOUT pour AnalysisTimeoutError", () => {
        const error = new AnalysisTimeoutError("L'analyse a expiré");
        const result = classifyAnalysisError(error);

        expect(result).toEqual({
          type: "TIMEOUT",
        });
      });
    });

    // ============================================
    // Rate limit errors
    // ============================================
    describe("RateLimitError", () => {
      it("devrait retourner type RATE_LIMIT avec retryAfter et reason minute", () => {
        const error = new RateLimitError("Trop de requêtes", 45, "minute");
        const result = classifyAnalysisError(error);

        expect(result).toEqual({
          type: "RATE_LIMIT",
          retryAfter: 45,
          reason: "minute",
        });
      });

      it("devrait retourner type RATE_LIMIT avec reason daily", () => {
        const error = new RateLimitError(
          "Limite journalière atteinte",
          3600,
          "daily"
        );
        const result = classifyAnalysisError(error);

        expect(result).toEqual({
          type: "RATE_LIMIT",
          retryAfter: 3600,
          reason: "daily",
        });
      });

      it("devrait gérer RateLimitError sans retryAfter explicite", () => {
        const error = new RateLimitError("Limite atteinte", 60, "minute");
        const result = classifyAnalysisError(error);

        expect(result.type).toBe("RATE_LIMIT");
        expect(result.retryAfter).toBe(60);
      });
    });

    // ============================================
    // Generic errors
    // ============================================
    describe("Generic errors", () => {
      it("devrait retourner type GENERIC pour une Error standard", () => {
        const error = new Error("Erreur inattendue");
        const result = classifyAnalysisError(error);

        expect(result).toEqual({
          type: "GENERIC",
          message: "Erreur inattendue",
        });
      });

      it("devrait retourner type GENERIC pour une chaîne de caractères", () => {
        const error = "Une erreur texte";
        const result = classifyAnalysisError(error);

        expect(result).toEqual({
          type: "GENERIC",
          message: "Une erreur texte",
        });
      });

      it("devrait retourner type GENERIC pour un objet non-Error", () => {
        const error = { code: 500, msg: "Server error" };
        const result = classifyAnalysisError(error);

        expect(result.type).toBe("GENERIC");
        expect(result.message).toContain("object");
      });

      it("devrait retourner type GENERIC pour null", () => {
        const result = classifyAnalysisError(null);

        expect(result).toEqual({
          type: "GENERIC",
          message: "null",
        });
      });

      it("devrait retourner type GENERIC pour undefined", () => {
        const result = classifyAnalysisError(undefined);

        expect(result).toEqual({
          type: "GENERIC",
          message: "undefined",
        });
      });
    });

    // ============================================
    // Edge cases
    // ============================================
    describe("Edge cases", () => {
      it("devrait gérer une Error avec message vide", () => {
        const error = new Error("");
        const result = classifyAnalysisError(error);

        expect(result.type).toBe("GENERIC");
        expect(result.message).toBe("");
      });

      it("devrait préserver le message original d'une Error", () => {
        const longMessage =
          "Erreur très détaillée avec beaucoup d'informations contextuelles";
        const error = new Error(longMessage);
        const result = classifyAnalysisError(error);

        expect(result.message).toBe(longMessage);
      });
    });
  });
});
