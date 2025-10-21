import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useVariableManager } from "../useVariableManager";
import type { Variable } from "@/features/prompts/types";

// Mock des hooks de dépendance
vi.mock("../useToastNotifier", () => ({
  useToastNotifier: () => ({
    notifySuccess: vi.fn(),
    notifyInfo: vi.fn(),
    notifyError: vi.fn(),
    notifyWarning: vi.fn(),
  }),
}));

vi.mock("../useVariableDetection", () => ({
  useVariableDetection: (content: string) => {
    // Extraction simple des variables pour les tests
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
    return { detectedNames: Array.from(matches) };
  },
}));

describe("useVariableManager", () => {
  const mockVariables: Variable[] = [
    {
      id: "1",
      prompt_id: "prompt-1",
      name: "firstName",
      type: "STRING",
      default_value: "John",
      required: false,
      order_index: 0,
      help: "User's first name",
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
      help: "User's last name",
      pattern: "",
      options: [],
      created_at: "2024-01-01",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialisation", () => {
    it("devrait initialiser avec les variables fournies", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}} {{lastName}}!",
          initialVariables: mockVariables,
        })
      );

      expect(result.current.variables).toHaveLength(2);
      expect(result.current.variables[0].name).toBe("firstName");
      expect(result.current.variables[1].name).toBe("lastName");
    });

    it("devrait initialiser avec un tableau vide si aucune variable initiale", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "No variables here",
          initialVariables: [],
        })
      );

      expect(result.current.variables).toEqual([]);
    });
  });

  describe("détection automatique des variables (addVariablesFromContent)", () => {
    it("devrait ajouter de nouvelles variables détectées dans le contenu", async () => {
      const content = "Hello {{name}} and {{age}}!";
      const { result } = renderHook(() =>
        useVariableManager({
          content,
          initialVariables: [],
        })
      );

      expect(result.current.variables).toHaveLength(0);

      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      const variableNames = result.current.variables.map((v) => v.name);
      expect(variableNames).toContain("name");
      expect(variableNames).toContain("age");
    });

    it("ne devrait pas ajouter de variables déjà existantes", async () => {
      const content = "Hello {{firstName}} {{lastName}}!";
      const { result } = renderHook(() =>
        useVariableManager({
          content,
          initialVariables: mockVariables,
        })
      );

      expect(result.current.variables).toHaveLength(2);

      act(() => {
        result.current.addVariablesFromContent();
      });

      // Le nombre de variables ne devrait pas changer
      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });
    });

    it("devrait ajouter uniquement les nouvelles variables", async () => {
      const content = "Hello {{firstName}} {{age}}!"; // firstName existe, age est nouveau
      const { result } = renderHook(() =>
        useVariableManager({
          content,
          initialVariables: [mockVariables[0]], // Seulement firstName
        })
      );

      expect(result.current.variables).toHaveLength(1);

      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      const variableNames = result.current.variables.map((v) => v.name);
      expect(variableNames).toContain("firstName");
      expect(variableNames).toContain("age");
    });

    it("devrait définir les bonnes propriétés par défaut pour les nouvelles variables", async () => {
      const content = "Hello {{newVar}}!";
      const { result } = renderHook(() =>
        useVariableManager({
          content,
          initialVariables: [],
        })
      );

      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
      });

      const newVar = result.current.variables[0];
      expect(newVar.name).toBe("newVar");
      expect(newVar.type).toBe("STRING");
      expect(newVar.required).toBe(false);
      expect(newVar.default_value).toBe("");
      expect(newVar.help).toBe("");
      expect(newVar.order_index).toBe(0);
    });

    it("devrait incrémenter order_index correctement", async () => {
      const content = "Hello {{var1}} {{var2}} {{var3}}!";
      const { result } = renderHook(() =>
        useVariableManager({
          content,
          initialVariables: [],
        })
      );

      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(3);
      });

      expect(result.current.variables[0].order_index).toBe(0);
      expect(result.current.variables[1].order_index).toBe(1);
      expect(result.current.variables[2].order_index).toBe(2);
    });
  });

  describe("suppression automatique des variables non détectées", () => {
    it("devrait supprimer les variables qui ne sont plus dans le contenu", async () => {
      const { result, rerender } = renderHook(
        ({ content }) =>
          useVariableManager({
            content,
            initialVariables: mockVariables,
          }),
        { initialProps: { content: "Hello {{firstName}} {{lastName}}!" } }
      );

      expect(result.current.variables).toHaveLength(2);

      // Changer le contenu pour ne garder que firstName
      rerender({ content: "Hello {{firstName}}!" });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
        expect(result.current.variables[0].name).toBe("firstName");
      });
    });

    it("devrait supprimer toutes les variables si le contenu n'en contient plus", async () => {
      const { result, rerender } = renderHook(
        ({ content }) =>
          useVariableManager({
            content,
            initialVariables: mockVariables,
          }),
        { initialProps: { content: "Hello {{firstName}} {{lastName}}!" } }
      );

      expect(result.current.variables).toHaveLength(2);

      rerender({ content: "No variables here!" });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(0);
      });
    });

    it("ne devrait rien supprimer si toutes les variables sont toujours présentes", async () => {
      const content = "Hello {{firstName}} {{lastName}}!";
      const { result, rerender } = renderHook(
        ({ content }) =>
          useVariableManager({
            content,
            initialVariables: mockVariables,
          }),
        { initialProps: { content } }
      );

      expect(result.current.variables).toHaveLength(2);

      // Même contenu, juste reformaté
      rerender({ content: "Hello {{firstName}} and {{lastName}}!!!" });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });
    });
  });

  describe("mise à jour de variables (updateVariable)", () => {
    it("devrait mettre à jour une variable à un index donné", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}} {{lastName}}!",
          initialVariables: mockVariables,
        })
      );

      const updatedVariable: Variable = {
        ...mockVariables[0],
        default_value: "Alice",
        help: "Updated help text",
      };

      act(() => {
        result.current.updateVariable(0, updatedVariable);
      });

      expect(result.current.variables[0].default_value).toBe("Alice");
      expect(result.current.variables[0].help).toBe("Updated help text");
      // La deuxième variable ne devrait pas changer
      expect(result.current.variables[1]).toEqual(mockVariables[1]);
    });

    it("devrait mettre à jour le type d'une variable", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}}!",
          initialVariables: [mockVariables[0]],
        })
      );

      const updatedVariable: Variable = {
        ...mockVariables[0],
        type: "ENUM",
        options: ["Option1", "Option2"],
      };

      act(() => {
        result.current.updateVariable(0, updatedVariable);
      });

      expect(result.current.variables[0].type).toBe("ENUM");
      expect(result.current.variables[0].options).toEqual(["Option1", "Option2"]);
    });
  });

  describe("suppression de variables (deleteVariable)", () => {
    it("devrait supprimer une variable à un index donné", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}} {{lastName}}!",
          initialVariables: mockVariables,
        })
      );

      expect(result.current.variables).toHaveLength(2);

      act(() => {
        result.current.deleteVariable(0);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("lastName");
    });

    it("devrait supprimer la dernière variable", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}} {{lastName}}!",
          initialVariables: mockVariables,
        })
      );

      act(() => {
        result.current.deleteVariable(1);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("firstName");
    });

    it("devrait gérer la suppression de toutes les variables", () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{firstName}} {{lastName}}!",
          initialVariables: mockVariables,
        })
      );

      act(() => {
        result.current.deleteVariable(0);
      });

      expect(result.current.variables).toHaveLength(1);

      act(() => {
        result.current.deleteVariable(0);
      });

      expect(result.current.variables).toHaveLength(0);
    });
  });

  describe("scénarios d'intégration", () => {
    it("devrait gérer un workflow complet : ajout, mise à jour, suppression", async () => {
      const { result } = renderHook(() =>
        useVariableManager({
          content: "Hello {{name}}!",
          initialVariables: [],
        })
      );

      // 1. Ajouter des variables depuis le contenu
      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
        expect(result.current.variables[0].name).toBe("name");
      });

      // 2. Mettre à jour la variable
      const updatedVar: Variable = {
        ...result.current.variables[0],
        default_value: "Bob",
        help: "User name",
        required: true,
      };

      act(() => {
        result.current.updateVariable(0, updatedVar);
      });

      expect(result.current.variables[0].default_value).toBe("Bob");
      expect(result.current.variables[0].help).toBe("User name");
      expect(result.current.variables[0].required).toBe(true);

      // 3. Supprimer la variable
      act(() => {
        result.current.deleteVariable(0);
      });

      expect(result.current.variables).toHaveLength(0);
    });

    it("devrait synchroniser automatiquement avec le contenu changeant", async () => {
      const { result, rerender } = renderHook(
        ({ content }) =>
          useVariableManager({
            content,
            initialVariables: [],
          }),
        { initialProps: { content: "Hello {{var1}}!" } }
      );

      // Ajouter var1
      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
      });

      // Changer le contenu pour ajouter var2 et var3
      rerender({ content: "Hello {{var1}} {{var2}} {{var3}}!" });

      act(() => {
        result.current.addVariablesFromContent();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(3);
      });

      // Supprimer var2 du contenu (synchronisation auto)
      rerender({ content: "Hello {{var1}} {{var3}}!" });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
        const names = result.current.variables.map((v) => v.name);
        expect(names).toContain("var1");
        expect(names).toContain("var3");
        expect(names).not.toContain("var2");
      });
    });
  });
});
