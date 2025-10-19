import { describe, it, expect } from "vitest";
import { promptSchema, variableSchema } from "../validation";

describe("promptSchema", () => {
  it("should accept valid prompt data", () => {
    const validData = {
      title: "Test Prompt",
      description: "Test description",
      content: "This is {{variable}} content",
      tags: ["test", "prompt"],
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const invalidData = {
      title: "",
      content: "Content",
      tags: [],
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("titre");
    }
  });

  it("should reject title over 200 characters", () => {
    const invalidData = {
      title: "a".repeat(201),
      content: "Content",
      tags: [],
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("200");
    }
  });

  it("should reject too many tags", () => {
    const invalidData = {
      title: "Test",
      content: "Content",
      tags: Array(21).fill("tag"),
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept empty description", () => {
    const validData = {
      title: "Test",
      description: "",
      content: "Content",
      tags: [],
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject content over 50000 characters", () => {
    const invalidData = {
      title: "Test",
      content: "a".repeat(50001),
      tags: [],
      visibility: "PRIVATE" as const,
    };

    const result = promptSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("variableSchema", () => {
  it("should accept valid variable", () => {
    const validData = {
      name: "my_variable",
      type: "STRING" as const,
      required: true,
      default_value: "default",
    };

    const result = variableSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid variable name format", () => {
    const invalidData = {
      name: "invalid-name!",
      type: "STRING" as const,
      required: false,
    };

    const result = variableSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept valid enum type variable", () => {
    const validData = {
      name: "my_enum",
      type: "ENUM" as const,
      required: false,
      options: ["option1", "option2"],
    };

    const result = variableSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject name with spaces", () => {
    const invalidData = {
      name: "invalid name",
      type: "STRING" as const,
      required: false,
    };

    const result = variableSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject empty variable name", () => {
    const invalidData = {
      name: "",
      type: "STRING" as const,
      required: false,
    };

    const result = variableSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
