import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SupabasePromptCommandRepository } from "../PromptCommandRepository";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
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
    const createInsertChain = (finalResult: { data: unknown; error: unknown }) => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(finalResult),
    });

    it("should create a prompt with correct data", async () => {
      const chain = createInsertChain({ data: mockCreatedPrompt, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.create(mockUserId, mockPromptData);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.insert).toHaveBeenCalledWith({
        ...mockPromptData,
        owner_id: mockUserId,
      });
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedPrompt);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.create("", mockPromptData)).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should throw error if userId is undefined", async () => {
      await expect(
        repository.create(undefined as unknown as string, mockPromptData)
      ).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createInsertChain({
        data: null,
        error: { message: "Insert failed" },
      });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(
        repository.create(mockUserId, mockPromptData)
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    const createUpdateChain = (finalResult: { data: unknown; error: unknown }) => ({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(finalResult),
    });

    const mockUpdates = { title: "Updated Title", is_favorite: true };
    const mockUpdatedPrompt = { ...mockCreatedPrompt, ...mockUpdates };

    it("should update a prompt with correct data", async () => {
      const chain = createUpdateChain({ data: mockUpdatedPrompt, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.update(mockPromptId, mockUpdates);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.update).toHaveBeenCalledWith(mockUpdates);
      expect(chain.eq).toHaveBeenCalledWith("id", mockPromptId);
      expect(chain.select).toHaveBeenCalled();
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedPrompt);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.update("", mockUpdates)).rejects.toThrow(
        "ID requis"
      );
    });

    it("should throw error if id is undefined", async () => {
      await expect(
        repository.update(undefined as unknown as string, mockUpdates)
      ).rejects.toThrow("ID requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createUpdateChain({
        data: null,
        error: { message: "Update failed" },
      });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(
        repository.update(mockPromptId, mockUpdates)
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    const createDeleteChain = (finalResult: { data: unknown; error: unknown }) => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue(finalResult),
    });

    it("should delete a prompt by id", async () => {
      const chain = createDeleteChain({ data: null, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      await repository.delete(mockPromptId);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.delete).toHaveBeenCalled();
      expect(chain.eq).toHaveBeenCalledWith("id", mockPromptId);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.delete("")).rejects.toThrow("ID requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createDeleteChain({
        data: null,
        error: { message: "Delete failed" },
      });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.delete(mockPromptId)).rejects.toThrow();
    });
  });
});
