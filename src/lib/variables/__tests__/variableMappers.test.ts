import { describe, it, expect } from "vitest";
import type { Variable } from "@/repositories/VariableRepository";
import type { ImportableVariable } from "@/lib/promptImport";
import {
  toVariableUpsertInput,
  toVariableUpsertInputs,
  fromImportable,
  fromImportables,
} from "../variableMappers";

describe("toVariableUpsertInput", () => {
  const fullVariable: Variable = {
    id: "var-123",
    prompt_id: "prompt-456",
    name: "myVar",
    type: "STRING",
    required: true,
    default_value: "default",
    help: "Help text",
    pattern: "^[a-z]+$",
    options: ["a", "b"],
    order_index: 2,
    created_at: "2024-01-01T00:00:00Z",
  };

  it("copie tous les champs métier", () => {
    const result = toVariableUpsertInput(fullVariable);
    expect(result).toEqual({
      name: "myVar",
      type: "STRING",
      required: true,
      default_value: "default",
      help: "Help text",
      pattern: "^[a-z]+$",
      options: ["a", "b"],
      order_index: 2,
    });
  });

  it("exclut id, prompt_id et created_at", () => {
    const result = toVariableUpsertInput(fullVariable);
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("prompt_id");
    expect(result).not.toHaveProperty("created_at");
  });

  it("préserve null pour les optionnels", () => {
    const variable: Variable = {
      ...fullVariable,
      default_value: null,
      help: null,
      pattern: null,
      options: null,
    };
    const result = toVariableUpsertInput(variable);
    expect(result.default_value).toBeNull();
    expect(result.help).toBeNull();
    expect(result.pattern).toBeNull();
    expect(result.options).toBeNull();
  });

  // Test d'intégration : résultat identique à l'ancienne méthode
  it("produit le même résultat que mapVariablesForDuplication", () => {
    // Simule l'ancienne méthode privée de PromptDuplicationService
    const oldMethod = (v: Variable) => ({
      name: v.name,
      type: v.type,
      required: v.required,
      default_value: v.default_value,
      help: v.help,
      pattern: v.pattern,
      options: v.options,
      order_index: v.order_index,
    });

    expect(toVariableUpsertInput(fullVariable)).toEqual(oldMethod(fullVariable));
  });

  it("gère les types ENUM et autres", () => {
    const enumVariable: Variable = {
      ...fullVariable,
      type: "ENUM",
      options: ["opt1", "opt2", "opt3"],
    };
    const result = toVariableUpsertInput(enumVariable);
    expect(result.type).toBe("ENUM");
    expect(result.options).toEqual(["opt1", "opt2", "opt3"]);
  });
});

describe("toVariableUpsertInputs", () => {
  it("transforme un tableau de variables", () => {
    const variables: Variable[] = [
      {
        id: "1",
        prompt_id: "p1",
        name: "var1",
        type: "STRING",
        required: false,
        default_value: null,
        help: null,
        pattern: null,
        options: null,
        order_index: 0,
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        prompt_id: "p1",
        name: "var2",
        type: "NUMBER",
        required: true,
        default_value: "42",
        help: "A number",
        pattern: null,
        options: null,
        order_index: 1,
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    const results = toVariableUpsertInputs(variables);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe("var1");
    expect(results[1].name).toBe("var2");
    expect(results[0]).not.toHaveProperty("id");
    expect(results[1]).not.toHaveProperty("id");
  });

  it("retourne un tableau vide si entrée vide", () => {
    expect(toVariableUpsertInputs([])).toEqual([]);
  });
});

describe("fromImportable", () => {
  it("applique STRING par défaut si type absent", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.type).toBe("STRING");
  });

  it("applique false par défaut si required absent", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.required).toBe(false);
  });

  it("mappe defaultValue vers default_value", () => {
    const variable: ImportableVariable = { name: "test", defaultValue: "val" };
    const result = fromImportable(variable, 0);
    expect(result.default_value).toBe("val");
  });

  it("utilise l'index comme order_index", () => {
    const variable: ImportableVariable = { name: "test" };
    expect(fromImportable(variable, 5).order_index).toBe(5);
  });

  it("force pattern à null (non supporté)", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.pattern).toBeNull();
  });

  it("applique null aux optionnels manquants", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.default_value).toBeNull();
    expect(result.help).toBeNull();
    expect(result.options).toBeNull();
  });

  it("préserve les valeurs fournies", () => {
    const variable: ImportableVariable = {
      name: "fullVar",
      type: "ENUM",
      required: true,
      defaultValue: "opt1",
      help: "Select an option",
      options: ["opt1", "opt2"],
    };
    const result = fromImportable(variable, 3);

    expect(result).toEqual({
      name: "fullVar",
      type: "ENUM",
      required: true,
      default_value: "opt1",
      help: "Select an option",
      pattern: null,
      options: ["opt1", "opt2"],
      order_index: 3,
    });
  });

  // Test d'intégration : résultat identique à l'ancienne méthode
  it("produit le même résultat que mapVariablesForImport", () => {
    const importable: ImportableVariable = {
      name: "myVar",
      type: "NUMBER",
      required: true,
      defaultValue: "42",
      help: "Help",
      options: ["a", "b"],
    };

    // Simule l'ancienne méthode privée de PromptImportService
    const oldMethod = (v: ImportableVariable, index: number) => ({
      name: v.name,
      type:
        (v.type as
          | "STRING"
          | "NUMBER"
          | "BOOLEAN"
          | "ENUM"
          | "DATE"
          | "MULTISTRING") || "STRING",
      required: v.required ?? false,
      default_value: v.defaultValue ?? null,
      help: v.help ?? null,
      pattern: null,
      options: v.options ?? null,
      order_index: index,
    });

    expect(fromImportable(importable, 3)).toEqual(oldMethod(importable, 3));
  });
});

describe("fromImportables", () => {
  it("assigne order_index séquentiel", () => {
    const variables: ImportableVariable[] = [
      { name: "a" },
      { name: "b" },
      { name: "c" },
    ];
    const results = fromImportables(variables);
    expect(results[0].order_index).toBe(0);
    expect(results[1].order_index).toBe(1);
    expect(results[2].order_index).toBe(2);
  });

  it("retourne un tableau vide si entrée vide", () => {
    expect(fromImportables([])).toEqual([]);
  });

  it("applique les valeurs par défaut à chaque élément", () => {
    const variables: ImportableVariable[] = [
      { name: "a" },
      { name: "b", type: "NUMBER", required: true },
    ];
    const results = fromImportables(variables);

    // Premier élément avec valeurs par défaut
    expect(results[0].type).toBe("STRING");
    expect(results[0].required).toBe(false);

    // Deuxième élément avec valeurs fournies
    expect(results[1].type).toBe("NUMBER");
    expect(results[1].required).toBe(true);
  });
});
