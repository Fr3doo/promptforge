import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@/test/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, createContext } from "react";
import { usePrompts } from "../usePrompts";
import type { PromptQueryRepository, Prompt } from "@/repositories/PromptRepository.interfaces";

// Create test context
const TestPromptQueryRepositoryContext = createContext<PromptQueryRepository | null>(null);

// Mock PromptQueryRepository
const mockQueryRepository: PromptQueryRepository = {
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
  fetchRecent: vi.fn(),
  fetchFavorites: vi.fn(),
  fetchPublicShared: vi.fn(),
  countPublic: vi.fn(),
};

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "test-user-id" } }),
}));

// Mock usePromptQueryRepository to use our test context
vi.mock("@/contexts/PromptQueryRepositoryContext", () => ({
  usePromptQueryRepository: () => {
    const { useContext } = require("react");
    const context = useContext(TestPromptQueryRepositoryContext);
    if (!context) {
      throw new Error("usePromptQueryRepository must be used within PromptQueryRepositoryProvider");
    }
    return context;
  },
}));

// Mock toast utilities
vi.mock("@/lib/toastUtils", () => ({
  successToast: vi.fn(),
  errorToast: vi.fn(),
}));

interface WrapperProps {
  children: ReactNode;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { 
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  function TestWrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <TestPromptQueryRepositoryContext.Provider value={mockQueryRepository}>
          {children}
        </TestPromptQueryRepositoryContext.Provider>
      </QueryClientProvider>
    );
  }
  
  return TestWrapper;
}

describe("usePrompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch prompts successfully", async () => {
    const mockPrompts: Prompt[] = [
      { 
        id: "1", 
        title: "Prompt 1", 
        content: "Content 1",
        visibility: "PRIVATE",
        version: "1.0.0",
        tags: [],
        owner_id: "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
        is_favorite: false,
        status: "DRAFT",
        public_permission: "READ",
      },
      { 
        id: "2", 
        title: "Prompt 2", 
        content: "Content 2",
        visibility: "PRIVATE",
        version: "1.0.0",
        tags: [],
        owner_id: "test-user-id",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: null,
        is_favorite: false,
        status: "DRAFT",
        public_permission: "READ",
      },
    ];

    vi.mocked(mockQueryRepository.fetchAll).mockResolvedValue(mockPrompts);

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPrompts);
    expect(mockQueryRepository.fetchAll).toHaveBeenCalledWith("test-user-id");
  });

  it("should handle fetch error", async () => {
    vi.mocked(mockQueryRepository.fetchAll).mockRejectedValue(
      new Error("Error fetching prompts")
    );

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("should return undefined initially while loading", () => {
    vi.mocked(mockQueryRepository.fetchAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => usePrompts(), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});
