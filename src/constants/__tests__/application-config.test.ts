import { describe, it, expect } from "vitest";
import {
  TIMING,
  STORAGE_KEYS,
  APP_VERSION,
  APP_NAME,
  FEATURES,
} from "../application-config";

describe("application-config", () => {
  describe("TIMING", () => {
    it("should define autosave interval correctly", () => {
      expect(TIMING.AUTOSAVE_INTERVAL).toBe(5000);
      expect(TIMING.AUTOSAVE_INTERVAL).toBeGreaterThan(0);
    });

    it("should define debounce delay correctly", () => {
      expect(TIMING.DEBOUNCE_DELAY).toBe(300);
      expect(TIMING.DEBOUNCE_DELAY).toBeGreaterThan(0);
    });

    it("should define search debounce delay correctly", () => {
      expect(TIMING.DEBOUNCE_SEARCH_DELAY).toBe(500);
      expect(TIMING.DEBOUNCE_SEARCH_DELAY).toBeGreaterThan(0);
    });

    it("should define toast duration correctly", () => {
      expect(TIMING.TOAST_DURATION).toBe(3000);
      expect(TIMING.TOAST_DURATION).toBeGreaterThan(0);
    });

    it("should define client analysis timeout correctly", () => {
      expect(TIMING.ANALYSIS_CLIENT_TIMEOUT).toBe(30_000);
      expect(TIMING.ANALYSIS_CLIENT_TIMEOUT).toBeGreaterThan(0);
    });

    it("should define edge analysis timeout correctly", () => {
      expect(TIMING.ANALYSIS_EDGE_TIMEOUT).toBe(35_000);
      expect(TIMING.ANALYSIS_EDGE_TIMEOUT).toBeGreaterThan(0);
    });

    it("should ensure edge timeout is greater than client timeout", () => {
      expect(TIMING.ANALYSIS_EDGE_TIMEOUT).toBeGreaterThan(
        TIMING.ANALYSIS_CLIENT_TIMEOUT
      );
    });

    it("should ensure timeout gap is at least 5 seconds", () => {
      const gap = TIMING.ANALYSIS_EDGE_TIMEOUT - TIMING.ANALYSIS_CLIENT_TIMEOUT;
      expect(gap).toBeGreaterThanOrEqual(5000);
    });

    it("should ensure analysis timeouts are reasonable (< 60s)", () => {
      expect(TIMING.ANALYSIS_CLIENT_TIMEOUT).toBeLessThan(60_000);
      expect(TIMING.ANALYSIS_EDGE_TIMEOUT).toBeLessThan(60_000);
    });

    it("should ensure search debounce is longer than default debounce", () => {
      expect(TIMING.DEBOUNCE_SEARCH_DELAY).toBeGreaterThan(
        TIMING.DEBOUNCE_DELAY
      );
    });

    it("should ensure all timing values are positive integers", () => {
      const timingValues = Object.values(TIMING);
      timingValues.forEach((value) => {
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
      });
    });
  });

  describe("STORAGE_KEYS", () => {
    it("should define draft new prompt key correctly", () => {
      expect(STORAGE_KEYS.DRAFT_NEW_PROMPT).toBe("prompt_draft_new");
      expect(typeof STORAGE_KEYS.DRAFT_NEW_PROMPT).toBe("string");
    });

    it("should define user preferences key correctly", () => {
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe("user_preferences");
      expect(typeof STORAGE_KEYS.USER_PREFERENCES).toBe("string");
    });

    it("should define theme key correctly", () => {
      expect(STORAGE_KEYS.THEME).toBe("theme");
      expect(typeof STORAGE_KEYS.THEME).toBe("string");
    });

    it("should ensure all storage keys are unique", () => {
      const keys = Object.values(STORAGE_KEYS);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });

    it("should ensure all storage keys are non-empty strings", () => {
      const keys = Object.values(STORAGE_KEYS);
      keys.forEach((key) => {
        expect(typeof key).toBe("string");
        expect(key.length).toBeGreaterThan(0);
      });
    });
  });

  describe("APP_VERSION", () => {
    it("should be defined and follow semver format", () => {
      expect(APP_VERSION).toBeDefined();
      expect(typeof APP_VERSION).toBe("string");
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/); // Basic semver check
    });

    it("should be 1.0.0", () => {
      expect(APP_VERSION).toBe("1.0.0");
    });
  });

  describe("APP_NAME", () => {
    it("should be defined and be a non-empty string", () => {
      expect(APP_NAME).toBeDefined();
      expect(typeof APP_NAME).toBe("string");
      expect(APP_NAME.length).toBeGreaterThan(0);
    });

    it("should be PromptForge", () => {
      expect(APP_NAME).toBe("PromptForge");
    });
  });

  describe("FEATURES", () => {
    it("should define AI analysis feature flag", () => {
      expect(FEATURES.ENABLE_AI_ANALYSIS).toBeDefined();
      expect(typeof FEATURES.ENABLE_AI_ANALYSIS).toBe("boolean");
    });

    it("should define version control feature flag", () => {
      expect(FEATURES.ENABLE_VERSION_CONTROL).toBeDefined();
      expect(typeof FEATURES.ENABLE_VERSION_CONTROL).toBe("boolean");
    });

    it("should define public sharing feature flag", () => {
      expect(FEATURES.ENABLE_PUBLIC_SHARING).toBeDefined();
      expect(typeof FEATURES.ENABLE_PUBLIC_SHARING).toBe("boolean");
    });

    it("should have all features enabled by default", () => {
      expect(FEATURES.ENABLE_AI_ANALYSIS).toBe(true);
      expect(FEATURES.ENABLE_VERSION_CONTROL).toBe(true);
      expect(FEATURES.ENABLE_PUBLIC_SHARING).toBe(true);
    });

    it("should ensure all feature flags are boolean", () => {
      const featureValues = Object.values(FEATURES);
      featureValues.forEach((value) => {
        expect(typeof value).toBe("boolean");
      });
    });
  });

  describe("Config immutability", () => {
    it("should ensure TIMING is immutable (as const)", () => {
      // TypeScript enforces this at compile time
      // Runtime check: trying to modify should fail in strict mode
      expect(() => {
        // @ts-expect-error - Testing immutability
        TIMING.AUTOSAVE_INTERVAL = 10000;
      }).toThrow();
    });

    it("should ensure STORAGE_KEYS is immutable (as const)", () => {
      expect(() => {
        // @ts-expect-error - Testing immutability
        STORAGE_KEYS.DRAFT_NEW_PROMPT = "new_key";
      }).toThrow();
    });

    it("should ensure FEATURES is immutable (as const)", () => {
      expect(() => {
        // @ts-expect-error - Testing immutability
        FEATURES.ENABLE_AI_ANALYSIS = false;
      }).toThrow();
    });
  });
});
