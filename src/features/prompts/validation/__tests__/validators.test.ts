import { describe, it, expect } from "vitest";
import { createRequiredValidator } from "../validators/required-field-validator";
import { createLengthValidator } from "../validators/length-validator";
import { createUniqueValidator } from "../validators/unique-validator";
import { createConditionalValidator } from "../validators/conditional-validator";

describe("Validators", () => {
  describe("RequiredValidator", () => {
    it("should fail if value is empty", async () => {
      const validator = createRequiredValidator("title");
      const result = await validator.validate("");
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("requis");
    });

    it("should pass if value is not empty", async () => {
      const validator = createRequiredValidator("title");
      const result = await validator.validate("Test");
      
      expect(result.isValid).toBe(true);
    });
  });

  describe("LengthValidator", () => {
    it("should fail if value is too short", async () => {
      const validator = createLengthValidator("title", { min: 5 });
      const result = await validator.validate("abc");
      
      expect(result.isValid).toBe(false);
    });

    it("should fail if value is too long", async () => {
      const validator = createLengthValidator("title", { max: 10 });
      const result = await validator.validate("This is a very long title");
      
      expect(result.isValid).toBe(false);
    });

    it("should pass if value length is valid", async () => {
      const validator = createLengthValidator("title", { min: 3, max: 20 });
      const result = await validator.validate("Valid title");
      
      expect(result.isValid).toBe(true);
    });
  });

  describe("UniqueValidator", () => {
    it("should fail if value is duplicate", async () => {
      const validator = createUniqueValidator<string>(
        "tags",
        () => ["react", "typescript"],
      );
      const result = await validator.validate("react");
      
      expect(result.isValid).toBe(false);
    });

    it("should pass if value is unique", async () => {
      const validator = createUniqueValidator<string>(
        "tags",
        () => ["react", "typescript"],
      );
      const result = await validator.validate("vue");
      
      expect(result.isValid).toBe(true);
    });
  });

  describe("ConditionalValidator", () => {
    it("should skip validation if condition is false", async () => {
      const innerValidator = createRequiredValidator("description");
      const validator = createConditionalValidator(
        "description-if-public",
        (context) => context?.formData?.visibility === "SHARED",
        innerValidator
      );
      
      const result = await validator.validate("", {
        formData: { visibility: "PRIVATE" },
      });
      
      expect(result.isValid).toBe(true);
    });

    it("should execute validation if condition is true", async () => {
      const innerValidator = createRequiredValidator("description");
      const validator = createConditionalValidator(
        "description-if-public",
        (context) => context?.formData?.visibility === "SHARED",
        innerValidator
      );
      
      const result = await validator.validate("", {
        formData: { visibility: "SHARED" },
      });
      
      expect(result.isValid).toBe(false);
    });
  });
});
