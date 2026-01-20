import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptCommandRepository } from "../PromptCommandRepository";
import { qb } from "@/lib/supabaseQueryBuilder";

vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    insertOne: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  },
}));

describe("SupabasePromptCommandRepository", () => {
  let repository: SupabasePromptCommandRepository;
  const mockUserId = "user-123";
  const mockPromptId = "prompt-456";

  const mockPromptData = {
    title: "New Prompt",
    content: "Test content",
    description: "Test description",
    tags: ["test"],
    visibility: "PRIVATE" as const,
    status: "DRAFT" as const,
    is_favorite: false,
    public_permission: "READ" as const,
    version: "1.0.0",
  };

  const mockCreatedPrompt = {
    id: mockPromptId,
    ...mockPromptData,
    owner_id: mockUserId,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabasePromptCommandRepository();
  });

  describe("create", () => {
    it("should create a prompt with correct data", async () => {
      vi.mocked(qb.insertOne).mockResolvedValue(mockCreatedPrompt);

      const result = await repository.create(mockUserId, mockPromptData);

      expect(qb.insertOne).toHaveBeenCalledWith("prompts", {
        ...mockPromptData,
        owner_id: mockUserId,
      });
      expect(result).toEqual(mockCreatedPrompt);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.create("", mockPromptData)).rejects.toThrow(
        "ID utilisateur requis"
      );
      expect(qb.insertOne).not.toHaveBeenCalled();
    });

    it("should throw error if userId is undefined", async () => {
      await expect(
        repository.create(undefined as unknown as string, mockPromptData)
      ).rejects.toThrow("ID utilisateur requis");
      expect(qb.insertOne).not.toHaveBeenCalled();
    });

    it("should throw on QueryBuilder error", async () => {
      vi.mocked(qb.insertOne).mockRejectedValue(new Error("Insert failed"));

      await expect(
        repository.create(mockUserId, mockPromptData)
      ).rejects.toThrow("Insert failed");
    });
  });

  describe("update", () => {
    const mockUpdates = { title: "Updated Title", is_favorite: true };
    const mockUpdatedPrompt = { ...mockCreatedPrompt, ...mockUpdates };

    it("should update a prompt with correct data", async () => {
      vi.mocked(qb.updateById).mockResolvedValue(mockUpdatedPrompt);

      const result = await repository.update(mockPromptId, mockUpdates);

      expect(qb.updateById).toHaveBeenCalledWith("prompts", mockPromptId, mockUpdates);
      expect(result).toEqual(mockUpdatedPrompt);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.update("", mockUpdates)).rejects.toThrow(
        "ID requis"
      );
      expect(qb.updateById).not.toHaveBeenCalled();
    });

    it("should throw error if id is undefined", async () => {
      await expect(
        repository.update(undefined as unknown as string, mockUpdates)
      ).rejects.toThrow("ID requis");
      expect(qb.updateById).not.toHaveBeenCalled();
    });

    it("should throw on QueryBuilder error", async () => {
      vi.mocked(qb.updateById).mockRejectedValue(new Error("Update failed"));

      await expect(
        repository.update(mockPromptId, mockUpdates)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("delete", () => {
    it("should delete a prompt by id", async () => {
      vi.mocked(qb.deleteById).mockResolvedValue(undefined);

      await repository.delete(mockPromptId);

      expect(qb.deleteById).toHaveBeenCalledWith("prompts", mockPromptId);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.delete("")).rejects.toThrow("ID requis");
      expect(qb.deleteById).not.toHaveBeenCalled();
    });

    it("should throw on QueryBuilder error", async () => {
      vi.mocked(qb.deleteById).mockRejectedValue(new Error("Delete failed"));

      await expect(repository.delete(mockPromptId)).rejects.toThrow("Delete failed");
    });
  });
});
