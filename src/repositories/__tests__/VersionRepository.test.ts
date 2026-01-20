import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseVersionRepository } from "../VersionRepository";

// Mock QueryBuilder
const mockSelectMany = vi.fn();
const mockInsertOne = vi.fn();
const mockDeleteByIds = vi.fn();
const mockSelectManyByIds = vi.fn();
const mockUpdateWhere = vi.fn();
const mockSelectFirst = vi.fn();
const mockExists = vi.fn();

vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    selectMany: (...args: unknown[]) => mockSelectMany(...args),
    insertOne: (...args: unknown[]) => mockInsertOne(...args),
    deleteByIds: (...args: unknown[]) => mockDeleteByIds(...args),
    selectManyByIds: (...args: unknown[]) => mockSelectManyByIds(...args),
    updateWhere: (...args: unknown[]) => mockUpdateWhere(...args),
    selectFirst: (...args: unknown[]) => mockSelectFirst(...args),
    exists: (...args: unknown[]) => mockExists(...args),
  },
}));

describe("SupabaseVersionRepository", () => {
  let repository: SupabaseVersionRepository;

  beforeEach(() => {
    repository = new SupabaseVersionRepository();
    vi.clearAllMocks();
  });

  describe("fetchByPromptId", () => {
    it("should call qb.selectMany with correct params", async () => {
      const mockVersions = [{ id: "v1", semver: "1.0.0" }];
      mockSelectMany.mockResolvedValue(mockVersions);

      const result = await repository.fetchByPromptId("prompt-1");

      expect(mockSelectMany).toHaveBeenCalledWith("versions", {
        filters: { eq: { prompt_id: "prompt-1" } },
        order: { column: "created_at", ascending: false },
      });
      expect(result).toEqual(mockVersions);
    });

    it("should throw if promptId is empty", async () => {
      await expect(repository.fetchByPromptId("")).rejects.toThrow("ID prompt requis");
      expect(mockSelectMany).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should call qb.insertOne with version data", async () => {
      const versionData = { prompt_id: "p1", content: "test", semver: "1.0.0" };
      const createdVersion = { id: "v1", ...versionData };
      mockInsertOne.mockResolvedValue(createdVersion);

      const result = await repository.create(versionData);

      expect(mockInsertOne).toHaveBeenCalledWith("versions", versionData);
      expect(result).toEqual(createdVersion);
    });
  });

  describe("delete", () => {
    it("should call qb.deleteByIds with version ids", async () => {
      mockDeleteByIds.mockResolvedValue(undefined);

      await repository.delete(["v1", "v2"]);

      expect(mockDeleteByIds).toHaveBeenCalledWith("versions", ["v1", "v2"]);
    });

    it("should throw if versionIds is empty", async () => {
      await expect(repository.delete([])).rejects.toThrow("IDs version requis");
      expect(mockDeleteByIds).not.toHaveBeenCalled();
    });
  });

  describe("fetchByIds", () => {
    it("should call qb.selectManyByIds with version ids", async () => {
      const mockVersions = [{ id: "v1" }, { id: "v2" }];
      mockSelectManyByIds.mockResolvedValue(mockVersions);

      const result = await repository.fetchByIds(["v1", "v2"]);

      expect(mockSelectManyByIds).toHaveBeenCalledWith("versions", ["v1", "v2"]);
      expect(result).toEqual(mockVersions);
    });

    it("should throw if versionIds is empty", async () => {
      await expect(repository.fetchByIds([])).rejects.toThrow("IDs version requis");
      expect(mockSelectManyByIds).not.toHaveBeenCalled();
    });
  });

  describe("updatePromptVersion", () => {
    it("should call qb.updateWhere with prompts table", async () => {
      mockUpdateWhere.mockResolvedValue(undefined);

      await repository.updatePromptVersion("prompt-1", "2.0.0");

      expect(mockUpdateWhere).toHaveBeenCalledWith("prompts", "id", "prompt-1", {
        version: "2.0.0",
      });
    });
  });

  describe("fetchLatestByPromptId", () => {
    it("should call qb.selectFirst with correct params", async () => {
      const mockVersion = { id: "v1", semver: "1.0.0" };
      mockSelectFirst.mockResolvedValue(mockVersion);

      const result = await repository.fetchLatestByPromptId("prompt-1");

      expect(mockSelectFirst).toHaveBeenCalledWith("versions", {
        filters: { eq: { prompt_id: "prompt-1" } },
        order: { column: "created_at", ascending: false },
      });
      expect(result).toEqual(mockVersion);
    });

    it("should return null when no version exists", async () => {
      mockSelectFirst.mockResolvedValue(null);

      const result = await repository.fetchLatestByPromptId("prompt-1");

      expect(result).toBeNull();
    });

    it("should throw if promptId is empty", async () => {
      await expect(repository.fetchLatestByPromptId("")).rejects.toThrow(
        "ID prompt requis"
      );
      expect(mockSelectFirst).not.toHaveBeenCalled();
    });
  });

  describe("existsBySemver", () => {
    it("should call qb.exists with correct filters", async () => {
      mockExists.mockResolvedValue(true);

      const result = await repository.existsBySemver("prompt-1", "1.0.0");

      expect(mockExists).toHaveBeenCalledWith("versions", {
        eq: { prompt_id: "prompt-1", semver: "1.0.0" },
      });
      expect(result).toBe(true);
    });

    it("should return false when version does not exist", async () => {
      mockExists.mockResolvedValue(false);

      const result = await repository.existsBySemver("prompt-1", "2.0.0");

      expect(result).toBe(false);
    });

    it("should throw if promptId is missing", async () => {
      await expect(repository.existsBySemver("", "1.0.0")).rejects.toThrow(
        "ID prompt requis"
      );
      expect(mockExists).not.toHaveBeenCalled();
    });

    it("should throw if semver is missing", async () => {
      await expect(repository.existsBySemver("prompt-1", "")).rejects.toThrow(
        "Version semver requise"
      );
      expect(mockExists).not.toHaveBeenCalled();
    });
  });
});
