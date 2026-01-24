import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAnalysisQuota, useInvalidateAnalysisQuota, ANALYSIS_QUOTA_QUERY_KEY } from "../useAnalysisQuota";
import { AnalysisQuotaRepositoryProvider } from "@/contexts/AnalysisQuotaRepositoryContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import type { AnalysisQuotaRepository, AnalysisQuota } from "@/repositories/AnalysisQuotaRepository.interfaces";
import type { ReactNode } from "react";

// Mock auth state
const mockUser = { id: "user-123", email: "test@example.com" };

vi.mock("../useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    isLoading: false,
    error: null,
  })),
}));

// Mock quota data
const mockQuotaData: AnalysisQuota = {
  minuteRemaining: 8,
  dailyRemaining: 45,
  minuteLimit: 10,
  dailyLimit: 50,
  minuteResetsAt: null,
  dailyResetsAt: null,
};

// Create mock repository
const createMockRepository = (): AnalysisQuotaRepository => ({
  fetchQuota: vi.fn().mockResolvedValue(mockQuotaData),
});

// Test wrapper component
const createWrapper = (mockRepository: AnalysisQuotaRepository) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const mockAuthRepository = {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn().mockResolvedValue({ user: mockUser }),
    getCurrentSession: vi.fn().mockResolvedValue({ user: mockUser }),
    getCurrentUser: vi.fn().mockResolvedValue(mockUser),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
  };

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthRepositoryProvider repository={mockAuthRepository}>
          <AuthContextProvider>
            <AnalysisQuotaRepositoryProvider repository={mockRepository}>
              {children}
            </AnalysisQuotaRepositoryProvider>
          </AuthContextProvider>
        </AuthRepositoryProvider>
      </QueryClientProvider>
    );
  };
};

describe("useAnalysisQuota", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return quota data when authenticated", async () => {
    const mockRepository = createMockRepository();
    const wrapper = createWrapper(mockRepository);

    const { result } = renderHook(() => useAnalysisQuota(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockQuotaData);
    expect(mockRepository.fetchQuota).toHaveBeenCalled();
  });

  it("should handle repository being called", async () => {
    const mockRepository = createMockRepository();
    const wrapper = createWrapper(mockRepository);

    renderHook(() => useAnalysisQuota(), { wrapper });

    await waitFor(() => {
      expect(mockRepository.fetchQuota).toHaveBeenCalled();
    });
  });

  it("should not retry on authentication errors", async () => {
    const mockRepository: AnalysisQuotaRepository = {
      fetchQuota: vi.fn().mockRejectedValue(new Error("Utilisateur non authentifié")),
    };
    const wrapper = createWrapper(mockRepository);

    const { result } = renderHook(() => useAnalysisQuota(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    // Should only be called once due to retry: false for auth errors
    expect(mockRepository.fetchQuota).toHaveBeenCalledTimes(1);
  });

  it("should export correct query key", () => {
    expect(ANALYSIS_QUOTA_QUERY_KEY).toBe("analysis-quota");
  });
});

describe("useInvalidateAnalysisQuota", () => {
  it("should return a function to invalidate quota cache", () => {
    const mockRepository = createMockRepository();
    const wrapper = createWrapper(mockRepository);

    const { result } = renderHook(() => useInvalidateAnalysisQuota(), { wrapper });

    expect(typeof result.current).toBe("function");
  });
});
