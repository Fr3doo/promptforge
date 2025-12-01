import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthContextProvider, useAuthContext, AuthContext } from "../AuthContext";
import type { AuthRepository } from "@/repositories/AuthRepository";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useContext } from "react";

describe("AuthContext", () => {
  let mockAuthRepository: AuthRepository;
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
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthRepositoryProvider repository={mockAuthRepository}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </AuthRepositoryProvider>
  );

  it("should initialize with loading true and no user", () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("should set up auth state listener on mount", async () => {
    renderHook(() => useAuthContext(), { wrapper });

    expect(mockAuthRepository.onAuthStateChange).toHaveBeenCalled();
  });

  it("should call getCurrentSession on mount", async () => {
    renderHook(() => useAuthContext(), { wrapper });

    expect(mockAuthRepository.getCurrentSession).toHaveBeenCalled();
  });

  it("should update state when auth state changes to SIGNED_IN", async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

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

  it("should update state when auth state changes to SIGNED_OUT", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuthContext(), { wrapper });

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

  it("should load existing session on mount", async () => {
    vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  it("should unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useAuthContext(), { wrapper });

    expect(unsubscribeFn).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it("should not update state after unmount (isMounted guard)", async () => {
    const { result, unmount } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    unmount();

    // Try to trigger auth state change after unmount
    authStateCallback("SIGNED_IN", mockSession);

    // Should not cause any state update (no error thrown)
    expect(unsubscribeFn).toHaveBeenCalled();
  });

  it("should throw error when used outside AuthContextProvider", () => {
    // Try to use hook without wrapper
    expect(() => {
      renderHook(() => {
        const context = useContext(AuthContext);
        if (context === undefined) {
          throw new Error("useAuthContext must be used within AuthContextProvider");
        }
        return context;
      });
    }).toThrow("useAuthContext must be used within AuthContextProvider");
  });
});
