import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useOptimisticLocking } from "../useOptimisticLocking";
import { VersionRepositoryProvider } from "@/contexts/VersionRepositoryContext";
import { PromptQueryRepositoryProvider } from "@/contexts/PromptQueryRepositoryContext";
import type { VersionRepository } from "@/repositories/VersionRepository";
import type { PromptQueryRepository } from "@/repositories/PromptRepository.interfaces";
import type { ReactNode } from "react";

const createMockVersionRepository = (): VersionRepository => ({
  fetchByPromptId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  fetchByIds: vi.fn(),
  fetchLatestByPromptId: vi.fn(),
  existsBySemver: vi.fn(),
});

const createMockPromptQueryRepository = (): PromptQueryRepository => ({
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
  fetchRecent: vi.fn(),
  fetchFavorites: vi.fn(),
  fetchPublicShared: vi.fn(),
  countPublic: vi.fn(),
});

describe("useOptimisticLocking", () => {
  let mockVersionRepository: VersionRepository;
  let mockPromptQueryRepository: PromptQueryRepository;

  beforeEach(() => {
    mockVersionRepository = createMockVersionRepository();
    mockPromptQueryRepository = createMockPromptQueryRepository();
    vi.clearAllMocks();
  });

  const createWrapper = (
    versionRepository: VersionRepository,
    promptQueryRepository: PromptQueryRepository
  ) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <PromptQueryRepositoryProvider repository={promptQueryRepository}>
          <VersionRepositoryProvider repository={versionRepository}>
            {children}
          </VersionRepositoryProvider>
        </PromptQueryRepositoryProvider>
      );
    };
  };

  describe("checkVersionExists", () => {
    it("should delegate to repository.existsBySemver", async () => {
      vi.mocked(mockVersionRepository.existsBySemver).mockResolvedValue(true);

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
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
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
      });

      const exists = await result.current.checkVersionExists("prompt-1", "2.0.0");

      expect(exists).toBe(false);
    });

    it("should propagate repository errors", async () => {
      vi.mocked(mockVersionRepository.existsBySemver).mockRejectedValue(
        new Error("Repository error")
      );

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
      });

      await expect(
        result.current.checkVersionExists("prompt-1", "1.0.0")
      ).rejects.toThrow("Repository error");
    });
  });

  describe("checkForServerUpdates", () => {
    it("should return hasConflict false when no conflict exists", async () => {
      vi.mocked(mockPromptQueryRepository.fetchById).mockResolvedValue({
        id: "prompt-1",
        title: "Test Prompt",
        content: "Content",
        owner_id: "user-1",
        updated_at: "2024-01-01T10:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        description: null,
        tags: null,
        visibility: "PRIVATE",
        status: "DRAFT",
        is_favorite: false,
        version: "1.0.0",
        public_permission: "READ",
      });

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z" // Client is newer
      );

      expect(mockPromptQueryRepository.fetchById).toHaveBeenCalledWith("prompt-1");
      expect(response.hasConflict).toBe(false);
    });

    it("should return hasConflict true when server is newer", async () => {
      vi.mocked(mockPromptQueryRepository.fetchById).mockResolvedValue({
        id: "prompt-1",
        title: "Test Prompt",
        content: "Content",
        owner_id: "user-1",
        updated_at: "2024-01-01T14:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
        description: null,
        tags: null,
        visibility: "PRIVATE",
        status: "DRAFT",
        is_favorite: false,
        version: "1.0.0",
        public_permission: "READ",
      });

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z" // Client is older
      );

      expect(response.hasConflict).toBe(true);
      expect(response.serverUpdatedAt).toBe("2024-01-01T14:00:00Z");
    });

    it("should return hasConflict false when prompt not found", async () => {
      vi.mocked(mockPromptQueryRepository.fetchById).mockResolvedValue(null as never);

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
      });

      const response = await result.current.checkForServerUpdates(
        "prompt-1",
        "2024-01-01T12:00:00Z"
      );

      expect(response.hasConflict).toBe(false);
    });

    it("should return hasConflict false on error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(mockPromptQueryRepository.fetchById).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useOptimisticLocking(), {
        wrapper: createWrapper(mockVersionRepository, mockPromptQueryRepository),
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
