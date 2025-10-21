import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePromptForm } from "../usePromptForm";
import type { Prompt, Variable } from "../../types";

// Mock des hooks dépendants
vi.mock("@/hooks/usePromptSave", () => ({
  usePromptSave: vi.fn(() => ({
    savePrompt: vi.fn().mockResolvedValue(undefined),
    isSaving: false,
  })),
}));

vi.mock("@/hooks/useTagManager", () => ({
  useTagManager: vi.fn(() => ({
    tags: [],
    setTags: vi.fn(),
    tagInput: "",
    setTagInput: vi.fn(),
    addTag: vi.fn(),
    removeTag: vi.fn(),
  })),
}));

vi.mock("@/hooks/useVariableManager", () => ({
  useVariableManager: vi.fn(() => ({
    variables: [],
    addVariablesFromContent: vi.fn(),
    updateVariable: vi.fn(),
    deleteVariable: vi.fn(),
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePromptForm - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Création d'un nouveau prompt", () => {
    it("initialise le formulaire en mode création avec des valeurs par défaut", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.title).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.content).toBe("");
      expect(result.current.visibility).toBe("PRIVATE");
      expect(result.current.isSaving).toBe(false);
    });

    it("permet de modifier le titre, description et contenu", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      result.current.setTitle("Test Prompt");
      result.current.setDescription("Test Description");
      result.current.setContent("Contenu avec {{variable}}");

      expect(result.current.title).toBe("Test Prompt");
      expect(result.current.description).toBe("Test Description");
      expect(result.current.content).toBe("Contenu avec {{variable}}");
    });

    it("permet de gérer la visibilité du prompt", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      result.current.setVisibility("SHARED");
      expect(result.current.visibility).toBe("SHARED");
    });

    it("appelle savePrompt avec les bonnes données lors de la sauvegarde", async () => {
      const mockSavePrompt = vi.fn().mockResolvedValue(undefined);
      const { usePromptSave } = await import("@/hooks/usePromptSave");
      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: mockSavePrompt,
        isSaving: false,
      });

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      result.current.setTitle("Test Prompt");
      result.current.setDescription("Test Description");
      result.current.setContent("Contenu test");

      await result.current.handleSave();

      await waitFor(() => {
        expect(mockSavePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Test Prompt",
            description: "Test Description",
            content: "Contenu test",
          }),
          undefined
        );
      });
    });
  });

  describe("Édition d'un prompt existant", () => {
    const mockPrompt: Prompt = {
      id: "prompt-123",
      title: "Prompt Existant",
      description: "Description existante",
      content: "Contenu avec {{var1}} et {{var2}}",
      tags: ["tag1", "tag2"],
      visibility: "SHARED",
      owner_id: "user-123",
      version: "1.0.0",
      status: "PUBLISHED",
      is_favorite: false,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const mockVariables: Variable[] = [
      {
        id: "var-1",
        prompt_id: "prompt-123",
        name: "var1",
        type: "STRING",
        required: true,
        default_value: "",
        help: "Variable 1",
        pattern: "",
        options: [],
        order_index: 0,
        created_at: "2024-01-01",
      },
      {
        id: "var-2",
        prompt_id: "prompt-123",
        name: "var2",
        type: "NUMBER",
        required: false,
        default_value: "0",
        help: "Variable 2",
        pattern: "",
        options: [],
        order_index: 1,
        created_at: "2024-01-01",
      },
    ];

    it("initialise le formulaire avec les données du prompt existant", async () => {
      const { result } = renderHook(
        () =>
          usePromptForm({
            prompt: mockPrompt,
            existingVariables: mockVariables,
            isEditMode: true,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.title).toBe("Prompt Existant");
        expect(result.current.description).toBe("Description existante");
        expect(result.current.content).toBe("Contenu avec {{var1}} et {{var2}}");
        expect(result.current.visibility).toBe("SHARED");
      });
    });

    it("appelle savePrompt avec l'ID du prompt en mode édition", async () => {
      const mockSavePrompt = vi.fn().mockResolvedValue(undefined);
      const { usePromptSave } = await import("@/hooks/usePromptSave");
      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: mockSavePrompt,
        isSaving: false,
      });

      const { result } = renderHook(
        () =>
          usePromptForm({
            prompt: mockPrompt,
            existingVariables: mockVariables,
            isEditMode: true,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.title).toBe("Prompt Existant");
      });

      result.current.setTitle("Titre Modifié");
      await result.current.handleSave(mockPrompt.id);

      await waitFor(() => {
        expect(mockSavePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Titre Modifié",
          }),
          mockPrompt.id
        );
      });
    });
  });

  describe("Gestion des tags", () => {
    it("expose les méthodes de gestion des tags", async () => {
      const mockAddTag = vi.fn();
      const mockRemoveTag = vi.fn();
      const { useTagManager } = await import("@/hooks/useTagManager");
      
      vi.mocked(useTagManager).mockReturnValue({
        tags: ["tag1", "tag2"],
        setTags: vi.fn(),
        tagInput: "nouveau-tag",
        setTagInput: vi.fn(),
        addTag: mockAddTag,
        removeTag: mockRemoveTag,
      });

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.tags).toEqual(["tag1", "tag2"]);
      expect(result.current.tagInput).toBe("nouveau-tag");
      expect(result.current.addTag).toBeDefined();
      expect(result.current.removeTag).toBeDefined();
    });
  });

  describe("Gestion des variables", () => {
    it("expose les méthodes de gestion des variables", async () => {
      const mockAddVariablesFromContent = vi.fn();
      const mockUpdateVariable = vi.fn();
      const mockDeleteVariable = vi.fn();
      const { useVariableManager } = await import("@/hooks/useVariableManager");
      
      vi.mocked(useVariableManager).mockReturnValue({
        variables: [
          {
            id: "var-1",
            prompt_id: "prompt-123",
            name: "var1",
            type: "STRING",
            required: true,
            order_index: 0,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
            created_at: "2024-01-01",
          } as Variable,
          {
            id: "var-2",
            prompt_id: "prompt-123",
            name: "var2",
            type: "NUMBER",
            required: false,
            order_index: 1,
            default_value: "0",
            help: "",
            pattern: "",
            options: [],
            created_at: "2024-01-01",
          } as Variable,
        ],
        addVariablesFromContent: mockAddVariablesFromContent,
        updateVariable: mockUpdateVariable,
        deleteVariable: mockDeleteVariable,
      });

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.variables).toHaveLength(2);
      expect(result.current.detectVariables).toBe(mockAddVariablesFromContent);
      expect(result.current.updateVariable).toBe(mockUpdateVariable);
      expect(result.current.deleteVariable).toBe(mockDeleteVariable);
    });

    it("initialise les variables depuis existingVariables", async () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "test",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01",
        },
      ];

      const { useVariableManager } = await import("@/hooks/useVariableManager");
      vi.mocked(useVariableManager).mockReturnValue({
        variables: mockVariables,
        addVariablesFromContent: vi.fn(),
        updateVariable: vi.fn(),
        deleteVariable: vi.fn(),
      });

      const { result } = renderHook(
        () =>
          usePromptForm({
            existingVariables: mockVariables,
            isEditMode: true,
          }),
        { wrapper: createWrapper() }
      );

      expect(useVariableManager).toHaveBeenCalledWith(
        expect.objectContaining({
          initialVariables: mockVariables,
        })
      );
    });
  });

  describe("Gestion de l'état de sauvegarde", () => {
    it("indique quand une sauvegarde est en cours", async () => {
      const { usePromptSave } = await import("@/hooks/usePromptSave");
      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: vi.fn(),
        isSaving: true,
      });

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isSaving).toBe(true);
    });
  });

  describe("Gestion des valeurs de variables", () => {
    it("permet de gérer les valeurs des variables", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      result.current.setVariableValues({ var1: "value1", var2: "value2" });

      expect(result.current.variableValues).toEqual({
        var1: "value1",
        var2: "value2",
      });
    });
  });

  describe("Scénario complet - Création d'un prompt avec variables et tags", () => {
    it("gère le cycle complet de création", async () => {
      const mockSavePrompt = vi.fn().mockResolvedValue(undefined);
      const mockAddTag = vi.fn();
      const mockAddVariables = vi.fn();

      const { usePromptSave } = await import("@/hooks/usePromptSave");
      const { useTagManager } = await import("@/hooks/useTagManager");
      const { useVariableManager } = await import("@/hooks/useVariableManager");

      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: mockSavePrompt,
        isSaving: false,
      });

      vi.mocked(useTagManager).mockReturnValue({
        tags: ["react", "typescript"],
        setTags: vi.fn(),
        tagInput: "",
        setTagInput: vi.fn(),
        addTag: mockAddTag,
        removeTag: vi.fn(),
      });

      vi.mocked(useVariableManager).mockReturnValue({
        variables: [
          {
            name: "name",
            type: "STRING",
            required: true,
            order_index: 0,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
          } as Variable,
        ],
        addVariablesFromContent: mockAddVariables,
        updateVariable: vi.fn(),
        deleteVariable: vi.fn(),
      });

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      // Simulation du remplissage du formulaire
      result.current.setTitle("Mon Prompt");
      result.current.setDescription("Description détaillée");
      result.current.setContent("Bonjour {{name}}, comment allez-vous ?");
      result.current.setVisibility("SHARED");

      // Vérification de l'état
      expect(result.current.title).toBe("Mon Prompt");
      expect(result.current.tags).toEqual(["react", "typescript"]);
      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("name");

      // Sauvegarde
      await result.current.handleSave();

      await waitFor(() => {
        expect(mockSavePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Mon Prompt",
            description: "Description détaillée",
            content: "Bonjour {{name}}, comment allez-vous ?",
            visibility: "SHARED",
            tags: ["react", "typescript"],
            variables: expect.arrayContaining([
              expect.objectContaining({
                name: "name",
                type: "STRING",
                required: true,
              }),
            ]),
          }),
          undefined
        );
      });
    });
  });
});
