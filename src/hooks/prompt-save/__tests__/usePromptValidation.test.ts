import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePromptValidation } from "../usePromptValidation";

describe("usePromptValidation", () => {
  const validData = {
    title: "Test Prompt",
    description: "Test description",
    content: "Test content here",
    tags: ["tag1", "tag2"],
    visibility: "PRIVATE" as const,
    variables: [],
  };

  const validVariable = {
    id: "var-1",
    name: "testVar",
    type: "STRING" as const,
    required: true,
    default_value: "default",
    help: "Help text",
    created_at: "2024-01-01T00:00:00Z",
    options: [] as string[],
    order_index: 0,
    pattern: "",
    prompt_id: "prompt-1",
  };

  describe("validate() - valid data", () => {
    it("returns isValid: true for valid complete data", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate(validData);

      expect(validation.isValid).toBe(true);
      expect(validation.promptData).toEqual({
        title: "Test Prompt",
        description: "Test description",
        content: "Test content here",
        tags: ["tag1", "tag2"],
        visibility: "PRIVATE",
      });
      expect(validation.variables).toEqual([]);
      expect(validation.error).toBeUndefined();
    });

    it("returns isValid: true with valid variables", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        variables: [validVariable],
      });

      expect(validation.isValid).toBe(true);
      expect(validation.variables).toHaveLength(1);
      expect(validation.variables?.[0]).toMatchObject({
        name: "testVar",
        type: "STRING",
        required: true,
      });
    });

    it("normalizes empty description to null", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        description: "",
      });

      expect(validation.isValid).toBe(true);
      expect(validation.promptData?.description).toBeNull();
    });

    it("accepts SHARED visibility", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        visibility: "SHARED",
      });

      expect(validation.isValid).toBe(true);
      expect(validation.promptData?.visibility).toBe("SHARED");
    });

    it("accepts empty tags array", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        tags: [],
      });

      expect(validation.isValid).toBe(true);
      expect(validation.promptData?.tags).toEqual([]);
    });
  });

  describe("validate() - invalid prompt data", () => {
    it("returns error for empty title", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        title: "",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("title");
      expect(validation.promptData).toBeUndefined();
    });

    it("returns error for empty content", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        content: "",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("content");
    });

    it("returns error for whitespace-only title", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        title: "   ",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("title");
    });

    it("returns error for whitespace-only content", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        content: "   ",
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("content");
    });
  });

  describe("validate() - invalid variables", () => {
    it("returns error for variable with invalid name (starting with number)", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        variables: [{ ...validVariable, name: "123invalid" }],
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it("returns error for variable with empty name", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        variables: [{ ...validVariable, name: "" }],
      });

      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });

  describe("validate() - variable types", () => {
    const variableTypes = ["STRING", "NUMBER", "BOOLEAN", "DATE", "ENUM", "MULTISTRING"] as const;

    variableTypes.forEach((type) => {
      it(`accepts ${type} variable type`, () => {
        const { result } = renderHook(() => usePromptValidation());
        const validation = result.current.validate({
          ...validData,
          variables: [{ ...validVariable, type }],
        });

        expect(validation.isValid).toBe(true);
        expect(validation.variables?.[0].type).toBe(type);
      });
    });
  });

  describe("validate() - variable optional fields", () => {
    it("handles variable with options array", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        variables: [{
          ...validVariable,
          type: "ENUM" as const,
          options: ["option1", "option2"],
        }],
      });

      expect(validation.isValid).toBe(true);
      expect(validation.variables?.[0].options).toEqual(["option1", "option2"]);
    });

    it("handles variable with pattern", () => {
      const { result } = renderHook(() => usePromptValidation());
      const validation = result.current.validate({
        ...validData,
        variables: [{
          ...validVariable,
          pattern: "^[a-z]+$",
        }],
      });

      expect(validation.isValid).toBe(true);
      expect(validation.variables?.[0].pattern).toBe("^[a-z]+$");
    });
  });
});
