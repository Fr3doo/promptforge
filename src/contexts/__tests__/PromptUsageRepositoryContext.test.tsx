import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PromptUsageRepositoryProvider, usePromptUsageRepository } from "../PromptUsageRepositoryContext";
import type { PromptUsageRepository } from "@/repositories/PromptUsageRepository.interfaces";

// Mock repository for testing
const mockRepository: PromptUsageRepository = {
  fetchUsageStats: vi.fn().mockResolvedValue([]),
};

// Test component that uses the hook
function TestComponent() {
  const repository = usePromptUsageRepository();
  return <div data-testid="repository">{repository ? "Repository available" : "No repository"}</div>;
}

describe("PromptUsageRepositoryContext", () => {
  describe("PromptUsageRepositoryProvider", () => {
    it("should provide a default repository instance", () => {
      render(
        <PromptUsageRepositoryProvider>
          <TestComponent />
        </PromptUsageRepositoryProvider>
      );

      expect(screen.getByTestId("repository")).toHaveTextContent("Repository available");
    });

    it("should accept custom repository via props (dependency injection)", () => {
      render(
        <PromptUsageRepositoryProvider repository={mockRepository}>
          <TestComponent />
        </PromptUsageRepositoryProvider>
      );

      expect(screen.getByTestId("repository")).toHaveTextContent("Repository available");
    });
  });

  describe("usePromptUsageRepository", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("usePromptUsageRepository doit être utilisé dans un PromptUsageRepositoryProvider");

      consoleError.mockRestore();
    });

    it("should return repository instance when used inside provider", () => {
      let capturedRepository: PromptUsageRepository | null = null;

      function CaptureRepository() {
        capturedRepository = usePromptUsageRepository();
        return null;
      }

      render(
        <PromptUsageRepositoryProvider repository={mockRepository}>
          <CaptureRepository />
        </PromptUsageRepositoryProvider>
      );

      expect(capturedRepository).toBe(mockRepository);
    });
  });
});
