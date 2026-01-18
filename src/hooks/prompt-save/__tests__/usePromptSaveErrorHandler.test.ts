import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { ZodError, ZodIssue } from "zod";
import { usePromptSaveErrorHandler, classifyError } from "../usePromptSaveErrorHandler";

// Mock usePromptMessages
const mockShowValidationError = vi.fn();
const mockShowNetworkError = vi.fn();
const mockShowPermissionDenied = vi.fn();
const mockShowDuplicateTitleError = vi.fn();
const mockShowServerError = vi.fn();

vi.mock("@/features/prompts/hooks/usePromptMessages", () => ({
  usePromptMessages: () => ({
    showValidationError: mockShowValidationError,
    showNetworkError: mockShowNetworkError,
    showPermissionDenied: mockShowPermissionDenied,
    showDuplicateTitleError: mockShowDuplicateTitleError,
    showServerError: mockShowServerError,
  }),
}));

describe("classifyError", () => {
  const createZodError = (issues: ZodIssue[]): ZodError => {
    return new ZodError(issues);
  };

  describe("returns VALIDATION", () => {
    it("for ZodError instances", () => {
      const zodError = createZodError([
        { code: "custom", message: "Test error", path: ["field"] },
      ]);
      expect(classifyError(zodError)).toBe("VALIDATION");
    });

    it("for ZodError with empty issues", () => {
      const zodError = createZodError([]);
      expect(classifyError(zodError)).toBe("VALIDATION");
    });
  });

  describe("returns PERMISSION", () => {
    it("for PGRST116 error code", () => {
      expect(classifyError({ code: "PGRST116" })).toBe("PERMISSION");
    });

    it("for error message containing 'permission'", () => {
      expect(classifyError({ message: "permission denied" })).toBe("PERMISSION");
    });
  });

  describe("returns DUPLICATE", () => {
    it("for 23505 error code (unique constraint)", () => {
      expect(classifyError({ code: "23505" })).toBe("DUPLICATE");
    });
  });

  describe("returns NETWORK", () => {
    it("for network errors", () => {
      expect(classifyError({ message: "network error" })).toBe("NETWORK");
    });

    it("for fetch errors", () => {
      expect(classifyError({ message: "fetch failed" })).toBe("NETWORK");
    });

    it("for timeout errors", () => {
      expect(classifyError({ message: "request timeout" })).toBe("NETWORK");
    });

    it("for 5xx status codes", () => {
      expect(classifyError({ status: 503 })).toBe("NETWORK");
    });

    it("for ECONNREFUSED errors", () => {
      expect(classifyError({ message: "ECONNREFUSED" })).toBe("NETWORK");
    });

    it("for ENOTFOUND errors", () => {
      expect(classifyError({ message: "getaddrinfo ENOTFOUND" })).toBe("NETWORK");
    });
  });

  describe("returns SERVER", () => {
    it("for unknown errors", () => {
      expect(classifyError({ message: "something went wrong" })).toBe("SERVER");
    });

    it("for null", () => {
      expect(classifyError(null)).toBe("SERVER");
    });

    it("for undefined", () => {
      expect(classifyError(undefined)).toBe("SERVER");
    });

    it("for empty object", () => {
      expect(classifyError({})).toBe("SERVER");
    });
  });

  describe("priority order", () => {
    it("VALIDATION takes priority over NETWORK keywords", () => {
      const zodError = createZodError([
        { code: "custom", message: "network validation failed", path: ["field"] },
      ]);
      expect(classifyError(zodError)).toBe("VALIDATION");
    });
  });
});

describe("usePromptSaveErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createZodError = (issues: ZodIssue[]): ZodError => {
    return new ZodError(issues);
  };

  describe("handleError() - ZodError", () => {
    it("calls showValidationError with field and message for ZodError with path", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      
      const zodError = createZodError([
        {
          code: "too_small",
          minimum: 1,
          type: "string",
          inclusive: true,
          exact: false,
          message: "Le titre est requis",
          path: ["title"],
        },
      ]);

      result.current.handleError(zodError, "CREATE");

      expect(mockShowValidationError).toHaveBeenCalledWith("title", "Le titre est requis");
      expect(mockShowServerError).not.toHaveBeenCalled();
    });

    it("calls showValidationError with nested path joined by dots", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      
      const zodError = createZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          message: "Required",
          path: ["variables", 0, "name"],
        },
      ]);

      result.current.handleError(zodError, "CREATE");

      expect(mockShowValidationError).toHaveBeenCalledWith("variables.0.name", "Required");
    });

    it("calls showValidationError with 'Champ' when path is empty", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      
      const zodError = createZodError([
        {
          code: "custom",
          message: "Données invalides",
          path: [],
        },
      ]);

      result.current.handleError(zodError, "CREATE");

      expect(mockShowValidationError).toHaveBeenCalledWith("Champ", "Données invalides");
    });

    it("calls showValidationError fallback for ZodError with empty issues", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      
      const zodError = createZodError([]);

      result.current.handleError(zodError, "CREATE");

      expect(mockShowValidationError).toHaveBeenCalledWith("Données", "Veuillez vérifier les données saisies");
    });
  });

  describe("handleError() - Retryable errors (via isRetryableError)", () => {
    it("calls showNetworkError for error containing 'network'", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "network error occurred" }, "CREATE", { retry, canRetry: true });

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", retry);
      expect(mockShowServerError).not.toHaveBeenCalled();
    });

    it("calls showNetworkError for error containing 'fetch'", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "fetch failed" }, "UPDATE", { retry, canRetry: true });

      expect(mockShowNetworkError).toHaveBeenCalledWith("mettre à jour le prompt", retry);
    });

    it("calls showNetworkError for timeout errors", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "request timeout" }, "UPDATE", { retry, canRetry: true });

      expect(mockShowNetworkError).toHaveBeenCalledWith("mettre à jour le prompt", retry);
    });

    it("calls showNetworkError for 5xx server errors", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ status: 503 }, "CREATE", { retry, canRetry: true });

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", retry);
    });

    it("calls showNetworkError for connection refused errors", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ message: "ECONNREFUSED" }, "UPDATE");

      expect(mockShowNetworkError).toHaveBeenCalledWith("mettre à jour le prompt", undefined);
    });

    it("calls showNetworkError for ENOTFOUND errors", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ message: "getaddrinfo ENOTFOUND" }, "CREATE");

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", undefined);
    });

    it("uses correct action message for CREATE context", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ message: "network timeout" }, "CREATE");

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", undefined);
    });

    it("uses correct action message for UPDATE context", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ message: "network timeout" }, "UPDATE");

      expect(mockShowNetworkError).toHaveBeenCalledWith("mettre à jour le prompt", undefined);
    });

    it("does NOT pass retry when canRetry is false", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "network error" }, "CREATE", { retry, canRetry: false });

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", undefined);
    });

    it("passes retry when canRetry is true", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "network error" }, "UPDATE", { retry, canRetry: true });

      expect(mockShowNetworkError).toHaveBeenCalledWith("mettre à jour le prompt", retry);
    });

    it("supports legacy function signature for backward compatibility", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      // Old signature: handleError(error, context, retryFn)
      result.current.handleError({ message: "network error" }, "CREATE", retry);

      expect(mockShowNetworkError).toHaveBeenCalledWith("créer le prompt", retry);
    });
  });

  describe("handleError() - Permission errors", () => {
    it("calls showPermissionDenied for PGRST116 error code", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ code: "PGRST116" }, "UPDATE");

      expect(mockShowPermissionDenied).toHaveBeenCalled();
      expect(mockShowServerError).not.toHaveBeenCalled();
    });

    it("calls showPermissionDenied for error message containing 'permission'", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ message: "permission denied for table" }, "UPDATE");

      expect(mockShowPermissionDenied).toHaveBeenCalled();
    });
  });

  describe("handleError() - Duplication errors", () => {
    it("calls showDuplicateTitleError for 23505 error code (unique constraint)", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError({ code: "23505" }, "CREATE");

      expect(mockShowDuplicateTitleError).toHaveBeenCalled();
      expect(mockShowServerError).not.toHaveBeenCalled();
    });
  });

  describe("handleError() - Generic errors", () => {
    it("calls showServerError for unknown error in CREATE context", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "something went wrong" }, "CREATE", { retry, canRetry: true });

      expect(mockShowServerError).toHaveBeenCalledWith("création du prompt", retry);
    });

    it("calls showServerError for unknown error in UPDATE context", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "something went wrong" }, "UPDATE", { retry, canRetry: true });

      expect(mockShowServerError).toHaveBeenCalledWith("mise à jour du prompt", retry);
    });

    it("calls showServerError without retry when not provided", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError(new Error("Unknown error"), "CREATE");

      expect(mockShowServerError).toHaveBeenCalledWith("création du prompt", undefined);
    });

    it("handles null error gracefully", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError(null, "CREATE");

      expect(mockShowServerError).toHaveBeenCalledWith("création du prompt", undefined);
    });

    it("handles undefined error gracefully", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());

      result.current.handleError(undefined, "UPDATE");

      expect(mockShowServerError).toHaveBeenCalledWith("mise à jour du prompt", undefined);
    });

    it("does NOT pass retry to showServerError when canRetry is false", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      const retry = vi.fn();

      result.current.handleError({ message: "something went wrong" }, "CREATE", { retry, canRetry: false });

      expect(mockShowServerError).toHaveBeenCalledWith("création du prompt", undefined);
    });
  });

  describe("error priority", () => {
    it("prioritizes ZodError over network keywords in message", () => {
      const { result } = renderHook(() => usePromptSaveErrorHandler());
      
      // Create a ZodError that also contains "network" in the message
      const zodError = createZodError([
        {
          code: "custom",
          message: "network validation failed",
          path: ["field"],
        },
      ]);

      result.current.handleError(zodError, "CREATE");

      expect(mockShowValidationError).toHaveBeenCalled();
      expect(mockShowNetworkError).not.toHaveBeenCalled();
    });
  });
});
