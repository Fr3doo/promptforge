import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePromptForm } from "../usePromptForm";
import type { Prompt, Variable } from "../../types";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock usePrompts hooks
vi.mock("@/hooks/usePrompts", () => ({
  useCreatePrompt: () => ({
    mutate: vi.fn((data, options) => options?.onSuccess?.(data)),
    isPending: false,
  }),
  useUpdatePrompt: () => ({
    mutate: vi.fn((data, options) => options?.onSuccess?.()),
    isPending: false,
  }),
}));

// Mock useVariables hooks
vi.mock("@/hooks/useVariables", () => ({
  useBulkUpsertVariables: () => ({
    mutate: vi.fn(),
  }),
}));

// Mock toast notifier
vi.mock("@/hooks/useToastNotifier", () => ({
  useToastNotifier: () => ({
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
    notifyInfo: vi.fn(),
    notifyWarning: vi.fn(),
    notifyLoading: vi.fn(() => ({
      id: 'mock-toast',
      dismiss: vi.fn(),
      update: vi.fn(),
    })),
  }),
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

  describe("Initialization", () => {
    it("should initialize with empty form in create mode", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.title).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.content).toBe("");
      expect(result.current.tags).toEqual([]);
      expect(result.current.variables).toEqual([]);
      expect(result.current.isSaving).toBe(false);
    });

    it("should initialize with existing prompt data in edit mode", async () => {
      const mockPrompt: Prompt = {
        id: "prompt-123",
        title: "Existing Prompt",
        description: "Description",
        content: "Content with {{var1}}",
        tags: ["tag1", "tag2"],
        visibility: "SHARED",
        owner_id: "user-123",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        public_permission: "READ" as const,
      };

      const { result } = renderHook(
        () => usePromptForm({ prompt: mockPrompt, isEditMode: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.title).toBe("Existing Prompt");
        expect(result.current.description).toBe("Description");
        expect(result.current.content).toBe("Content with {{var1}}");
        expect(result.current.tags).toEqual(["tag1", "tag2"]);
      });
    });

    it("should handle null description gracefully", async () => {
      const mockPrompt: Prompt = {
        id: "prompt-123",
        title: "Prompt",
        description: null,
        content: "Content",
        tags: [],
        visibility: "PRIVATE",
        owner_id: "user-123",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        public_permission: "READ" as const,
      };

      const { result } = renderHook(
        () => usePromptForm({ prompt: mockPrompt, isEditMode: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.description).toBe("");
      });
    });

    it("should initialize with existing variables", () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "variable1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01",
        },
      ];

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false, existingVariables: mockVariables }),
        { wrapper: createWrapper() }
      );

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("variable1");
    });
  });

  describe("Tag Management", () => {
    it("should add a tag", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("newtag");
        result.current.addTag();
      });

      expect(result.current.tags).toContain("newtag");
      expect(result.current.tagInput).toBe("");
    });

    it("should not add duplicate tags", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag1");
        result.current.addTag();
      });

      expect(result.current.tags.filter((t) => t === "tag1")).toHaveLength(1);
    });

    it("should remove a tag", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag2");
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(2);

      act(() => {
        result.current.removeTag("tag1");
      });

      expect(result.current.tags).toEqual(["tag2"]);
    });

    it("should trim whitespace when adding tags", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("  tag with spaces  ");
        result.current.addTag();
      });

      expect(result.current.tags).toContain("tag with spaces");
    });

    it("should not add empty tags", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("   ");
        result.current.addTag();
      });

      expect(result.current.tags).toHaveLength(0);
    });
  });

  describe("Variable Detection and Management", () => {
    it("should detect variables from content", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setContent("Hello {{name}}, your age is {{age}}");
      });

      await waitFor(() => {
        expect(result.current.content).toBe("Hello {{name}}, your age is {{age}}");
      });

      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      expect(result.current.variables.some((v) => v.name === "name")).toBe(true);
      expect(result.current.variables.some((v) => v.name === "age")).toBe(true);
    });

    it("should not add duplicate variables when detecting", async () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "existingVar",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01",
        },
      ];

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false, existingVariables: mockVariables }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setContent("Content with {{existingVar}} and {{newVar}}");
      });

      await waitFor(() => {
        expect(result.current.content).toContain("existingVar");
      });

      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      expect(result.current.variables.filter((v) => v.name === "existingVar")).toHaveLength(1);
    });

    it("should auto-remove variables deleted from content", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      // Add content with variables and detect them
      act(() => {
        result.current.setContent("Hello {{name}} and {{age}}");
      });

      await waitFor(() => {
        expect(result.current.content).toContain("name");
      });

      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      // Remove one variable from content
      act(() => {
        result.current.setContent("Hello {{name}}");
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
        expect(result.current.variables[0].name).toBe("name");
      });
    });

    it("should update a variable", () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "var1",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01",
        },
      ];

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false, existingVariables: mockVariables }),
        { wrapper: createWrapper() }
      );

      const updatedVariable = {
        ...result.current.variables[0],
        type: "NUMBER" as const,
        required: true,
      };

      act(() => {
        result.current.updateVariable(0, updatedVariable);
      });

      expect(result.current.variables[0].type).toBe("NUMBER");
      expect(result.current.variables[0].required).toBe(true);
    });

    it("should delete a variable", () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "var1",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01",
        },
        {
          id: "var-2",
          prompt_id: "prompt-123",
          name: "var2",
          type: "NUMBER",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 1,
          created_at: "2024-01-01",
        },
      ];

      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false, existingVariables: mockVariables }),
        { wrapper: createWrapper() }
      );

      expect(result.current.variables).toHaveLength(2);

      act(() => {
        result.current.deleteVariable(0);
      });

      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("var2");
    });
  });

  describe("Form Submission", () => {
    it("should save in create mode with all form data", async () => {
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

      act(() => {
        result.current.setTitle("New Prompt");
        result.current.setDescription("Description");
        result.current.setContent("Content");
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSavePrompt).toHaveBeenCalledWith(
        {
          title: "New Prompt",
          description: "Description",
          content: "Content",
          tags: [],
          visibility: "PRIVATE",
          variables: [],
        },
        undefined
      );
    });

    it("should save in edit mode with promptId", async () => {
      const mockSavePrompt = vi.fn().mockResolvedValue(undefined);
      const { usePromptSave } = await import("@/hooks/usePromptSave");
      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: mockSavePrompt,
        isSaving: false,
      });

      const mockPrompt: Prompt = {
        id: "prompt-123",
        title: "Existing",
        description: "Desc",
        content: "Content",
        tags: [],
        visibility: "PRIVATE",
        owner_id: "user-123",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        public_permission: "READ" as const,
      };

      const { result } = renderHook(
        () => usePromptForm({ prompt: mockPrompt, isEditMode: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.title).toBe("Existing");
      });

      act(() => {
        result.current.setTitle("Updated Title");
      });

      await act(async () => {
        await result.current.handleSave("prompt-123");
      });

      expect(mockSavePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated Title",
        }),
        "prompt-123"
      );
    });

    it("should save with detected variables", async () => {
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

      act(() => {
        result.current.setTitle("Prompt with vars");
        result.current.setContent("Hello {{name}}");
      });

      await waitFor(() => {
        expect(result.current.content).toContain("name");
      });

      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(1);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSavePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.arrayContaining([
            expect.objectContaining({ name: "name" }),
          ]),
        }),
        undefined
      );
    });

    it("should save with tags", async () => {
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

      act(() => {
        result.current.setTitle("Tagged Prompt");
        result.current.setContent("Content");
        result.current.setTagInput("tag1");
        result.current.addTag();
        result.current.setTagInput("tag2");
        result.current.addTag();
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSavePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ["tag1", "tag2"],
        }),
        undefined
      );
    });
  });

  describe("Complete Workflow - Create Mode", () => {
    it("should handle complete creation workflow with tags and variables", async () => {
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

      // Fill form
      act(() => {
        result.current.setTitle("Complete Prompt");
        result.current.setDescription("Full description");
        result.current.setContent("Hello {{name}}, you are {{age}} years old");
        result.current.setTagInput("react");
        result.current.addTag();
        result.current.setTagInput("typescript");
        result.current.addTag();
      });

      await waitFor(() => {
        expect(result.current.content).toContain("name");
      });

      // Detect variables
      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables).toHaveLength(2);
      });

      // Save
      await act(async () => {
        await result.current.handleSave();
      });

    expect(mockSavePrompt).toHaveBeenCalledWith(
      {
        title: "Complete Prompt",
        description: "Full description",
        content: "Hello {{name}}, you are {{age}} years old",
        visibility: "PRIVATE",
        tags: ["react", "typescript"],
        variables: expect.arrayContaining([
          expect.objectContaining({ name: "name" }),
          expect.objectContaining({ name: "age" }),
        ]),
      },
      undefined
    );
    });
  });

  describe("Complete Workflow - Edit Mode", () => {
    it("should handle complete edit workflow", async () => {
      const mockSavePrompt = vi.fn().mockResolvedValue(undefined);
      const { usePromptSave } = await import("@/hooks/usePromptSave");
      vi.mocked(usePromptSave).mockReturnValue({
        savePrompt: mockSavePrompt,
        isSaving: false,
      });

      const mockPrompt: Prompt = {
        id: "prompt-123",
        title: "Original Title",
        description: "Original Description",
        content: "Content with {{oldVar}}",
        tags: ["oldtag"],
        visibility: "PRIVATE",
        owner_id: "user-123",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        public_permission: "READ" as const,
      };

      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "oldVar",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01",
        },
      ];

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
        expect(result.current.title).toBe("Original Title");
      });

      // Modify form
      act(() => {
        result.current.setTitle("Updated Title");
        result.current.setContent("New content with {{newVar}}");
        result.current.setTagInput("newtag");
        result.current.addTag();
      });

      await waitFor(() => {
        expect(result.current.content).toContain("newVar");
      });

      // Variables should auto-sync (oldVar removed, need to detect newVar)
      act(() => {
        result.current.detectVariables();
      });

      await waitFor(() => {
        expect(result.current.variables.some((v) => v.name === "newVar")).toBe(true);
      });

      // Save
      await act(async () => {
        await result.current.handleSave("prompt-123");
      });

      expect(mockSavePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Updated Title",
          content: "New content with {{newVar}}",
          tags: expect.arrayContaining(["oldtag", "newtag"]),
        }),
        "prompt-123"
      );
    });
  });

  describe("State Management", () => {
    it("should manage variable values independently", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setVariableValues({
          var1: "value1",
          var2: "value2",
        });
      });

      expect(result.current.variableValues).toEqual({
        var1: "value1",
        var2: "value2",
      });
    });

    it("should expose isSaving state correctly", async () => {
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

  describe("Validation - Negative Tests (Task 6 & 8)", () => {
    it("should show error when title is empty", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTitle("");
        result.current.setContent("Some content");
      });

      await waitFor(() => {
        expect(result.current.validationErrors.title).toBeDefined();
        expect(result.current.validationErrors.title).toBe("Le titre est requis");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should show error when content is empty", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTitle("Valid Title");
        result.current.setContent("");
      });

      await waitFor(() => {
        expect(result.current.validationErrors.content).toBeDefined();
        expect(result.current.validationErrors.content).toBe("Le contenu est requis");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should show error when title exceeds 200 characters", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      const longTitle = "a".repeat(201);

      act(() => {
        result.current.setTitle(longTitle);
        result.current.setContent("Content");
      });

      await waitFor(() => {
        expect(result.current.validationErrors.title).toBeDefined();
        expect(result.current.validationErrors.title).toBe("Le titre ne peut pas dépasser 200 caractères");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should show error when description exceeds 3000 characters", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      const longDescription = "a".repeat(3001);

      act(() => {
        result.current.setTitle("Title");
        result.current.setContent("Content");
        result.current.setDescription(longDescription);
      });

      await waitFor(() => {
        expect(result.current.validationErrors.description).toBeDefined();
        expect(result.current.validationErrors.description).toBe("La description ne peut pas dépasser 3000 caractères");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should show error when more than 20 tags are added", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTitle("Title");
        result.current.setContent("Content");
        
        // Add 21 tags
        for (let i = 1; i <= 21; i++) {
          result.current.setTagInput(`tag${i}`);
          result.current.addTag();
        }
      });

      await waitFor(() => {
        expect(result.current.validationErrors.tags).toBeDefined();
        expect(result.current.validationErrors.tags).toBe("Vous ne pouvez pas avoir plus de 20 tags");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should not add duplicate tags", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTagInput("duplicate");
        result.current.addTag();
        result.current.setTagInput("duplicate");
        result.current.addTag();
      });

      expect(result.current.tags.filter(t => t === "duplicate")).toHaveLength(1);
    });

    it("should validate form is valid with correct data", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTitle("Valid Title");
        result.current.setDescription("Valid description under 3000 chars");
        result.current.setContent("Valid content");
        result.current.setTagInput("tag1");
        result.current.addTag();
      });

      await waitFor(() => {
        expect(result.current.validationErrors).toEqual({});
        expect(result.current.isFormValid).toBe(true);
      });
    });

    it("should prevent saving when form is invalid", async () => {
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

      act(() => {
        result.current.setTitle(""); // Invalid: empty title
        result.current.setContent("Some content");
      });

      await waitFor(() => {
        expect(result.current.isFormValid).toBe(false);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      // Should not call savePrompt because form is invalid
      expect(mockSavePrompt).not.toHaveBeenCalled();
    });

    it("should allow saving when all validations pass", async () => {
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

      act(() => {
        result.current.setTitle("Valid Title");
        result.current.setDescription("Valid Description");
        result.current.setContent("Valid Content");
      });

      await waitFor(() => {
        expect(result.current.isFormValid).toBe(true);
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockSavePrompt).toHaveBeenCalled();
    });

    it("should trim whitespace before validation", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.setTitle("   Valid Title   ");
        result.current.setContent("   Valid Content   ");
        result.current.setDescription("   Valid Description   ");
      });

      await waitFor(() => {
        expect(result.current.validationErrors).toEqual({});
        expect(result.current.isFormValid).toBe(true);
      });
    });

    it("should show error for content exceeding 200000 characters", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      const veryLongContent = "a".repeat(200001);

      act(() => {
        result.current.setTitle("Title");
        result.current.setContent(veryLongContent);
      });

      await waitFor(() => {
        expect(result.current.validationErrors.content).toBeDefined();
        expect(result.current.validationErrors.content).toBe("Le contenu ne peut pas dépasser 200000 caractères");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should validate tag length does not exceed 50 characters", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      const longTag = "a".repeat(51);

      act(() => {
        result.current.setTitle("Title");
        result.current.setContent("Content");
        result.current.setTagInput(longTag);
        result.current.addTag();
      });

      await waitFor(() => {
        expect(result.current.validationErrors.tags).toBeDefined();
        expect(result.current.validationErrors.tags).toContain("ne peut pas dépasser 50 caractères");
        expect(result.current.isFormValid).toBe(false);
      });
    });

    it("should clear validation errors when errors are fixed", async () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      // Start with invalid data
      act(() => {
        result.current.setTitle("");
        result.current.setContent("");
      });

      await waitFor(() => {
        expect(result.current.validationErrors.title).toBeDefined();
        expect(result.current.validationErrors.content).toBeDefined();
        expect(result.current.isFormValid).toBe(false);
      });

      // Fix the errors
      act(() => {
        result.current.setTitle("Valid Title");
        result.current.setContent("Valid Content");
      });

      await waitFor(() => {
        expect(result.current.validationErrors).toEqual({});
        expect(result.current.isFormValid).toBe(true);
      });
    });

    it("should not validate if no fields are filled", () => {
      const { result } = renderHook(
        () => usePromptForm({ isEditMode: false }),
        { wrapper: createWrapper() }
      );

      // Empty form should not trigger validation
      expect(result.current.validationErrors).toEqual({});
      expect(result.current.isFormValid).toBe(false); // But still not valid because title and content are required
    });
  });
});

