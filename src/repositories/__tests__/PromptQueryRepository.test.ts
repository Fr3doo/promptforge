import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SupabasePromptQueryRepository } from "../PromptQueryRepository";
import { qb } from "@/lib/supabaseQueryBuilder";

vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    selectMany: vi.fn(),
    selectOneRequired: vi.fn(),
    selectWithJoin: vi.fn(),
    countRows: vi.fn(),
  },
}));

describe("SupabasePromptQueryRepository", () => {
  let repository: SupabasePromptQueryRepository;
  const mockUserId = "user-123";
  const mockPromptId = "prompt-456";

  const mockPrompt = {
    id: mockPromptId,
    title: "Test Prompt",
    content: "Test content",
    owner_id: mockUserId,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabasePromptQueryRepository();
  });

  describe("fetchAll", () => {
    it("should call qb.selectMany with correct params", async () => {
      const mockData = [mockPrompt];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      const result = await repository.fetchAll(mockUserId);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts_with_share_count", {
        order: { column: "updated_at", ascending: false },
      });
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchAll("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectMany as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchAll(mockUserId)).rejects.toThrow("DB error");
    });
  });

  describe("fetchOwned", () => {
    it("should call qb.selectMany with owner_id filter", async () => {
      const mockData = [mockPrompt];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      const result = await repository.fetchOwned(mockUserId);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts_with_share_count", {
        filters: { eq: { owner_id: mockUserId } },
        order: { column: "updated_at", ascending: false },
      });
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchOwned("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectMany as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchOwned(mockUserId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("fetchSharedWithMe", () => {
    it("should call qb.selectWithJoin and map results", async () => {
      const joinData = [
        { permission: "READ", prompts: mockPrompt },
        { permission: "WRITE", prompts: null }, // Filtered out
      ];
      (qb.selectWithJoin as Mock).mockResolvedValue(joinData);

      const result = await repository.fetchSharedWithMe(mockUserId);

      expect(qb.selectWithJoin).toHaveBeenCalledWith(
        "prompt_shares",
        "permission, prompts:prompt_id (*)",
        { eq: { shared_with_user_id: mockUserId } }
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(mockPrompt);
      expect(result[0].shared_permission).toBe("READ");
    });

    it("should return empty array if no shares exist", async () => {
      (qb.selectWithJoin as Mock).mockResolvedValue([]);

      const result = await repository.fetchSharedWithMe(mockUserId);

      expect(result).toEqual([]);
    });

    it("should sort results by updated_at descending", async () => {
      const joinData = [
        {
          permission: "READ",
          prompts: { ...mockPrompt, id: "p1", updated_at: "2024-01-01T00:00:00Z" },
        },
        {
          permission: "WRITE",
          prompts: { ...mockPrompt, id: "p2", updated_at: "2024-01-15T00:00:00Z" },
        },
      ];
      (qb.selectWithJoin as Mock).mockResolvedValue(joinData);

      const result = await repository.fetchSharedWithMe(mockUserId);

      expect(result[0].id).toBe("p2"); // More recent first
      expect(result[1].id).toBe("p1");
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchSharedWithMe("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectWithJoin as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchSharedWithMe(mockUserId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("fetchById", () => {
    it("should call qb.selectOneRequired with correct params", async () => {
      (qb.selectOneRequired as Mock).mockResolvedValue(mockPrompt);

      const result = await repository.fetchById(mockPromptId);

      expect(qb.selectOneRequired).toHaveBeenCalledWith(
        "prompts",
        "id",
        mockPromptId
      );
      expect(result).toEqual(mockPrompt);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.fetchById("")).rejects.toThrow("ID requis");
    });

    it("should throw on qb error (not found)", async () => {
      (qb.selectOneRequired as Mock).mockRejectedValue(new Error("Not found"));

      await expect(repository.fetchById(mockPromptId)).rejects.toThrow(
        "Not found"
      );
    });
  });

  describe("fetchRecent", () => {
    it("should call qb.selectMany with default parameters", async () => {
      const mockData = [mockPrompt];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      const result = await repository.fetchRecent(mockUserId);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts", {
        filters: {
          eq: { owner_id: mockUserId },
          gte: { updated_at: expect.any(String) },
        },
        order: { column: "updated_at", ascending: false },
        limit: 5,
      });
      expect(result).toEqual(mockData);
    });

    it("should use custom days and limit parameters", async () => {
      const mockData = [mockPrompt];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      await repository.fetchRecent(mockUserId, 14, 10);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts", {
        filters: {
          eq: { owner_id: mockUserId },
          gte: { updated_at: expect.any(String) },
        },
        order: { column: "updated_at", ascending: false },
        limit: 10,
      });
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchRecent("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectMany as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchRecent(mockUserId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("fetchFavorites", () => {
    it("should call qb.selectMany with favorite filter", async () => {
      const mockData = [{ ...mockPrompt, is_favorite: true }];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      const result = await repository.fetchFavorites(mockUserId);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts", {
        filters: { eq: { owner_id: mockUserId, is_favorite: true } },
        order: { column: "updated_at", ascending: false },
        limit: 5,
      });
      expect(result).toEqual(mockData);
    });

    it("should use custom limit parameter", async () => {
      const mockData = [mockPrompt];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      await repository.fetchFavorites(mockUserId, 10);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts", {
        filters: { eq: { owner_id: mockUserId, is_favorite: true } },
        order: { column: "updated_at", ascending: false },
        limit: 10,
      });
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchFavorites("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectMany as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchFavorites(mockUserId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("fetchPublicShared", () => {
    it("should call qb.selectMany with visibility and neq filters", async () => {
      const mockData = [{ ...mockPrompt, visibility: "SHARED" }];
      (qb.selectMany as Mock).mockResolvedValue(mockData);

      const result = await repository.fetchPublicShared(mockUserId);

      expect(qb.selectMany).toHaveBeenCalledWith("prompts", {
        filters: {
          eq: { visibility: "SHARED" },
          neq: { owner_id: mockUserId },
        },
        order: { column: "updated_at", ascending: false },
        limit: 5,
      });
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchPublicShared("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw on qb error", async () => {
      (qb.selectMany as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.fetchPublicShared(mockUserId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("countPublic", () => {
    it("should call qb.countRows with correct filters", async () => {
      (qb.countRows as Mock).mockResolvedValue(42);

      const result = await repository.countPublic();

      expect(qb.countRows).toHaveBeenCalledWith("prompts", {
        eq: { visibility: "SHARED", status: "PUBLISHED" },
      });
      expect(result).toBe(42);
    });

    it("should return 0 when qb.countRows returns 0", async () => {
      (qb.countRows as Mock).mockResolvedValue(0);

      const result = await repository.countPublic();

      expect(result).toBe(0);
    });

    it("should throw on qb error", async () => {
      (qb.countRows as Mock).mockRejectedValue(new Error("DB error"));

      await expect(repository.countPublic()).rejects.toThrow("DB error");
    });
  });
});
