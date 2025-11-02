import { describe, it, expect } from "vitest";
import {
  PROMPT_LIMITS,
  VARIABLE_LIMITS,
  VARIABLE_SET_LIMITS,
  AUTH_LIMITS,
  AI_METADATA_LIMITS,
} from "../validation-limits";

describe("validation-limits", () => {
  describe("PROMPT_LIMITS", () => {
    it("should define title limits correctly", () => {
      expect(PROMPT_LIMITS.TITLE.MIN).toBe(1);
      expect(PROMPT_LIMITS.TITLE.MAX).toBe(200);
      expect(PROMPT_LIMITS.TITLE.MIN).toBeLessThan(PROMPT_LIMITS.TITLE.MAX);
    });

    it("should define description limits correctly", () => {
      expect(PROMPT_LIMITS.DESCRIPTION.MAX).toBe(3000);
      expect(PROMPT_LIMITS.DESCRIPTION.MAX).toBeGreaterThan(0);
    });

    it("should define content limits correctly", () => {
      expect(PROMPT_LIMITS.CONTENT.MIN).toBe(1);
      expect(PROMPT_LIMITS.CONTENT.MAX).toBe(200000);
      expect(PROMPT_LIMITS.CONTENT.MIN).toBeLessThan(PROMPT_LIMITS.CONTENT.MAX);
    });

    it("should ensure AI analysis limit is less than or equal to content limit", () => {
      expect(PROMPT_LIMITS.CONTENT_AI_ANALYSIS.MAX).toBeLessThanOrEqual(
        PROMPT_LIMITS.CONTENT.MAX
      );
    });

    it("should define AI analysis limit correctly", () => {
      expect(PROMPT_LIMITS.CONTENT_AI_ANALYSIS.MAX).toBe(50000);
    });
  });

  describe("VARIABLE_LIMITS", () => {
    it("should define max variable count", () => {
      expect(VARIABLE_LIMITS.MAX_COUNT).toBe(50);
      expect(VARIABLE_LIMITS.MAX_COUNT).toBeGreaterThan(0);
    });

    it("should define variable name limits correctly", () => {
      expect(VARIABLE_LIMITS.NAME.MIN).toBe(1);
      expect(VARIABLE_LIMITS.NAME.MAX).toBe(100);
      expect(VARIABLE_LIMITS.NAME.MIN).toBeLessThan(VARIABLE_LIMITS.NAME.MAX);
    });

    it("should define variable description limits correctly", () => {
      expect(VARIABLE_LIMITS.DESCRIPTION.MAX).toBe(500);
      expect(VARIABLE_LIMITS.DESCRIPTION.MAX).toBeGreaterThan(0);
    });

    it("should define variable default value limits correctly", () => {
      expect(VARIABLE_LIMITS.DEFAULT_VALUE.MAX).toBe(1000);
      expect(VARIABLE_LIMITS.DEFAULT_VALUE.MAX).toBeGreaterThan(0);
    });

    it("should define variable pattern limits correctly", () => {
      expect(VARIABLE_LIMITS.PATTERN.MAX).toBe(200);
      expect(VARIABLE_LIMITS.PATTERN.MAX).toBeGreaterThan(0);
    });

    it("should define variable options limits correctly", () => {
      expect(VARIABLE_LIMITS.OPTIONS.MAX_COUNT).toBe(50);
      expect(VARIABLE_LIMITS.OPTIONS.MAX_LENGTH).toBe(100);
      expect(VARIABLE_LIMITS.OPTIONS.MAX_COUNT).toBeGreaterThan(0);
      expect(VARIABLE_LIMITS.OPTIONS.MAX_LENGTH).toBeGreaterThan(0);
    });
  });

  describe("VARIABLE_SET_LIMITS", () => {
    it("should define variable set name limits correctly", () => {
      expect(VARIABLE_SET_LIMITS.NAME.MIN).toBe(1);
      expect(VARIABLE_SET_LIMITS.NAME.MAX).toBe(200);
      expect(VARIABLE_SET_LIMITS.NAME.MIN).toBeLessThan(
        VARIABLE_SET_LIMITS.NAME.MAX
      );
    });

    it("should define variable set value limits correctly", () => {
      expect(VARIABLE_SET_LIMITS.VALUE.MAX).toBe(5000);
      expect(VARIABLE_SET_LIMITS.VALUE.MAX).toBeGreaterThan(0);
    });
  });

  describe("AUTH_LIMITS", () => {
    it("should define email limits correctly", () => {
      expect(AUTH_LIMITS.EMAIL.MAX).toBe(255);
      expect(AUTH_LIMITS.EMAIL.MAX).toBeGreaterThan(0);
    });

    it("should define password limits correctly", () => {
      expect(AUTH_LIMITS.PASSWORD.MIN).toBe(6);
      expect(AUTH_LIMITS.PASSWORD.MAX).toBe(100);
      expect(AUTH_LIMITS.PASSWORD.MIN).toBeLessThan(AUTH_LIMITS.PASSWORD.MAX);
    });

    it("should define pseudo limits correctly", () => {
      expect(AUTH_LIMITS.PSEUDO.MIN).toBe(1);
      expect(AUTH_LIMITS.PSEUDO.MAX).toBe(100);
      expect(AUTH_LIMITS.PSEUDO.MIN).toBeLessThan(AUTH_LIMITS.PSEUDO.MAX);
    });
  });

  describe("AI_METADATA_LIMITS", () => {
    it("should define role limits correctly", () => {
      expect(AI_METADATA_LIMITS.ROLE.MAX).toBe(500);
      expect(AI_METADATA_LIMITS.ROLE.MAX).toBeGreaterThan(0);
    });

    it("should define objectives limits correctly", () => {
      expect(AI_METADATA_LIMITS.OBJECTIVES.MAX_COUNT).toBe(20);
      expect(AI_METADATA_LIMITS.OBJECTIVES.MAX_LENGTH).toBe(500);
      expect(AI_METADATA_LIMITS.OBJECTIVES.MAX_COUNT).toBeGreaterThan(0);
      expect(AI_METADATA_LIMITS.OBJECTIVES.MAX_LENGTH).toBeGreaterThan(0);
    });

    it("should define steps limits correctly", () => {
      expect(AI_METADATA_LIMITS.STEPS.MAX_COUNT).toBe(50);
      expect(AI_METADATA_LIMITS.STEPS.MAX_LENGTH).toBe(500);
      expect(AI_METADATA_LIMITS.STEPS.MAX_COUNT).toBeGreaterThan(0);
      expect(AI_METADATA_LIMITS.STEPS.MAX_LENGTH).toBeGreaterThan(0);
    });
  });

  describe("Coherence between limits", () => {
    it("should ensure variable description is less than prompt description", () => {
      expect(VARIABLE_LIMITS.DESCRIPTION.MAX).toBeLessThan(
        PROMPT_LIMITS.DESCRIPTION.MAX
      );
    });

    it("should ensure variable default value is less than variable set value", () => {
      expect(VARIABLE_LIMITS.DEFAULT_VALUE.MAX).toBeLessThan(
        VARIABLE_SET_LIMITS.VALUE.MAX
      );
    });

    it("should ensure all MAX values are positive integers", () => {
      const allLimits = [
        PROMPT_LIMITS.TITLE.MAX,
        PROMPT_LIMITS.DESCRIPTION.MAX,
        PROMPT_LIMITS.CONTENT.MAX,
        PROMPT_LIMITS.CONTENT_AI_ANALYSIS.MAX,
        VARIABLE_LIMITS.MAX_COUNT,
        VARIABLE_LIMITS.NAME.MAX,
        VARIABLE_LIMITS.DESCRIPTION.MAX,
        VARIABLE_LIMITS.DEFAULT_VALUE.MAX,
        VARIABLE_LIMITS.PATTERN.MAX,
        VARIABLE_LIMITS.OPTIONS.MAX_COUNT,
        VARIABLE_LIMITS.OPTIONS.MAX_LENGTH,
        VARIABLE_SET_LIMITS.NAME.MAX,
        VARIABLE_SET_LIMITS.VALUE.MAX,
        AUTH_LIMITS.EMAIL.MAX,
        AUTH_LIMITS.PASSWORD.MAX,
        AUTH_LIMITS.PSEUDO.MAX,
        AI_METADATA_LIMITS.ROLE.MAX,
        AI_METADATA_LIMITS.OBJECTIVES.MAX_COUNT,
        AI_METADATA_LIMITS.OBJECTIVES.MAX_LENGTH,
        AI_METADATA_LIMITS.STEPS.MAX_COUNT,
        AI_METADATA_LIMITS.STEPS.MAX_LENGTH,
      ];

      allLimits.forEach((limit) => {
        expect(limit).toBeGreaterThan(0);
        expect(Number.isInteger(limit)).toBe(true);
      });
    });

    it("should ensure all MIN values are positive integers", () => {
      const allMinLimits = [
        PROMPT_LIMITS.TITLE.MIN,
        PROMPT_LIMITS.CONTENT.MIN,
        VARIABLE_LIMITS.NAME.MIN,
        VARIABLE_SET_LIMITS.NAME.MIN,
        AUTH_LIMITS.PASSWORD.MIN,
        AUTH_LIMITS.PSEUDO.MIN,
      ];

      allMinLimits.forEach((limit) => {
        expect(limit).toBeGreaterThan(0);
        expect(Number.isInteger(limit)).toBe(true);
      });
    });
  });
});
