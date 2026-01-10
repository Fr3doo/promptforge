import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { useInitialVersionCreator } from "../useInitialVersionCreator";
import { EdgeFunctionRepositoryProvider } from "@/contexts/EdgeFunctionRepositoryContext";
import { toast } from "sonner";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
  },
}));

// Create mock repository
const mockCreateInitialVersion = vi.fn();

const createMockRepository = () => ({
  analyzePrompt: vi.fn(),
  createInitialVersion: mockCreateInitialVersion,
  restoreVersion: vi.fn(),
  validatePasswordStrength: vi.fn(),
  checkPasswordBreach: vi.fn(),
});

// Wrapper with provider
const createWrapper = (repository = createMockRepository()) => {
  return ({ children }: { children: ReactNode }) => (
    <EdgeFunctionRepositoryProvider repository={repository}>
      {children}
    </EdgeFunctionRepositoryProvider>
  );
};

describe("useInitialVersionCreator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: successful creation
    mockCreateInitialVersion.mockResolvedValue({ success: true });
  });

  const validOptions = {
    promptId: "prompt-123",
    content: "Test content",
    variables: [
      {
        name: "testVar",
        type: "STRING" as const,
        required: true,
        default_value: "default",
        help: "Help text",
      },
    ],
  };

  describe("createInitialVersion()", () => {
    it("should return success: true when version is created", async () => {
      mockCreateInitialVersion.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.createInitialVersion(validOptions);

      expect(response).toEqual({ success: true });
    });

    it("should return success: true with skipped: true when version already exists", async () => {
      mockCreateInitialVersion.mockResolvedValue({ success: true, skipped: true });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.createInitialVersion(validOptions);

      expect(response).toEqual({ success: true, skipped: true });
    });

    it("should return success: false and show warning toast on API failure", async () => {
      mockCreateInitialVersion.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.createInitialVersion(validOptions);

      expect(response).toEqual({ success: false });
      expect(toast.warning).toHaveBeenCalledWith("Prompt créé", {
        description: expect.stringContaining("version initiale n'a pas pu être créée"),
      });
    });

    it("should catch network errors and show warning toast", async () => {
      mockCreateInitialVersion.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      const response = await result.current.createInitialVersion(validOptions);

      expect(response).toEqual({ success: false });
      expect(toast.warning).toHaveBeenCalledWith("Prompt créé", {
        description: expect.stringContaining("version initiale n'a pas pu être créée"),
      });
    });

    it("should pass correct data structure to edge function", async () => {
      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(validOptions);

      expect(mockCreateInitialVersion).toHaveBeenCalledWith({
        prompt_id: "prompt-123",
        content: "Test content",
        semver: "1.0.0",
        message: "Version initiale",
        variables: [
          {
            name: "testVar",
            type: "STRING",
            required: true,
            default_value: "default",
            help: "Help text",
            pattern: "",
            options: [],
            order_index: 0,
          },
        ],
      });
    });

    it("should include order_index for each variable", async () => {
      const optionsWithMultipleVars = {
        ...validOptions,
        variables: [
          { name: "var1", type: "STRING" as const, required: true },
          { name: "var2", type: "NUMBER" as const, required: false },
          { name: "var3", type: "BOOLEAN" as const, required: true },
        ],
      };

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(optionsWithMultipleVars);

      expect(mockCreateInitialVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: [
            expect.objectContaining({ name: "var1", order_index: 0 }),
            expect.objectContaining({ name: "var2", order_index: 1 }),
            expect.objectContaining({ name: "var3", order_index: 2 }),
          ],
        })
      );
    });

    it("should handle empty variables array", async () => {
      const optionsWithNoVars = {
        ...validOptions,
        variables: [],
      };

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(optionsWithNoVars);

      expect(mockCreateInitialVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: [],
        })
      );
    });

    it("should use default values for optional variable fields", async () => {
      const optionsWithMinimalVar = {
        ...validOptions,
        variables: [
          {
            name: "minimalVar",
            type: "STRING" as const,
            required: false,
            // No default_value, help, pattern, options
          },
        ],
      };

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(optionsWithMinimalVar);

      expect(mockCreateInitialVersion).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: [
            expect.objectContaining({
              name: "minimalVar",
              default_value: "",
              help: "",
              pattern: "",
              options: [],
            }),
          ],
        })
      );
    });
  });

  describe("error logging", () => {
    it("should log error to console on API failure", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockCreateInitialVersion.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(validOptions);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur création version initiale");
      consoleSpy.mockRestore();
    });

    it("should log error to console on exception", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Network error");
      mockCreateInitialVersion.mockRejectedValue(error);

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(validOptions);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Erreur lors de l'appel à create-initial-version:",
        error
      );
      consoleSpy.mockRestore();
    });

    it("should log success message on successful creation", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      mockCreateInitialVersion.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(validOptions);

      expect(consoleSpy).toHaveBeenCalledWith("Version initiale créée avec succès");
      consoleSpy.mockRestore();
    });

    it("should log skip message when version already exists", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      mockCreateInitialVersion.mockResolvedValue({ success: true, skipped: true });

      const { result } = renderHook(() => useInitialVersionCreator(), {
        wrapper: createWrapper(),
      });

      await result.current.createInitialVersion(validOptions);

      expect(consoleSpy).toHaveBeenCalledWith("Version initiale déjà existante");
      consoleSpy.mockRestore();
    });
  });
});
