import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVariableDetection, useVariableSubstitution } from "../useVariableDetection";
import type { Tables } from "@/integrations/supabase/types";

type Variable = Tables<"variables">;

describe("useVariableDetection", () => {
  describe("détection des noms de variables via regex", () => {
    it("devrait détecter une variable simple", () => {
      const content = "Hello {{name}}!";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toEqual(["name"]);
    });

    it("devrait détecter plusieurs variables", () => {
      const content = "Hello {{firstName}} {{lastName}}! You are {{age}} years old.";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toHaveLength(3);
      expect(result.current.detectedNames).toContain("firstName");
      expect(result.current.detectedNames).toContain("lastName");
      expect(result.current.detectedNames).toContain("age");
    });

    it("devrait détecter des variables avec underscores et chiffres", () => {
      const content = "User {{user_name_1}} has {{total_count2}} items.";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toEqual(["user_name_1", "total_count2"]);
    });

    it("devrait retourner un tableau vide si aucune variable n'est détectée", () => {
      const content = "No variables here!";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toEqual([]);
    });

    it("ne devrait détecter qu'une seule fois les variables dupliquées", () => {
      const content = "{{name}} is {{name}} and {{name}} again!";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toEqual(["name"]);
    });

    it("ne devrait pas détecter les accolades sans contenu valide", () => {
      const content = "Invalid {{}} or {{123}} or {{-invalid}}";
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toEqual([]);
    });

    it("devrait gérer du contenu multiligne", () => {
      const content = `
        First line: {{var1}}
        Second line: {{var2}}
        Third line: {{var3}}
      `;
      const { result } = renderHook(() => useVariableDetection(content));

      expect(result.current.detectedNames).toHaveLength(3);
      expect(result.current.detectedNames).toContain("var1");
      expect(result.current.detectedNames).toContain("var2");
      expect(result.current.detectedNames).toContain("var3");
    });

    it("devrait recalculer les variables quand le contenu change", () => {
      const { result, rerender } = renderHook(
        ({ content }) => useVariableDetection(content),
        { initialProps: { content: "Hello {{name}}!" } }
      );

      expect(result.current.detectedNames).toEqual(["name"]);

      rerender({ content: "Hello {{firstName}} {{lastName}}!" });

      expect(result.current.detectedNames).toEqual(["firstName", "lastName"]);
    });
  });

  describe("useVariableSubstitution", () => {
    const mockVariables: Variable[] = [
      {
        id: "1",
        prompt_id: "prompt-1",
        name: "firstName",
        type: "STRING",
        default_value: "John",
        required: false,
        order_index: 0,
        help: "",
        pattern: "",
        options: [],
        created_at: "2024-01-01",
      },
      {
        id: "2",
        prompt_id: "prompt-1",
        name: "lastName",
        type: "STRING",
        default_value: "Doe",
        required: false,
        order_index: 1,
        help: "",
        pattern: "",
        options: [],
        created_at: "2024-01-01",
      },
    ];

    it("devrait substituer les variables avec les valeurs fournies", () => {
      const content = "Hello {{firstName}} {{lastName}}!";
      const values = {
        firstName: "Alice",
        lastName: "Smith",
      };

      const { result } = renderHook(() =>
        useVariableSubstitution(content, mockVariables, values)
      );

      expect(result.current.preview).toBe("Hello Alice Smith!");
    });

    it("devrait utiliser les valeurs par défaut si aucune valeur n'est fournie", () => {
      const content = "Hello {{firstName}} {{lastName}}!";
      const values = {};

      const { result } = renderHook(() =>
        useVariableSubstitution(content, mockVariables, values)
      );

      expect(result.current.preview).toBe("Hello John Doe!");
    });

    it("devrait laisser les placeholders si aucune valeur ni défaut", () => {
      const variablesWithoutDefaults: Variable[] = [
        {
          ...mockVariables[0],
          default_value: "",
        },
      ];
      const content = "Hello {{firstName}}!";
      const values = {};

      const { result } = renderHook(() =>
        useVariableSubstitution(content, variablesWithoutDefaults, values)
      );

      expect(result.current.preview).toBe("Hello {{firstName}}!");
    });

    it("devrait gérer les variables multiples du même nom", () => {
      const content = "{{name}} is {{name}} and {{name}}!";
      const variables: Variable[] = [
        {
          id: "1",
          prompt_id: "prompt-1",
          name: "name",
          type: "STRING",
          default_value: "",
          required: false,
          order_index: 0,
          help: "",
          pattern: "",
          options: [],
          created_at: "2024-01-01",
        },
      ];
      const values = { name: "Bob" };

      const { result } = renderHook(() =>
        useVariableSubstitution(content, variables, values)
      );

      expect(result.current.preview).toBe("Bob is Bob and Bob!");
    });

    it("devrait recalculer quand les valeurs changent", () => {
      const content = "Hello {{firstName}}!";
      const { result, rerender } = renderHook(
        ({ values }) => useVariableSubstitution(content, mockVariables, values),
        { initialProps: { values: { firstName: "Alice" } } }
      );

      expect(result.current.preview).toBe("Hello Alice!");

      rerender({ values: { firstName: "Bob" } });

      expect(result.current.preview).toBe("Hello Bob!");
    });
  });
});
