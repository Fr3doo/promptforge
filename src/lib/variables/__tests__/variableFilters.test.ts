import { describe, it, expect } from "vitest";
import { filterValidVariables, needsFiltering } from "../variableFilters";
import type { Variable } from "@/features/prompts/types";

const createVariable = (name: string): Variable => ({
  id: `var-${name}`,
  name,
  type: "STRING",
  required: false,
  order_index: 0,
  default_value: "",
  help: "",
  pattern: "",
  options: [],
  prompt_id: "test-prompt-id",
  created_at: new Date().toISOString(),
});

describe("filterValidVariables", () => {
  it("should return empty array when variables list is empty", () => {
    const result = filterValidVariables([], ["name1", "name2"]);
    expect(result).toEqual([]);
  });

  it("should return all variables when all are valid", () => {
    const variables = [createVariable("name1"), createVariable("name2")];
    const validNames = ["name1", "name2", "name3"];

    const result = filterValidVariables(variables, validNames);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("name1");
    expect(result[1].name).toBe("name2");
  });

  it("should return only valid variables when some are invalid", () => {
    const variables = [
      createVariable("name1"),
      createVariable("name2"),
      createVariable("name3"),
    ];
    const validNames = ["name1", "name3"];

    const result = filterValidVariables(variables, validNames);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("name1");
    expect(result[1].name).toBe("name3");
  });

  it("should return empty array when no variables are valid", () => {
    const variables = [createVariable("name1"), createVariable("name2")];
    const validNames = ["name3", "name4"];

    const result = filterValidVariables(variables, validNames);

    expect(result).toEqual([]);
  });

  it("should return empty array when validNames is empty", () => {
    const variables = [createVariable("name1"), createVariable("name2")];

    const result = filterValidVariables(variables, []);

    expect(result).toEqual([]);
  });
});

describe("needsFiltering", () => {
  it("should return false when variables list is empty", () => {
    const result = needsFiltering([], ["name1", "name2"]);
    expect(result).toBe(false);
  });

  it("should return false when all variables are present in validNames", () => {
    const variables = [createVariable("name1"), createVariable("name2")];
    const validNames = ["name1", "name2", "name3"];

    const result = needsFiltering(variables, validNames);

    expect(result).toBe(false);
  });

  it("should return true when some variables are absent from validNames", () => {
    const variables = [
      createVariable("name1"),
      createVariable("name2"),
      createVariable("name3"),
    ];
    const validNames = ["name1", "name3"];

    const result = needsFiltering(variables, validNames);

    expect(result).toBe(true);
  });

  it("should return true when no variables are in validNames", () => {
    const variables = [createVariable("name1"), createVariable("name2")];
    const validNames = ["name3", "name4"];

    const result = needsFiltering(variables, validNames);

    expect(result).toBe(true);
  });

  it("should return true when validNames is empty but variables exist", () => {
    const variables = [createVariable("name1")];

    const result = needsFiltering(variables, []);

    expect(result).toBe(true);
  });
});
