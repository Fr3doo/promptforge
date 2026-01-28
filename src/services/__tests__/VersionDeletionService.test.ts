import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultVersionDeletionService } from "../VersionDeletionService";
import type { VersionRepository, Version } from "@/repositories/VersionRepository";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";

describe("DefaultVersionDeletionService", () => {
  const mockVersionRepository: VersionRepository = {
    fetchByPromptId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    fetchByIds: vi.fn(),
    fetchLatestByPromptId: vi.fn(),
    existsBySemver: vi.fn(),
  };

  const mockPromptMutationRepository: PromptMutationRepository = {
    update: vi.fn(),
    updateVersion: vi.fn(),
  };

  const service = new DefaultVersionDeletionService(
    mockVersionRepository,
    mockPromptMutationRepository
  );

  const createMockVersion = (overrides: Partial<Version> = {}): Version => ({
    id: "version-1",
    prompt_id: "prompt-1",
    semver: "1.0.0",
    content: "test content",
    message: null,
    variables: null,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteWithCascade", () => {
    it("should delete versions and return count", async () => {
      vi.mocked(mockVersionRepository.fetchByIds).mockResolvedValue([
        createMockVersion({ semver: "1.0.0" }),
      ]);
      vi.mocked(mockVersionRepository.delete).mockResolvedValue();

      const result = await service.deleteWithCascade({
        versionIds: ["v1"],
        promptId: "prompt-1",
        currentVersion: "2.0.0", // Different from deleted version
      });

      expect(result.promptId).toBe("prompt-1");
      expect(result.deletedCount).toBe(1);
      expect(result.newCurrentVersion).toBeUndefined();
      expect(mockVersionRepository.delete).toHaveBeenCalledWith(["v1"]);
      expect(mockPromptMutationRepository.updateVersion).not.toHaveBeenCalled();
    });

    it("should update to latest version when current version is deleted", async () => {
      vi.mocked(mockVersionRepository.fetchByIds).mockResolvedValue([
        createMockVersion({ semver: "2.0.0" }),
      ]);
      vi.mocked(mockVersionRepository.delete).mockResolvedValue();
      vi.mocked(mockVersionRepository.fetchLatestByPromptId).mockResolvedValue(
        createMockVersion({ semver: "1.5.0" })
      );
      vi.mocked(mockPromptMutationRepository.updateVersion).mockResolvedValue();

      const result = await service.deleteWithCascade({
        versionIds: ["v1"],
        promptId: "prompt-1",
        currentVersion: "2.0.0", // Same as deleted version
      });

      expect(result.newCurrentVersion).toBe("1.5.0");
      expect(mockVersionRepository.fetchLatestByPromptId).toHaveBeenCalledWith("prompt-1");
      expect(mockPromptMutationRepository.updateVersion).toHaveBeenCalledWith("prompt-1", "1.5.0");
    });

    it("should reset to 1.0.0 when no versions remain", async () => {
      vi.mocked(mockVersionRepository.fetchByIds).mockResolvedValue([
        createMockVersion({ semver: "1.0.0" }),
      ]);
      vi.mocked(mockVersionRepository.delete).mockResolvedValue();
      vi.mocked(mockVersionRepository.fetchLatestByPromptId).mockResolvedValue(null);
      vi.mocked(mockPromptMutationRepository.updateVersion).mockResolvedValue();

      const result = await service.deleteWithCascade({
        versionIds: ["v1"],
        promptId: "prompt-1",
        currentVersion: "1.0.0",
      });

      expect(result.newCurrentVersion).toBe("1.0.0");
      expect(mockPromptMutationRepository.updateVersion).toHaveBeenCalledWith("prompt-1", "1.0.0");
    });

    it("should not update prompt when current version is not provided", async () => {
      vi.mocked(mockVersionRepository.fetchByIds).mockResolvedValue([
        createMockVersion({ semver: "1.0.0" }),
      ]);
      vi.mocked(mockVersionRepository.delete).mockResolvedValue();

      const result = await service.deleteWithCascade({
        versionIds: ["v1"],
        promptId: "prompt-1",
        // No currentVersion provided
      });

      expect(result.newCurrentVersion).toBeUndefined();
      expect(mockPromptMutationRepository.updateVersion).not.toHaveBeenCalled();
    });

    it("should handle multiple versions deletion", async () => {
      vi.mocked(mockVersionRepository.fetchByIds).mockResolvedValue([
        createMockVersion({ id: "v1", semver: "1.0.0" }),
        createMockVersion({ id: "v2", semver: "1.1.0" }),
        createMockVersion({ id: "v3", semver: "1.2.0" }),
      ]);
      vi.mocked(mockVersionRepository.delete).mockResolvedValue();
      vi.mocked(mockVersionRepository.fetchLatestByPromptId).mockResolvedValue(
        createMockVersion({ semver: "0.9.0" })
      );
      vi.mocked(mockPromptMutationRepository.updateVersion).mockResolvedValue();

      const result = await service.deleteWithCascade({
        versionIds: ["v1", "v2", "v3"],
        promptId: "prompt-1",
        currentVersion: "1.1.0",
      });

      expect(result.deletedCount).toBe(3);
      expect(result.newCurrentVersion).toBe("0.9.0");
      expect(mockVersionRepository.delete).toHaveBeenCalledWith(["v1", "v2", "v3"]);
    });
  });
});
