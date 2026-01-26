import { describe, it, expect } from "vitest";
import {
  assertSession,
  assertNotSelfShare,
  assertPromptOwner,
  assertShareExists,
  assertShareModifyAuthorization,
} from "../ShareAuthorizationChecker";
import type { PromptShare } from "@/repositories/PromptShareRepository";

describe("ShareAuthorizationChecker", () => {
  // ============================================
  // assertSession
  // ============================================
  describe("assertSession", () => {
    it("devrait passer si userId est défini", () => {
      expect(() => assertSession("user-123")).not.toThrow();
    });

    it("devrait lever SESSION_EXPIRED si userId est undefined", () => {
      expect(() => assertSession(undefined)).toThrow("SESSION_EXPIRED");
    });

    it("devrait lever SESSION_EXPIRED si userId est une chaîne vide", () => {
      expect(() => assertSession("")).toThrow("SESSION_EXPIRED");
    });
  });

  // ============================================
  // assertNotSelfShare
  // ============================================
  describe("assertNotSelfShare", () => {
    it("devrait passer si les IDs sont différents", () => {
      expect(() => assertNotSelfShare("user-456", "user-123")).not.toThrow();
    });

    it("devrait lever SELF_SHARE si les IDs sont identiques", () => {
      expect(() => assertNotSelfShare("user-123", "user-123")).toThrow(
        "SELF_SHARE"
      );
    });
  });

  // ============================================
  // assertPromptOwner
  // ============================================
  describe("assertPromptOwner", () => {
    it("devrait passer si isOwner est true", () => {
      expect(() => assertPromptOwner(true)).not.toThrow();
    });

    it("devrait lever NOT_PROMPT_OWNER si isOwner est false", () => {
      expect(() => assertPromptOwner(false)).toThrow("NOT_PROMPT_OWNER");
    });
  });

  // ============================================
  // assertShareExists
  // ============================================
  describe("assertShareExists", () => {
    const mockShare: PromptShare = {
      id: "share-123",
      prompt_id: "prompt-123",
      shared_by: "user-123",
      shared_with_user_id: "user-456",
      permission: "READ",
      created_at: "2024-01-01T00:00:00Z",
    };

    it("devrait passer si le partage existe", () => {
      expect(() => assertShareExists(mockShare)).not.toThrow();
    });

    it("devrait lever SHARE_NOT_FOUND si le partage est null", () => {
      expect(() => assertShareExists(null)).toThrow("SHARE_NOT_FOUND");
    });
  });

  // ============================================
  // assertShareModifyAuthorization
  // ============================================
  describe("assertShareModifyAuthorization", () => {
    const mockShare: PromptShare = {
      id: "share-123",
      prompt_id: "prompt-123",
      shared_by: "user-123",
      shared_with_user_id: "user-456",
      permission: "READ",
      created_at: "2024-01-01T00:00:00Z",
    };

    describe("opération UPDATE", () => {
      it("devrait passer si l'utilisateur est le créateur du partage", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-123", false, "UPDATE")
        ).not.toThrow();
      });

      it("devrait passer si l'utilisateur est le propriétaire du prompt", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-789", true, "UPDATE")
        ).not.toThrow();
      });

      it("devrait lever UNAUTHORIZED_UPDATE si ni créateur ni propriétaire", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-789", false, "UPDATE")
        ).toThrow("UNAUTHORIZED_UPDATE");
      });
    });

    describe("opération DELETE", () => {
      it("devrait passer si l'utilisateur est le créateur du partage", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-123", false, "DELETE")
        ).not.toThrow();
      });

      it("devrait passer si l'utilisateur est le propriétaire du prompt", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-789", true, "DELETE")
        ).not.toThrow();
      });

      it("devrait lever UNAUTHORIZED_DELETE si ni créateur ni propriétaire", () => {
        expect(() =>
          assertShareModifyAuthorization(mockShare, "user-789", false, "DELETE")
        ).toThrow("UNAUTHORIZED_DELETE");
      });
    });

    it("devrait passer si l'utilisateur est à la fois créateur ET propriétaire", () => {
      expect(() =>
        assertShareModifyAuthorization(mockShare, "user-123", true, "UPDATE")
      ).not.toThrow();
    });
  });
});
