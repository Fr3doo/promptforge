import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SupabasePromptShareRepository } from "../PromptShareRepository";
import { qb } from "@/lib/supabaseQueryBuilder";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    selectMany: vi.fn(),
    selectManyByIds: vi.fn(),
    selectOne: vi.fn(),
    selectFirst: vi.fn(),
    insertWithoutReturn: vi.fn(),
    updateWhere: vi.fn(),
    deleteById: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

vi.mock("@/lib/errorHandler", () => ({
  handleSupabaseError: vi.fn((result) => {
    if (result.error) throw new Error(result.error.message);
  }),
}));

describe("SupabasePromptShareRepository", () => {
  let repository: SupabasePromptShareRepository;

  const mockShare = {
    id: "share-1",
    prompt_id: "prompt-1",
    shared_with_user_id: "user-2",
    shared_by: "user-1",
    permission: "READ" as const,
    created_at: "2024-01-01T00:00:00Z",
  };

  const mockProfile = {
    id: "user-2",
    name: "John Doe",
    pseudo: "johndoe",
    image: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabasePromptShareRepository();
  });

  describe("getShares", () => {
    it("should return empty array when no shares exist", async () => {
      (qb.selectMany as Mock).mockResolvedValue([]);

      const result = await repository.getShares("prompt-1");

      expect(result).toEqual([]);
      expect(qb.selectMany).toHaveBeenCalledWith("prompt_shares", {
        filters: { eq: { prompt_id: "prompt-1" } },
      });
      expect(qb.selectManyByIds).not.toHaveBeenCalled();
    });

    it("should merge shares with profiles", async () => {
      (qb.selectMany as Mock).mockResolvedValue([mockShare]);
      (qb.selectManyByIds as Mock).mockResolvedValue([mockProfile]);

      const result = await repository.getShares("prompt-1");

      expect(result).toHaveLength(1);
      expect(result[0].shared_with_profile).toEqual(mockProfile);
      expect(qb.selectManyByIds).toHaveBeenCalledWith(
        "public_profiles",
        ["user-2"],
        "id"
      );
    });

    it("should handle shares without matching profiles", async () => {
      (qb.selectMany as Mock).mockResolvedValue([mockShare]);
      (qb.selectManyByIds as Mock).mockResolvedValue([]);

      const result = await repository.getShares("prompt-1");

      expect(result).toHaveLength(1);
      expect(result[0].shared_with_profile).toBeUndefined();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user ID when found", async () => {
      (supabase.rpc as Mock).mockResolvedValue({
        data: "user-123",
        error: null,
      });

      const result = await repository.getUserByEmail("test@example.com");

      expect(result).toEqual({ id: "user-123" });
      expect(supabase.rpc).toHaveBeenCalledWith("get_user_id_by_email", {
        user_email: "test@example.com",
      });
    });

    it("should return null when user not found", async () => {
      (supabase.rpc as Mock).mockResolvedValue({ data: null, error: null });

      const result = await repository.getUserByEmail("unknown@example.com");

      expect(result).toBeNull();
    });
  });

  describe("addShare", () => {
    it("should throw SESSION_EXPIRED when currentUserId is empty", async () => {
      await expect(
        repository.addShare("prompt-1", "user-2", "READ", "")
      ).rejects.toThrow("SESSION_EXPIRED");
    });

    it("should throw SELF_SHARE when sharing with self", async () => {
      await expect(
        repository.addShare("prompt-1", "user-1", "READ", "user-1")
      ).rejects.toThrow("SELF_SHARE");
    });

    it("should throw NOT_PROMPT_OWNER when user is not owner", async () => {
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "other-user" });

      await expect(
        repository.addShare("prompt-1", "user-2", "READ", "user-1")
      ).rejects.toThrow("NOT_PROMPT_OWNER");
    });

    it("should call qb.insertWithoutReturn when authorized", async () => {
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "user-1" });
      (qb.insertWithoutReturn as Mock).mockResolvedValue(undefined);

      await repository.addShare("prompt-1", "user-2", "READ", "user-1");

      expect(qb.insertWithoutReturn).toHaveBeenCalledWith("prompt_shares", {
        prompt_id: "prompt-1",
        shared_with_user_id: "user-2",
        permission: "READ",
        shared_by: "user-1",
      });
    });
  });

  describe("updateSharePermission", () => {
    it("should throw SESSION_EXPIRED when currentUserId is empty", async () => {
      await expect(
        repository.updateSharePermission("share-1", "WRITE", "")
      ).rejects.toThrow("SESSION_EXPIRED");
    });

    it("should throw SHARE_NOT_FOUND when share does not exist", async () => {
      (qb.selectOne as Mock).mockResolvedValue(null);

      await expect(
        repository.updateSharePermission("share-1", "WRITE", "user-1")
      ).rejects.toThrow("SHARE_NOT_FOUND");
    });

    it("should throw UNAUTHORIZED_UPDATE when user is not authorized", async () => {
      (qb.selectOne as Mock).mockResolvedValue({
        ...mockShare,
        shared_by: "other-user",
      });
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "another-user" });

      await expect(
        repository.updateSharePermission("share-1", "WRITE", "user-1")
      ).rejects.toThrow("UNAUTHORIZED_UPDATE");
    });

    it("should update permission when user is share creator", async () => {
      (qb.selectOne as Mock).mockResolvedValue(mockShare);
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "other-user" });
      (qb.updateWhere as Mock).mockResolvedValue(undefined);

      await repository.updateSharePermission("share-1", "WRITE", "user-1");

      expect(qb.updateWhere).toHaveBeenCalledWith(
        "prompt_shares",
        "id",
        "share-1",
        { permission: "WRITE" }
      );
    });

    it("should update permission when user is prompt owner", async () => {
      (qb.selectOne as Mock).mockResolvedValue({
        ...mockShare,
        shared_by: "other-user",
      });
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "user-1" });
      (qb.updateWhere as Mock).mockResolvedValue(undefined);

      await repository.updateSharePermission("share-1", "WRITE", "user-1");

      expect(qb.updateWhere).toHaveBeenCalled();
    });
  });

  describe("deleteShare", () => {
    it("should throw SESSION_EXPIRED when currentUserId is empty", async () => {
      await expect(repository.deleteShare("share-1", "")).rejects.toThrow(
        "SESSION_EXPIRED"
      );
    });

    it("should throw SHARE_NOT_FOUND when share does not exist", async () => {
      (qb.selectOne as Mock).mockResolvedValue(null);

      await expect(
        repository.deleteShare("share-1", "user-1")
      ).rejects.toThrow("SHARE_NOT_FOUND");
    });

    it("should throw UNAUTHORIZED_DELETE when user is not authorized", async () => {
      (qb.selectOne as Mock).mockResolvedValue({
        ...mockShare,
        shared_by: "other-user",
      });
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "another-user" });

      await expect(
        repository.deleteShare("share-1", "user-1")
      ).rejects.toThrow("UNAUTHORIZED_DELETE");
    });

    it("should delete share when user is share creator", async () => {
      (qb.selectOne as Mock).mockResolvedValue(mockShare);
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "other-user" });
      (qb.deleteById as Mock).mockResolvedValue(undefined);

      await repository.deleteShare("share-1", "user-1");

      expect(qb.deleteById).toHaveBeenCalledWith("prompt_shares", "share-1");
    });

    it("should delete share when user is prompt owner", async () => {
      (qb.selectOne as Mock).mockResolvedValue({
        ...mockShare,
        shared_by: "other-user",
      });
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "user-1" });
      (qb.deleteById as Mock).mockResolvedValue(undefined);

      await repository.deleteShare("share-1", "user-1");

      expect(qb.deleteById).toHaveBeenCalled();
    });
  });

  describe("isPromptOwner", () => {
    it("should return true when user is owner", async () => {
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "user-1" });

      const result = await repository.isPromptOwner("prompt-1", "user-1");

      expect(result).toBe(true);
      expect(qb.selectFirst).toHaveBeenCalledWith(
        "prompts",
        { filters: { eq: { id: "prompt-1" } } },
        "owner_id"
      );
    });

    it("should return false when user is not owner", async () => {
      (qb.selectFirst as Mock).mockResolvedValue({ owner_id: "other-user" });

      const result = await repository.isPromptOwner("prompt-1", "user-1");

      expect(result).toBe(false);
    });

    it("should return false when prompt not found", async () => {
      (qb.selectFirst as Mock).mockResolvedValue(null);

      const result = await repository.isPromptOwner("prompt-1", "user-1");

      expect(result).toBe(false);
    });
  });

  describe("getShareById", () => {
    it("should return share when found", async () => {
      (qb.selectOne as Mock).mockResolvedValue(mockShare);

      const result = await repository.getShareById("share-1");

      expect(result).toEqual(mockShare);
      expect(qb.selectOne).toHaveBeenCalledWith(
        "prompt_shares",
        "id",
        "share-1"
      );
    });

    it("should return null when not found", async () => {
      (qb.selectOne as Mock).mockResolvedValue(null);

      const result = await repository.getShareById("share-1");

      expect(result).toBeNull();
    });
  });
});
