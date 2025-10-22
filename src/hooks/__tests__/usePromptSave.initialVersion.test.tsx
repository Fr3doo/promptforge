import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePromptSave } from "../usePromptSave";
import * as supabaseModule from "@/integrations/supabase/client";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123" },
    loading: false,
  }),
}));

// Mock toast notifier
const mockNotifyPromptCreated = vi.fn();
const mockNotifyPromptUpdated = vi.fn();
const mockNotifyError = vi.fn();
const mockNotifyValidationError = vi.fn();

vi.mock("@/hooks/useToastNotifier", () => ({
  useToastNotifier: () => ({
    notifyPromptCreated: mockNotifyPromptCreated,
    notifyPromptUpdated: mockNotifyPromptUpdated,
    notifyError: mockNotifyError,
    notifyValidationError: mockNotifyValidationError,
    notifyNetworkError: vi.fn(),
    notifyServerError: vi.fn(),
    notifyPermissionError: vi.fn(),
  }),
}));

// Mock sonner toast
const mockToastWarning = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    warning: mockToastWarning,
  },
}));

// Mock prompts hooks
const mockCreatePrompt = vi.fn();
const mockUpdatePrompt = vi.fn();

vi.mock("@/hooks/usePrompts", () => ({
  useCreatePrompt: () => ({
    mutate: mockCreatePrompt,
    isPending: false,
  }),
  useUpdatePrompt: () => ({
    mutate: mockUpdatePrompt,
    isPending: false,
  }),
  usePrompt: () => ({
    data: null,
  }),
}));

// Mock variables hooks
const mockSaveVariables = vi.fn();

vi.mock("@/hooks/useVariables", () => ({
  useBulkUpsertVariables: () => ({
    mutate: mockSaveVariables,
  }),
}));

// Mock optimistic locking
vi.mock("@/hooks/useOptimisticLocking", () => ({
  useOptimisticLocking: () => ({
    checkForConflicts: vi.fn(),
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

describe("usePromptSave - Initial Version Workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Scénario 1: Création Complète avec Succès", () => {
    it("should create prompt, save variables, and create initial version successfully", async () => {
      // Mock successful edge function call
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: {
          success: true,
          version: {
            id: "version-1",
            semver: "1.0.0",
            content: "Test content",
          },
        },
        error: null,
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      // Mock successful prompt creation
      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        const newPrompt = {
          id: "prompt-123",
          title: data.title,
          content: data.content,
          description: data.description,
          tags: data.tags,
          visibility: data.visibility,
          version: "1.0.0",
        };
        onSuccess?.(newPrompt);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Test Prompt",
        description: null,
        content: "Test content with {{variable1}}",
        tags: ["test"],
        visibility: "PRIVATE" as const,
        variables: [
          {
            id: "var-1",
            prompt_id: "prompt-123",
            name: "variable1",
            type: "STRING" as const,
            required: true,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier que le prompt a été créé
      expect(mockCreatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Prompt",
          content: "Test content with {{variable1}}",
        }),
        expect.any(Object)
      );

      // Vérifier que les variables ont été sauvegardées
      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: "prompt-123",
          variables: expect.arrayContaining([
            expect.objectContaining({
              name: "variable1",
              type: "STRING",
            }),
          ]),
        });
      });

      // Vérifier que l'edge function a été appelée
      await waitFor(() => {
        expect(mockEdgeFunctionInvoke).toHaveBeenCalledWith(
          "create-initial-version",
          expect.objectContaining({
            body: expect.objectContaining({
              prompt_id: "prompt-123",
              semver: "1.0.0",
              message: "Version initiale",
            }),
          })
        );
      });

      // Vérifier la notification de succès
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalledWith("Test Prompt");
      });

      // Vérifier la navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/prompts?justCreated=prompt-123");
      });

      // Pas de toast warning
      expect(mockToastWarning).not.toHaveBeenCalled();
    });
  });

  describe("Scénario 2: Échec Création Version Initiale (Non-Bloquant)", () => {
    it("should create prompt and save variables but handle version creation failure gracefully", async () => {
      // Mock edge function failure
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: "Failed to create version",
        },
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      // Mock successful prompt creation
      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        const newPrompt = {
          id: "prompt-456",
          title: data.title,
          content: data.content,
          description: data.description,
          tags: data.tags,
          visibility: data.visibility,
          version: "1.0.0",
        };
        onSuccess?.(newPrompt);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Test Prompt with Version Failure",
        description: null,
        content: "Test content",
        tags: [],
        visibility: "PRIVATE" as const,
        variables: [],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier que le prompt a été créé malgré l'échec
      expect(mockCreatePrompt).toHaveBeenCalled();

      // Vérifier que l'edge function a été tentée
      await waitFor(() => {
        expect(mockEdgeFunctionInvoke).toHaveBeenCalled();
      });

      // Vérifier le toast warning pour l'échec de version
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalledWith(
          "Prompt créé",
          expect.objectContaining({
            description: expect.stringContaining(
              "La version initiale n'a pas pu être créée"
            ),
          })
        );
      });

      // Vérifier que la notification de succès est quand même envoyée
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalledWith(
          "Test Prompt with Version Failure"
        );
      });

      // Vérifier que la navigation se fait quand même
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/prompts?justCreated=prompt-456");
      });
    });
  });

  describe("Scénario 3: Erreur Réseau lors de la Création de Version", () => {
    it("should handle network errors gracefully without blocking user", async () => {
      // Mock network error (exception thrown)
      const mockEdgeFunctionInvoke = vi
        .fn()
        .mockRejectedValue(new Error("Network request failed"));

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        const newPrompt = {
          id: "prompt-789",
          title: data.title,
          content: data.content,
          description: data.description,
          tags: data.tags,
          visibility: data.visibility,
          version: "1.0.0",
        };
        onSuccess?.(newPrompt);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Network Error Test",
        description: null,
        content: "Content",
        tags: [],
        visibility: "PRIVATE" as const,
        variables: [],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier que le prompt a été créé
      expect(mockCreatePrompt).toHaveBeenCalled();

      // Vérifier le toast warning
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalled();
      });

      // L'utilisateur est quand même redirigé
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/prompts?justCreated=prompt-789");
      });
    });
  });

  describe("Scénario 4: Version Déjà Existante (Idempotence)", () => {
    it("should handle already existing version gracefully", async () => {
      // Mock version already exists response
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: {
          success: true,
          skipped: true,
          version: {
            id: "existing-version",
            semver: "1.0.0",
          },
        },
        error: null,
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        const newPrompt = {
          id: "prompt-duplicate",
          title: data.title,
          content: data.content,
          description: data.description,
          tags: data.tags,
          visibility: data.visibility,
          version: "1.0.0",
        };
        onSuccess?.(newPrompt);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Duplicate Version Test",
        description: null,
        content: "Content",
        tags: [],
        visibility: "PRIVATE" as const,
        variables: [],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier l'appel à l'edge function
      await waitFor(() => {
        expect(mockEdgeFunctionInvoke).toHaveBeenCalled();
      });

      // Pas de toast warning car c'est un succès (skipped)
      expect(mockToastWarning).not.toHaveBeenCalled();

      // Notification de succès
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalled();
      });

      // Navigation normale
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe("Scénario 5: Cohérence des Données en Cas d'Échec Partiel", () => {
    it("should ensure data consistency when version creation fails", async () => {
      // Mock edge function failure
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      const createdPrompt = {
        id: "consistent-prompt",
        title: "Consistency Test",
        content: "Content with {{var1}}",
        description: null,
        tags: ["tag1"],
        visibility: "PRIVATE" as const,
        version: "1.0.0",
      };

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        onSuccess?.(createdPrompt);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Consistency Test",
        description: null,
        content: "Content with {{var1}}",
        tags: ["tag1"],
        visibility: "PRIVATE" as const,
        variables: [
          {
            id: "var-1",
            prompt_id: "consistent-prompt",
            name: "var1",
            type: "STRING" as const,
            required: false,
            default_value: "test",
            help: "Test variable",
            pattern: "",
            options: [],
            order_index: 0,
            created_at: new Date().toISOString(),
          },
        ],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier que le prompt est créé
      expect(mockCreatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Consistency Test",
          content: "Content with {{var1}}",
        }),
        expect.any(Object)
      );

      // Vérifier que les variables sont sauvegardées malgré l'échec de version
      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: "consistent-prompt",
          variables: expect.arrayContaining([
            expect.objectContaining({
              name: "var1",
              default_value: "test",
            }),
          ]),
        });
      });

      // Le prompt reste cohérent et utilisable
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/prompts?justCreated=consistent-prompt"
        );
      });
    });
  });

  describe("Scénario 6: Variables Multiples avec Échec de Version", () => {
    it("should save all variables even when version creation fails", async () => {
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Version creation failed" },
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        onSuccess?.({
          id: "multi-var-prompt",
          ...data,
          version: "1.0.0",
        });
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Multi Variable Test",
        description: null,
        content: "{{var1}} {{var2}} {{var3}}",
        tags: [],
        visibility: "PRIVATE" as const,
        variables: [
          {
            id: "var-1",
            prompt_id: "multi-var-prompt",
            name: "var1",
            type: "STRING" as const,
            required: true,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
            order_index: 0,
            created_at: new Date().toISOString(),
          },
          {
            id: "var-2",
            prompt_id: "multi-var-prompt",
            name: "var2",
            type: "NUMBER" as const,
            required: false,
            default_value: "42",
            help: "",
            pattern: "",
            options: [],
            order_index: 1,
            created_at: new Date().toISOString(),
          },
          {
            id: "var-3",
            prompt_id: "multi-var-prompt",
            name: "var3",
            type: "BOOLEAN" as const,
            required: false,
            default_value: "true",
            help: "",
            pattern: "",
            options: [],
            order_index: 2,
            created_at: new Date().toISOString(),
          },
        ],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Vérifier que toutes les variables sont sauvegardées
      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: "multi-var-prompt",
          variables: expect.arrayContaining([
            expect.objectContaining({ name: "var1", type: "STRING" }),
            expect.objectContaining({ name: "var2", type: "NUMBER" }),
            expect.objectContaining({ name: "var3", type: "BOOLEAN" }),
          ]),
        });
      });

      // Toast warning pour l'échec de version
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalled();
      });

      // Mais le prompt est créé et utilisable
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe("Scénario 7: Session Absente lors de l'Invocation", () => {
    it("should handle missing session gracefully and allow SDK to manage auth", async () => {
      // Mock session absente (utilisateur non connecté ou session expirée)
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      vi.spyOn(supabaseModule.supabase.auth, "getSession").mockImplementation(
        mockGetSession
      );

      // Mock edge function qui retourne une erreur d'auth (401)
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Non authentifié" },
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        onSuccess?.({
          id: "no-session-prompt",
          ...data,
          version: "1.0.0",
        });
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "No Session Test",
        description: null,
        content: "Test content",
        tags: [],
        visibility: "PRIVATE" as const,
        variables: [],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Le prompt est créé malgré l'absence de session
      expect(mockCreatePrompt).toHaveBeenCalled();

      // L'invocation se fait sans header manuel
      await waitFor(() => {
        expect(mockEdgeFunctionInvoke).toHaveBeenCalledWith(
          "create-initial-version",
          expect.objectContaining({
            body: expect.any(Object),
            // Pas de headers personnalisés - le SDK gère l'auth
          })
        );
      });

      // Toast warning car la version n'a pas pu être créée
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalledWith(
          "Prompt créé",
          expect.objectContaining({
            description: expect.stringContaining("version initiale"),
          })
        );
      });

      // Notification de succès et navigation quand même
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe("Scénario 8: Succès Complet avec Token Valide", () => {
    it("should create prompt with initial version when user is authenticated", async () => {
      // Mock session valide
      const mockGetSession = vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "valid-jwt-token",
            user: { id: "user-123" },
          },
        },
        error: null,
      });

      vi.spyOn(supabaseModule.supabase.auth, "getSession").mockImplementation(
        mockGetSession
      );

      // Mock edge function succès
      const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
        data: {
          success: true,
          version: {
            id: "version-success",
            semver: "1.0.0",
            content: "Success content",
          },
        },
        error: null,
      });

      vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
        mockEdgeFunctionInvoke
      );

      mockCreatePrompt.mockImplementation((data, { onSuccess }) => {
        onSuccess?.({
          id: "auth-success-prompt",
          ...data,
          version: "1.0.0",
        });
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }), {
        wrapper: createWrapper(),
      });

      const promptData = {
        title: "Authenticated Success",
        description: null,
        content: "Content with auth",
        tags: ["auth"],
        visibility: "PRIVATE" as const,
        variables: [],
      };

      await act(async () => {
        await result.current.savePrompt(promptData);
      });

      // Prompt créé
      expect(mockCreatePrompt).toHaveBeenCalled();

      // Edge function appelée (SDK ajoute le token automatiquement)
      await waitFor(() => {
        expect(mockEdgeFunctionInvoke).toHaveBeenCalledWith(
          "create-initial-version",
          expect.objectContaining({
            body: expect.objectContaining({
              prompt_id: "auth-success-prompt",
              semver: "1.0.0",
            }),
          })
        );
      });

      // Pas de toast warning (succès)
      expect(mockToastWarning).not.toHaveBeenCalled();

      // Notification et navigation
      await waitFor(() => {
        expect(mockNotifyPromptCreated).toHaveBeenCalledWith("Authenticated Success");
        expect(mockNavigate).toHaveBeenCalledWith("/prompts?justCreated=auth-success-prompt");
      });
    });
  });
});
