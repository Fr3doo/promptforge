import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  ProfileRepositoryProvider,
  useProfileRepository,
} from "../ProfileRepositoryContext";
import type { ProfileRepository } from "@/repositories/ProfileRepository";
import type { ReactNode } from "react";

describe("ProfileRepositoryContext", () => {
  const mockProfileRepository: ProfileRepository = {
    fetchByUserId: vi.fn(),
    update: vi.fn(),
  };

  describe("ProfileRepositoryProvider", () => {
    it("should provide default SupabaseProfileRepository when no repository is passed", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ProfileRepositoryProvider>{children}</ProfileRepositoryProvider>
      );

      const { result } = renderHook(() => useProfileRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.fetchByUserId).toBeDefined();
      expect(result.current.update).toBeDefined();
    });

    it("should provide injected repository when passed as prop", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ProfileRepositoryProvider repository={mockProfileRepository}>
          {children}
        </ProfileRepositoryProvider>
      );

      const { result } = renderHook(() => useProfileRepository(), { wrapper });

      expect(result.current).toBe(mockProfileRepository);
    });
  });

  describe("useProfileRepository", () => {
    it("should throw error when used outside of provider", () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useProfileRepository());
      }).toThrow(
        "useProfileRepository doit être utilisé dans un ProfileRepositoryProvider"
      );

      consoleError.mockRestore();
    });

    it("should return repository when used inside provider", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ProfileRepositoryProvider repository={mockProfileRepository}>
          {children}
        </ProfileRepositoryProvider>
      );

      const { result } = renderHook(() => useProfileRepository(), { wrapper });

      expect(result.current).toBe(mockProfileRepository);
    });

    it("should maintain same repository instance across re-renders", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ProfileRepositoryProvider repository={mockProfileRepository}>
          {children}
        </ProfileRepositoryProvider>
      );

      const { result, rerender } = renderHook(() => useProfileRepository(), {
        wrapper,
      });

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });
});
