import { describe, it, expect } from "vitest";
import {
  VARIABLE_NAME_REGEX,
  VARIABLE_NAME_AI_REGEX,
  SEMVER_REGEX,
  CATEGORY_AI_REGEX,
} from "../regex-patterns";

describe("regex-patterns", () => {
  describe("VARIABLE_NAME_REGEX", () => {
    it("should accept valid variable names (alphanumeric + underscore)", () => {
      const validNames = [
        "variable",
        "my_variable",
        "variable123",
        "MY_VARIABLE",
        "var_123_test",
        "_private",
        "a",
        "ABC123_xyz",
      ];

      validNames.forEach((name) => {
        expect(VARIABLE_NAME_REGEX.test(name)).toBe(true);
      });
    });

    it("should reject invalid variable names (special chars, spaces, hyphens)", () => {
      const invalidNames = [
        "my-variable", // hyphen not allowed
        "my variable", // space not allowed
        "my@variable", // special char
        "my.variable", // dot not allowed
        "my-var-test", // hyphens
        "", // empty string
        "variable!", // exclamation mark
        "var$iable", // dollar sign
      ];

      invalidNames.forEach((name) => {
        expect(VARIABLE_NAME_REGEX.test(name)).toBe(false);
      });
    });
  });

  describe("VARIABLE_NAME_AI_REGEX", () => {
    it("should accept valid AI-generated variable names (alphanumeric + underscore + hyphen)", () => {
      const validNames = [
        "variable",
        "my_variable",
        "my-variable", // hyphen allowed in AI regex
        "variable-123",
        "MY-VARIABLE",
        "var_123-test",
        "_private-var",
        "a-b-c",
        "test_var-123",
      ];

      validNames.forEach((name) => {
        expect(VARIABLE_NAME_AI_REGEX.test(name)).toBe(true);
      });
    });

    it("should reject invalid AI-generated variable names (special chars, spaces)", () => {
      const invalidNames = [
        "my variable", // space not allowed
        "my@variable", // special char
        "my.variable", // dot not allowed
        "", // empty string
        "variable!", // exclamation mark
        "var$iable", // dollar sign
      ];

      invalidNames.forEach((name) => {
        expect(VARIABLE_NAME_AI_REGEX.test(name)).toBe(false);
      });
    });

    it("should be more permissive than strict VARIABLE_NAME_REGEX", () => {
      const namesWithHyphens = ["my-var", "test-123", "var-name-test"];

      namesWithHyphens.forEach((name) => {
        expect(VARIABLE_NAME_REGEX.test(name)).toBe(false); // Strict rejects hyphens
        expect(VARIABLE_NAME_AI_REGEX.test(name)).toBe(true); // AI accepts hyphens
      });
    });
  });

  describe("SEMVER_REGEX", () => {
    it("should accept valid semantic versioning", () => {
      const validVersions = [
        "0.0.0",
        "1.0.0",
        "1.2.3",
        "10.20.30",
        "999.999.999",
        "1.0.1",
        "2.5.8",
      ];

      validVersions.forEach((version) => {
        expect(SEMVER_REGEX.test(version)).toBe(true);
      });
    });

    it("should reject invalid semantic versioning", () => {
      const invalidVersions = [
        "1", // Missing minor and patch
        "1.0", // Missing patch
        "v1.0.0", // Prefix not allowed
        "1.0.0-alpha", // Pre-release not allowed
        "1.0.0+build", // Build metadata not allowed
        "1.0.0.0", // Too many parts
        "a.b.c", // Non-numeric
        "", // Empty string
        "1.0.", // Incomplete
        ".1.0", // Leading dot
      ];

      invalidVersions.forEach((version) => {
        expect(SEMVER_REGEX.test(version)).toBe(false);
      });
    });
  });

  describe("CATEGORY_AI_REGEX", () => {
    it("should accept valid AI-generated categories", () => {
      const validCategories = [
        "Marketing",
        "Code Generation",
        "Data Analysis",
        "Content Writing",
        "AI-Prompts",
        "Prompt_Engineering",
        "Category 123",
        "test-category",
        "Test_Category-123",
      ];

      validCategories.forEach((category) => {
        expect(CATEGORY_AI_REGEX.test(category)).toBe(true);
      });
    });

    it("should reject invalid AI-generated categories", () => {
      const invalidCategories = [
        "Category@Test", // @ not allowed
        "Test$Category", // $ not allowed
        "Category!!", // ! not allowed
        "", // Empty string
        "Test.Category", // . not allowed (unless we want to allow it)
      ];

      invalidCategories.forEach((category) => {
        expect(CATEGORY_AI_REGEX.test(category)).toBe(false);
      });
    });

    it("should accept categories with spaces, hyphens, and underscores", () => {
      const categoriesWithSpecialChars = [
        "AI Prompts",
        "Test-Category",
        "Category_Name",
        "Multi Word Category",
        "test-category_name 123",
      ];

      categoriesWithSpecialChars.forEach((category) => {
        expect(CATEGORY_AI_REGEX.test(category)).toBe(true);
      });
    });
  });

  describe("Regex coherence", () => {
    it("should ensure VARIABLE_NAME_AI_REGEX is superset of VARIABLE_NAME_REGEX for valid base names", () => {
      const baseValidNames = ["test", "var_name", "ABC123"];

      baseValidNames.forEach((name) => {
        const strictMatch = VARIABLE_NAME_REGEX.test(name);
        const aiMatch = VARIABLE_NAME_AI_REGEX.test(name);

        // If strict accepts it, AI should also accept it
        if (strictMatch) {
          expect(aiMatch).toBe(true);
        }
      });
    });

    it("should ensure all regex patterns are defined and are RegExp instances", () => {
      expect(VARIABLE_NAME_REGEX).toBeInstanceOf(RegExp);
      expect(VARIABLE_NAME_AI_REGEX).toBeInstanceOf(RegExp);
      expect(SEMVER_REGEX).toBeInstanceOf(RegExp);
      expect(CATEGORY_AI_REGEX).toBeInstanceOf(RegExp);
    });
  });
});
