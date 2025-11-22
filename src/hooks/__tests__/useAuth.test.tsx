import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../useAuth";
import type { AuthRepository } from "@/repositories/AuthRepository";
import type { PromptRepository } from "@/repositories/PromptRepository";
import type { VariableRepository } from "@/repositories/VariableRepository";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { PromptRepositoryProvider } from "@/contexts/PromptRepositoryContext";
import { VariableRepositoryProvider } from "@/contexts/VariableRepositoryContext";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("useAuth", () => {
  let mockAuthRepository: AuthRepository;
  let mockPromptRepository: Partial<PromptRepository>;
  let mockVariableRepository: Partial<VariableRepository>;
  let unsubscribeFn: ReturnType<typeof vi.fn>;
  let authStateCallback: (event: string, session: Session | null) => void;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
  } as User;

  const mockSession: Session = {
    user: mockUser,
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
  } as Session;

  beforeEach(() => {
    vi.clearAllMocks();
    unsubscribeFn = vi.fn();
    authStateCallback = vi.fn();

    mockAuthRepository = {
      getCurrentSession: vi.fn().mockResolvedValue(null),
      getCurrentUser: vi.fn().mockResolvedValue(null),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn((callback) => {
        authStateCallback = callback;
        return { unsubscribe: unsubscribeFn };
      }),
    };

    mockPromptRepository = {
      fetchOwned: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    };

    mockVariableRepository = {
      create: vi.fn(),
    };
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthRepositoryProvider repository={mockAuthRepository}>
      <PromptRepositoryProvider repository={mockPromptRepository as PromptRepository}>
        <VariableRepositoryProvider repository={mockVariableRepository as VariableRepository}>
          {children}
        </VariableRepositoryProvider>
      </PromptRepositoryProvider>
    </AuthRepositoryProvider>
  );

  it("should initialize with loading true and no user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("should set up auth state listener and get current session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(mockAuthRepository.onAuthStateChange).toHaveBeenCalled();
    expect(mockAuthRepository.getCurrentSession).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should update state when auth state changes", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate auth state change
    authStateCallback("SIGNED_IN", mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  it("should set user to null when session is null", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Simulate sign out
    authStateCallback("SIGNED_OUT", null);

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  it("should create templates for new user on SIGNED_IN event", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate sign in
    authStateCallback("SIGNED_IN", mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Wait for template creation (deferred with setTimeout)
    await waitFor(
      () => {
        expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
      },
      { timeout: 100 }
    );
  });

  it("should not create templates when user already has prompts", async () => {
    const mockExistingPrompts = [{ id: "prompt-1", title: "Existing" }];
    vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue(mockExistingPrompts as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    authStateCallback("SIGNED_IN", mockSession);

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Should not create templates
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockPromptRepository.create).not.toHaveBeenCalled();
  });

  it("should load existing session on mount", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  it("should unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useAuth(), { wrapper });

    expect(unsubscribeFn).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it("should handle template creation errors gracefully", async () => {
    vi.mocked(mockPromptRepository.fetchOwned).mockRejectedValue(
      new Error("Fetch failed")
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    authStateCallback("SIGNED_IN", mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Should not crash even if template creation fails
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(result.current.user).toEqual(mockUser);
  });
});
