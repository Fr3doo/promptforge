import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOptimisticLocking } from "../useOptimisticLocking";
import { VersionRepositoryProvider } from "@/contexts/VersionRepositoryContext";
import type { VersionRepository } from "@/repositories/VersionRepository";
import type { ReactNode } from "react";

// Mock du PromptQueryRepository pour checkForServerUpdates
vi.mock("@/repositories/PromptQueryRepository", () => ({
  SupabasePromptQueryRepository: vi.fn().mockImplementation(() => ({
    fetchById: vi.fn(),
  })),
}));

const createMockVersionRepository = (): VersionRepository => ({
  fetchByPromptId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  fetchByIds: vi.fn(),
  updatePromptVersion: vi.fn(),
  fetchLatestByPromptId: vi.fn(),
  existsBySemver: vi.fn(),
});

describe("useOptimisticLocking", () => {
  let mockVersionRepository: VersionRepository;

  beforeEach(() => {
    mockVersionRepository = createMockVersionRepository();
    vi.clearAllMocks();
  });

  const createWrapper = (repository: VersionRepository) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <VersionRepositoryProvider repository={repository}>
          {children}
        </VersionRepositoryProvider>
      );
    };
  };

  describe("checkVersionExists", () => {
    it("should delegate to repository.existsBySemver", async () => {
      vi.mocked(mockVersionRepository.existsBySemver).mockResolvedValue(true);

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      const exists = await result.current.checkVersionExists("prompt-1", "1.0.0");

      expect(mockVersionRepository.existsBySemver).toHaveBeenCalledWith(
        "prompt-1",
        "1.0.0"
      );
      expect(exists).toBe(true);
    });

    it("should return false when version does not exist", async () => {
      vi.mocked(mockVersionRepository.existsBySemver).mockResolvedValue(false);

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      const exists = await result.current.checkVersionExists("prompt-1", "2.0.0");

      expect(exists).toBe(false);
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockVersionRepository.existsBySemver).mockRejectedValue(
        new Error("Repository error")
      );

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      await expect(
        result.current.checkVersionExists("prompt-1", "1.0.0")
      ).rejects.toThrow("Repository error");
    });
  });

  describe("checkForServerUpdates", () => {
    const createMockQueryRepository = (fetchByIdResult: unknown) => ({
      fetchById: vi.fn().mockResolvedValue(fetchByIdResult),
      fetchAll: vi.fn(),
      fetchByOwnerId: vi.fn(),
      fetchSharedWithMe: vi.fn(),
      fetchPublic: vi.fn(),
      fetchFavorites: vi.fn(),
      countByOwnerId: vi.fn(),
      countSharedWithMe: vi.fn(),
      fetchOwned: vi.fn(),
      fetchRecent: vi.fn(),
      fetchPublicShared: vi.fn(),
      countPublic: vi.fn(),
    });

    it("should return hasConflict false when no conflict exists", async () => {
      const { SupabasePromptQueryRepository } = await import(
        "@/repositories/PromptQueryRepository"
      );
      vi.mocked(SupabasePromptQueryRepository).mockImplementation(() =>
        createMockQueryRepository({ updated_at: "2024-01-01T10:00:00Z" })
      );

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z" // Client is newer
      );

      expect(response.hasConflict).toBe(false);
    });

    it("should return hasConflict true when server is newer", async () => {
      const { SupabasePromptQueryRepository } = await import(
        "@/repositories/PromptQueryRepository"
      );
      vi.mocked(SupabasePromptQueryRepository).mockImplementation(() =>
        createMockQueryRepository({ updated_at: "2024-01-01T14:00:00Z" })
      );

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z" // Client is older
      );

      expect(response.hasConflict).toBe(true);
      expect(response.serverUpdatedAt).toBe("2024-01-01T14:00:00Z");
    });

    it("should return hasConflict false on error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { SupabasePromptQueryRepository } = await import(
        "@/repositories/PromptQueryRepository"
      );
      const mockRepo = createMockQueryRepository(null);
      mockRepo.fetchById = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.mocked(SupabasePromptQueryRepository).mockImplementation(() => mockRepo);

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z"
      );

      expect(response.hasConflict).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
