import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNewUserBootstrap } from "../useNewUserBootstrap";
import type { AuthRepository } from "@/repositories/AuthRepository";
import type { PromptRepository } from "@/repositories/PromptRepository";
import type { VariableRepository } from "@/repositories/VariableRepository";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { PromptRepositoryProvider } from "@/contexts/PromptRepositoryContext";
import { VariableRepositoryProvider } from "@/contexts/VariableRepositoryContext";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("useNewUserBootstrap", () => {
  let mockAuthRepository: AuthRepository;
  let mockPromptRepository: Partial<PromptRepository>;
  let mockVariableRepository: Partial<VariableRepository>;
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

    mockAuthRepository = {
      getCurrentSession: vi.fn().mockResolvedValue(null),
      getCurrentUser: vi.fn().mockResolvedValue(null),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn((callback) => {
        authStateCallback = callback;
        return { unsubscribe: vi.fn() };
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
      <AuthContextProvider>
        <PromptRepositoryProvider repository={mockPromptRepository as PromptRepository}>
          <VariableRepositoryProvider repository={mockVariableRepository as VariableRepository}>
            {children}
          </VariableRepositoryProvider>
        </PromptRepositoryProvider>
      </AuthContextProvider>
    </AuthRepositoryProvider>
  );

  it("should not initialize when loading is true", async () => {
    renderHook(() => useNewUserBootstrap(), { wrapper });

    // Wait a bit to ensure no initialization happens
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPromptRepository.fetchOwned).not.toHaveBeenCalled();
  });

  it("should not initialize when user is null", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(null);

    renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockAuthRepository.getCurrentSession).toHaveBeenCalled();
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPromptRepository.fetchOwned).not.toHaveBeenCalled();
  });

  it("should create templates for a new user", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Wait for template creation (deferred with setTimeout)
    await waitFor(
      () => {
        expect(mockPromptRepository.create).toHaveBeenCalled();
      },
      { timeout: 200 }
    );
  });

  it("should not create templates if user already has prompts", async () => {
    const mockExistingPrompts = [{ id: "prompt-1", title: "Existing" }];
    vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue(mockExistingPrompts as any);
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Wait to ensure no template creation
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockPromptRepository.create).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    vi.mocked(mockPromptRepository.fetchOwned).mockRejectedValue(
      new Error("Fetch failed")
    );
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Should not crash
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(mockPromptRepository.create).not.toHaveBeenCalled();
  });

  it("should not initialize multiple times for the same user", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    const { rerender } = renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Rerender multiple times
    rerender();
    rerender();

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should only call fetchOwned once
    expect(mockPromptRepository.fetchOwned).toHaveBeenCalledTimes(1);
  });

  it("should reinitialize when user changes", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    const { rerender } = renderHook(() => useNewUserBootstrap(), { wrapper });

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
    });

    // Change user
    const newUser: User = { ...mockUser, id: "user-456" };
    const newSession: Session = { ...mockSession, user: newUser };
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(newSession);

    // Simulate auth state change
    authStateCallback("SIGNED_IN", newSession);

    await waitFor(() => {
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(newUser.id);
    });

    // Should have called fetchOwned for both users
    expect(mockPromptRepository.fetchOwned).toHaveBeenCalledTimes(2);
  });
});
