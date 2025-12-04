import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import type { PromptCommandRepository } from "@/repositories/PromptRepository.interfaces";
import {
  PromptCommandRepositoryProvider,
  usePromptCommandRepository,
} from "../PromptCommandRepositoryContext";

// Mock du repository pour les tests d'injection
const createMockCommandRepository = (): PromptCommandRepository => ({
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe("PromptCommandRepositoryContext", () => {
  describe("PromptCommandRepositoryProvider", () => {
    it("creates a default SupabasePromptCommandRepository instance", () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptCommandRepositoryProvider>{children}</PromptCommandRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptCommandRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.create).toBe("function");
      expect(typeof result.current.update).toBe("function");
      expect(typeof result.current.delete).toBe("function");
    });

    it("uses the injected repository when provided", () => {
      const mockRepository = createMockCommandRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptCommandRepositoryProvider repository={mockRepository}>
          {children}
        </PromptCommandRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptCommandRepository(), { wrapper });

      expect(result.current).toBe(mockRepository);
    });
  });

  describe("usePromptCommandRepository", () => {
    it("throws an error when used outside of the provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePromptCommandRepository());
      }).toThrow("usePromptCommandRepository must be used within PromptCommandRepositoryProvider");

      consoleSpy.mockRestore();
    });

    it("returns the repository when used within the provider", () => {
      const mockRepository = createMockCommandRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptCommandRepositoryProvider repository={mockRepository}>
          {children}
        </PromptCommandRepositoryProvider>
      );

      const { result } = renderHook(() => usePromptCommandRepository(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toBe(mockRepository);
    });

    it("maintains the same repository instance across re-renders", () => {
      const mockRepository = createMockCommandRepository();

      const wrapper = ({ children }: { children: ReactNode }) => (
        <PromptCommandRepositoryProvider repository={mockRepository}>
          {children}
        </PromptCommandRepositoryProvider>
      );

      const { result, rerender } = renderHook(() => usePromptCommandRepository(), { wrapper });

      const firstInstance = result.current;
      rerender();
      const secondInstance = result.current;

      expect(firstInstance).toBe(secondInstance);
    });
  });
});
