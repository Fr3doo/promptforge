import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  AuthRepositoryProvider,
  useAuthRepository,
} from "../AuthRepositoryContext";
import type { AuthRepository } from "@/repositories/AuthRepository";
import type { ReactNode } from "react";

describe("AuthRepositoryContext", () => {
  const mockAuthRepository: AuthRepository = {
    getCurrentSession: vi.fn(),
    getCurrentUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  };

  describe("AuthRepositoryProvider", () => {
    it("should provide default SupabaseAuthRepository when no repository is passed", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthRepositoryProvider>{children}</AuthRepositoryProvider>
      );

      const { result } = renderHook(() => useAuthRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.getCurrentSession).toBeDefined();
      expect(result.current.getCurrentUser).toBeDefined();
      expect(result.current.signIn).toBeDefined();
      expect(result.current.signUp).toBeDefined();
      expect(result.current.signOut).toBeDefined();
      expect(result.current.onAuthStateChange).toBeDefined();
    });

    it("should provide injected repository when passed as prop", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthRepositoryProvider repository={mockAuthRepository}>
          {children}
        </AuthRepositoryProvider>
      );

      const { result } = renderHook(() => useAuthRepository(), { wrapper });

      expect(result.current).toBe(mockAuthRepository);
    });
  });

  describe("useAuthRepository", () => {
    it("should throw error when used outside of provider", () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuthRepository());
      }).toThrow(
        "useAuthRepository doit être utilisé dans un AuthRepositoryProvider"
      );

      consoleError.mockRestore();
    });

    it("should return repository when used inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthRepositoryProvider repository={mockAuthRepository}>
          {children}
        </AuthRepositoryProvider>
      );

      const { result } = renderHook(() => useAuthRepository(), { wrapper });

      expect(result.current).toBe(mockAuthRepository);
    });

    it("should maintain same repository instance across re-renders", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthRepositoryProvider repository={mockAuthRepository}>
          {children}
        </AuthRepositoryProvider>
      );

      const { result, rerender } = renderHook(() => useAuthRepository(), {
        wrapper,
      });

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });
});
