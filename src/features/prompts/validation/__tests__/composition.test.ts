import { describe, it, expect } from "vitest";
import { composeValidators, composeFieldValidators } from "../compose";
import { createRequiredValidator } from "../validators/required-field-validator";
import { createLengthValidator } from "../validators/length-validator";

describe("Composition", () => {
  describe("composeValidators", () => {
    it("should execute validators in priority order", async () => {
      const validators = [
        createLengthValidator("title", { max: 10 }), // priority: 3
        createRequiredValidator("title"),            // priority: 1
      ];
      
      const result = await composeValidators("", validators);
      
      // Le validateur required (priorité 1) doit s'exécuter en premier
      expect(result.isValid).toBe(false);
      expect(result.failedValidators[0]).toContain("required");
    });

    it("should stop on failure if stopOnFailure is true", async () => {
      const requiredValidator = createRequiredValidator("title");
      requiredValidator.stopOnFailure = true;
      
      const validators = [
        requiredValidator,
        createLengthValidator("title", { max: 10 }),
      ];
      
      const result = await composeValidators("", validators);
      
      // Seul le premier validateur doit avoir échoué
      expect(result.failedValidators.length).toBe(1);
    });

    it("should pass if all validators pass", async () => {
      const validators = [
        createRequiredValidator("title"),
        createLengthValidator("title", { min: 3, max: 20 }),
      ];
      
      const result = await composeValidators("Valid title", validators);
      
      expect(result.isValid).toBe(true);
      expect(result.failedValidators.length).toBe(0);
    });
  });

  describe("composeFieldValidators", () => {
    it("should validate multiple fields", async () => {
      const fieldValidators = {
        title: [createRequiredValidator("title")],
        content: [createRequiredValidator("content")],
      };
      
      const data = { title: "", content: "Some content" };
      
      const result = await composeFieldValidators(data, fieldValidators);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.content).toBeUndefined();
    });

    it("should pass if all fields are valid", async () => {
      const fieldValidators = {
        title: [createRequiredValidator("title")],
        content: [createRequiredValidator("content")],
      };
      
      const data = { title: "Test", content: "Some content" };
      
      const result = await composeFieldValidators(data, fieldValidators);
      
      expect(result.isValid).toBe(true);
    });
  });
});
