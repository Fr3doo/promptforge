import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import {
  PromptQueryRepositoryProvider,
  usePromptQueryRepository,
} from "../PromptQueryRepositoryContext";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";

function createMockQueryRepository(): PromptQueryRepository {
  return {
    fetchAll: vi.fn(),
    fetchOwned: vi.fn(),
    fetchById: vi.fn(),
    fetchSharedWithMe: vi.fn(),
    fetchRecent: vi.fn(),
    fetchFavorites: vi.fn(),
    fetchPublicShared: vi.fn(),
    countPublic: vi.fn(),
  };
}

describe("PromptQueryRepositoryContext", () => {
  describe("PromptQueryRepositoryProvider", () => {
    it("creates a default repository instance when none is provided", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptQueryRepositoryProvider>{children}</PromptQueryRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptQueryRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.fetchAll).toBe("function");
      expect(typeof result.current.fetchOwned).toBe("function");
      expect(typeof result.current.fetchById).toBe("function");
      expect(typeof result.current.fetchSharedWithMe).toBe("function");
      expect(typeof result.current.fetchRecent).toBe("function");
      expect(typeof result.current.fetchFavorites).toBe("function");
      expect(typeof result.current.fetchPublicShared).toBe("function");
      expect(typeof result.current.countPublic).toBe("function");
    });

    it("uses the injected repository when provided", () => {
      const mockRepository = createMockQueryRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptQueryRepositoryProvider repository={mockRepository}>
          {children}
        </PromptQueryRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptQueryRepository(), { wrapper });

      expect(result.current).toBe(mockRepository);
    });
  });

  describe("usePromptQueryRepository", () => {
    it("throws an error when used outside of the provider", () => {
      expect(() => {
        renderHook(() => usePromptQueryRepository());
      }).toThrow("usePromptQueryRepository must be used within PromptQueryRepositoryProvider");
    });

    it("returns the repository when used within the provider", () => {
      const mockRepository = createMockQueryRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptQueryRepositoryProvider repository={mockRepository}>
          {children}
        </PromptQueryRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptQueryRepository(), { wrapper });

      expect(result.current).toBe(mockRepository);
    });

    it("maintains the same repository instance across re-renders", () => {
      const mockRepository = createMockQueryRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptQueryRepositoryProvider repository={mockRepository}>
          {children}
        </PromptQueryRepositoryProvider>
      );

      const { result, rerender } = renderHook(() => usePromptQueryRepository(), { wrapper });

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });
});
