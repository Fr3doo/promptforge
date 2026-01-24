import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AnalysisQuotaRepositoryProvider,
  useAnalysisQuotaRepository,
} from "../AnalysisQuotaRepositoryContext";
import type { AnalysisQuotaRepository } from "@/repositories/AnalysisQuotaRepository.interfaces";

// Mock repository for testing
const createMockQuotaRepository = (): AnalysisQuotaRepository => ({
  fetchQuota: vi.fn().mockResolvedValue({
    minuteRemaining: 8,
    dailyRemaining: 45,
    minuteLimit: 10,
    dailyLimit: 50,
    minuteResetsAt: null,
    dailyResetsAt: null,
  }),
});

// Test component that uses the hook
function TestComponent() {
  const repository = useAnalysisQuotaRepository();
  return (
    <div data-testid="repository">
      {repository ? "Repository available" : "No repository"}
    </div>
  );
}

describe("AnalysisQuotaRepositoryContext", () => {
  describe("AnalysisQuotaRepositoryProvider", () => {
    it("should provide a default repository instance", () => {
      render(
        <AnalysisQuotaRepositoryProvider>
          <TestComponent />
        </AnalysisQuotaRepositoryProvider>
      );

      expect(screen.getByTestId("repository")).toHaveTextContent(
        "Repository available"
      );
    });

    it("should accept custom repository via props (dependency injection)", () => {
      const mockRepository = createMockQuotaRepository();

      render(
        <AnalysisQuotaRepositoryProvider repository={mockRepository}>
          <TestComponent />
        </AnalysisQuotaRepositoryProvider>
      );

      expect(screen.getByTestId("repository")).toHaveTextContent(
        "Repository available"
      );
    });
  });

  describe("useAnalysisQuotaRepository", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow(
        "useAnalysisQuotaRepository doit être utilisé dans un AnalysisQuotaRepositoryProvider"
      );

      consoleError.mockRestore();
    });

    it("should return repository instance when used inside provider", () => {
      let capturedRepository: AnalysisQuotaRepository | null = null;

      function CaptureRepository() {
        capturedRepository = useAnalysisQuotaRepository();
        return null;
      }

      const mockRepository = createMockQuotaRepository();

      render(
        <AnalysisQuotaRepositoryProvider repository={mockRepository}>
          <CaptureRepository />
        </AnalysisQuotaRepositoryProvider>
      );

      expect(capturedRepository).toBe(mockRepository);
    });

    it("should maintain stable reference across re-renders", () => {
      const repositories: AnalysisQuotaRepository[] = [];

      function CaptureRepository() {
        const repo = useAnalysisQuotaRepository();
        repositories.push(repo);
        return null;
      }

      const { rerender } = render(
        <AnalysisQuotaRepositoryProvider>
          <CaptureRepository />
        </AnalysisQuotaRepositoryProvider>
      );

      rerender(
        <AnalysisQuotaRepositoryProvider>
          <CaptureRepository />
        </AnalysisQuotaRepositoryProvider>
      );

      expect(repositories[0]).toBe(repositories[1]);
    });
  });
});
