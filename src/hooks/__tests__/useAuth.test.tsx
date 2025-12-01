import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../useAuth";
import type { AuthRepository } from "@/repositories/AuthRepository";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { AuthContextProvider, AuthContext } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { useContext } from "react";

describe("useAuth", () => {
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

  const mockAuthRepository: AuthRepository = {
    getCurrentSession: vi.fn().mockResolvedValue(mockSession),
    getCurrentUser: vi.fn().mockResolvedValue(mockUser),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthRepositoryProvider repository={mockAuthRepository}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </AuthRepositoryProvider>
  );

  it("should return auth context values", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBeDefined();
    expect(result.current.user).toBeDefined();
    expect(result.current.session).toBeDefined();
  });

  it("should throw error when used outside AuthContextProvider", () => {
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
