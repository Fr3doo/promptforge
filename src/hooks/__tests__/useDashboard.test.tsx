import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { User, Session } from "@supabase/supabase-js";
import { useDashboard } from "../useDashboard";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";
import type { PromptUsageRepository } from "@/repositories/PromptUsageRepository.interfaces";
import { PromptQueryRepositoryProvider } from "@/contexts/PromptQueryRepositoryContext";
import { PromptUsageRepositoryProvider } from "@/contexts/PromptUsageRepositoryContext";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import type { AuthRepository } from "@/repositories/AuthRepository";

// Mock repositories
const mockQueryRepository: PromptQueryRepository = {
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
  fetchRecent: vi.fn().mockResolvedValue([
    { id: "1", title: "Recent Prompt", owner_id: "user-1" },
  ]),
  fetchFavorites: vi.fn().mockResolvedValue([
    { id: "2", title: "Favorite Prompt", owner_id: "user-1", is_favorite: true },
  ]),
  fetchPublicShared: vi.fn().mockResolvedValue([
    { id: "3", title: "Shared Prompt", owner_id: "user-1", visibility: "SHARED" },
  ]),
  countPublic: vi.fn(),
};

const mockUsageRepository: PromptUsageRepository = {
  fetchUsageStats: vi.fn().mockResolvedValue([
    { promptId: "1", title: "Test Prompt", usageCount: 10, successRate: 80 },
  ]),
};

const mockAuthRepository: AuthRepository = {
  getCurrentSession: vi.fn().mockResolvedValue({
    user: { id: "user-1", email: "test@example.com" },
  } as Session),
  getCurrentUser: vi.fn().mockResolvedValue({
    id: "user-1",
    email: "test@example.com",
  } as User),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthRepositoryProvider repository={mockAuthRepository}>
        <PromptQueryRepositoryProvider>
          <PromptUsageRepositoryProvider repository={mockUsageRepository}>
            {children}
          </PromptUsageRepositoryProvider>
        </PromptQueryRepositoryProvider>
      </AuthRepositoryProvider>
    </QueryClientProvider>
  );
};

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch dashboard data successfully", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      recentPrompts: [{ id: "1", title: "Recent Prompt", owner_id: "user-1" }],
      favoritePrompts: [{ id: "2", title: "Favorite Prompt", owner_id: "user-1", is_favorite: true }],
      sharedPrompts: [{ id: "3", title: "Shared Prompt", owner_id: "user-1", visibility: "SHARED" }],
      usageStats: [{ promptId: "1", title: "Test Prompt", usageCount: 10, successRate: 80 }],
    });
  });

  it("should call fetchRecent with correct parameters", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockQueryRepository.fetchRecent).toHaveBeenCalledWith("user-1", 7, 5);
  });

  it("should call fetchFavorites with correct parameters", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockQueryRepository.fetchFavorites).toHaveBeenCalledWith("user-1", 5);
  });

  it("should call fetchPublicShared with correct parameters", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockQueryRepository.fetchPublicShared).toHaveBeenCalledWith("user-1", 5);
  });

  it("should call fetchUsageStats with correct parameters", async () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockUsageRepository.fetchUsageStats).toHaveBeenCalledWith("user-1", 5);
  });

  it("should not fetch when user is not authenticated", async () => {
    const noUserAuthRepository: AuthRepository = {
      ...mockAuthRepository,
      getCurrentSession: vi.fn().mockResolvedValue(null),
      getCurrentUser: vi.fn().mockResolvedValue(null),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>
        <AuthRepositoryProvider repository={noUserAuthRepository}>
          <PromptQueryRepositoryProvider>
            <PromptUsageRepositoryProvider repository={mockUsageRepository}>
              {children}
            </PromptUsageRepositoryProvider>
          </PromptQueryRepositoryProvider>
        </AuthRepositoryProvider>
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(mockQueryRepository.fetchRecent).not.toHaveBeenCalled();
    expect(mockUsageRepository.fetchUsageStats).not.toHaveBeenCalled();
  });
});
