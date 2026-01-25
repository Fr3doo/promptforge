import { describe, it, expect } from "vitest";
import { DefaultVariableDiffCalculator } from "../VariableDiffCalculator";
import type { Variable, VariableUpsertInput } from "../../VariableRepository";

describe("DefaultVariableDiffCalculator", () => {
  const calculator = new DefaultVariableDiffCalculator();
  const promptId = "prompt-123";

  const createExistingVariable = (overrides: Partial<Variable> = {}): Variable => ({
    id: "var-1",
    prompt_id: promptId,
    name: "existingVar",
    type: "STRING",
    required: true,
    default_value: null,
    help: null,
    options: null,
    pattern: null,
    order_index: 0,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  });

  const createIncomingVariable = (overrides: Partial<VariableUpsertInput> = {}): VariableUpsertInput => ({
    name: "newVar",
    type: "STRING",
    required: true,
    ...overrides,
  });

  describe("calculate", () => {
    it("should return all incoming as toUpsert when no existing variables", () => {
      const incoming = [
        createIncomingVariable({ name: "var1" }),
        createIncomingVariable({ name: "var2" }),
      ];

      const result = calculator.calculate(promptId, [], incoming);

      expect(result.toUpsert).toHaveLength(2);
      expect(result.toDeleteIds).toHaveLength(0);
      expect(result.toUpsert[0]).toMatchObject({
        name: "var1",
        prompt_id: promptId,
        order_index: 0,
      });
      expect(result.toUpsert[1]).toMatchObject({
        name: "var2",
        prompt_id: promptId,
        order_index: 1,
      });
    });

    it("should preserve ID when matching by name (update scenario)", () => {
      const existing = [createExistingVariable({ id: "existing-id", name: "myVar" })];
      const incoming = [createIncomingVariable({ name: "myVar", required: false })];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toUpsert).toHaveLength(1);
      expect(result.toUpsert[0].id).toBe("existing-id");
      expect(result.toUpsert[0].name).toBe("myVar");
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("should preserve ID when matching by ID (rename scenario)", () => {
      const existing = [createExistingVariable({ id: "var-id-1", name: "oldName" })];
      const incoming = [createIncomingVariable({ id: "var-id-1", name: "newName" })];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toUpsert).toHaveLength(1);
      expect(result.toUpsert[0].id).toBe("var-id-1");
      expect(result.toUpsert[0].name).toBe("newName");
      expect(result.toDeleteIds).toHaveLength(0);
    });

    it("should mark obsolete variables for deletion", () => {
      const existing = [
        createExistingVariable({ id: "keep-id", name: "keepMe" }),
        createExistingVariable({ id: "delete-id", name: "deleteMe" }),
      ];
      const incoming = [createIncomingVariable({ name: "keepMe" })];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toUpsert).toHaveLength(1);
      expect(result.toDeleteIds).toEqual(["delete-id"]);
    });

    it("should return all existing IDs for deletion when incoming is empty", () => {
      const existing = [
        createExistingVariable({ id: "id-1", name: "var1" }),
        createExistingVariable({ id: "id-2", name: "var2" }),
      ];

      const result = calculator.calculate(promptId, existing, []);

      expect(result.toUpsert).toHaveLength(0);
      expect(result.toDeleteIds).toEqual(["id-1", "id-2"]);
    });

    it("should handle mixed create/update/delete scenario", () => {
      const existing = [
        createExistingVariable({ id: "update-id", name: "updateMe" }),
        createExistingVariable({ id: "rename-id", name: "renameMe" }),
        createExistingVariable({ id: "delete-id", name: "deleteMe" }),
      ];
      const incoming = [
        createIncomingVariable({ name: "updateMe", required: false }), // Update by name
        createIncomingVariable({ id: "rename-id", name: "newName" }),  // Rename by ID
        createIncomingVariable({ name: "brandNew" }),                   // Create new
      ];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toUpsert).toHaveLength(3);
      
      // Update by name preserves ID
      expect(result.toUpsert[0].id).toBe("update-id");
      expect(result.toUpsert[0].name).toBe("updateMe");
      
      // Rename by ID preserves ID, changes name
      expect(result.toUpsert[1].id).toBe("rename-id");
      expect(result.toUpsert[1].name).toBe("newName");
      
      // New variable has no ID
      expect(result.toUpsert[2].id).toBeUndefined();
      expect(result.toUpsert[2].name).toBe("brandNew");
      
      // Only "deleteMe" should be deleted
      expect(result.toDeleteIds).toEqual(["delete-id"]);
    });

    it("should set correct order_index for all variables", () => {
      const incoming = [
        createIncomingVariable({ name: "first" }),
        createIncomingVariable({ name: "second" }),
        createIncomingVariable({ name: "third" }),
      ];

      const result = calculator.calculate(promptId, [], incoming);

      expect(result.toUpsert[0].order_index).toBe(0);
      expect(result.toUpsert[1].order_index).toBe(1);
      expect(result.toUpsert[2].order_index).toBe(2);
    });

    it("should set prompt_id on all upserted variables", () => {
      const incoming = [
        createIncomingVariable({ name: "var1" }),
        createIncomingVariable({ name: "var2" }),
      ];

      const result = calculator.calculate("custom-prompt-id", [], incoming);

      expect(result.toUpsert[0].prompt_id).toBe("custom-prompt-id");
      expect(result.toUpsert[1].prompt_id).toBe("custom-prompt-id");
    });

    it("should not delete variable when only name matches (update scenario)", () => {
      const existing = [createExistingVariable({ id: "var-1", name: "sameName" })];
      const incoming = [createIncomingVariable({ name: "sameName", type: "NUMBER" })];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toDeleteIds).toHaveLength(0);
      expect(result.toUpsert[0].id).toBe("var-1");
    });

    it("should not delete variable when only ID matches (rename scenario)", () => {
      const existing = [createExistingVariable({ id: "var-1", name: "oldName" })];
      const incoming = [createIncomingVariable({ id: "var-1", name: "differentName" })];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toDeleteIds).toHaveLength(0);
      expect(result.toUpsert[0].id).toBe("var-1");
    });

    it("should prefer ID matching over name matching when explicit ID provided", () => {
      // Edge case: variable with explicit ID takes precedence over name matching
      const existing = [
        createExistingVariable({ id: "id-by-id", name: "originalName" }),
        createExistingVariable({ id: "id-by-name", name: "targetName" }),
      ];
      const incoming = [
        createIncomingVariable({ id: "id-by-id", name: "renamedVar" }), // Explicit ID = rename
      ];

      const result = calculator.calculate(promptId, existing, incoming);

      // Should use the explicit ID for the rename
      expect(result.toUpsert[0].id).toBe("id-by-id");
      expect(result.toUpsert[0].name).toBe("renamedVar");
      // id-by-name should be deleted (not referenced by ID or name)
      expect(result.toDeleteIds).toContain("id-by-name");
    });

    it("should not delete when name matches even without explicit ID", () => {
      // When incoming has same name as existing, it's an update (not a delete)
      const existing = [
        createExistingVariable({ id: "existing-id", name: "sharedName" }),
      ];
      const incoming = [
        createIncomingVariable({ name: "sharedName", type: "NUMBER" }), // No ID, matches by name
      ];

      const result = calculator.calculate(promptId, existing, incoming);

      expect(result.toUpsert[0].id).toBe("existing-id");
      expect(result.toDeleteIds).toHaveLength(0);
    });
  });
});
