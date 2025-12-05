import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
import {
  PromptMutationRepositoryProvider,
  usePromptMutationRepository,
} from "../PromptMutationRepositoryContext";

// Mock du repository pour les tests d'injection
// PromptMutationRepository n'expose que la méthode update
const createMockMutationRepository = (): PromptMutationRepository => ({
  update: vi.fn(),
});

describe("PromptMutationRepositoryContext", () => {
  describe("PromptMutationRepositoryProvider", () => {
    it("creates a default repository instance with update method", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptMutationRepositoryProvider>{children}</PromptMutationRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptMutationRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.update).toBe("function");
    });

    it("uses the injected repository when provided", () => {
      const mockRepository = createMockMutationRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptMutationRepositoryProvider repository={mockRepository}>
          {children}
        </PromptMutationRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptMutationRepository(), { wrapper });

      expect(result.current).toBe(mockRepository);
    });
  });

  describe("usePromptMutationRepository", () => {
    it("throws an error when used outside of the provider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePromptMutationRepository());
      }).toThrow("usePromptMutationRepository must be used within PromptMutationRepositoryProvider");

      consoleSpy.mockRestore();
    });

    it("returns the repository when used within the provider", () => {
      const mockRepository = createMockMutationRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptMutationRepositoryProvider repository={mockRepository}>
          {children}
        </PromptMutationRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptMutationRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toBe(mockRepository);
    });

    it("maintains the same repository instance across re-renders", () => {
      const mockRepository = createMockMutationRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptMutationRepositoryProvider repository={mockRepository}>
          {children}
        </PromptMutationRepositoryProvider>
      );

      const { result, rerender } = renderHook(() => usePromptMutationRepository(), { wrapper });

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });
});
