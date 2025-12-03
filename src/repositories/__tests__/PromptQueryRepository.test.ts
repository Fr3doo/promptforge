import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { SupabasePromptQueryRepository } from "../PromptQueryRepository";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
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

  // Helper to create chainable mock
  const createChainMock = (finalResult: { data: any; error: any; count?: number | null }) => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(finalResult),
    };
    // Pour les requêtes sans .single()
    chain.order.mockImplementation(() => ({
      ...chain,
      then: (resolve: any) => resolve(finalResult),
    }));
    chain.limit.mockImplementation(() => Promise.resolve(finalResult));
    chain.in.mockImplementation(() => ({
      ...chain,
      order: vi.fn().mockImplementation(() => Promise.resolve(finalResult)),
    }));
    return chain;
  };

  describe("fetchAll", () => {
    it("should fetch all prompts ordered by updated_at desc", async () => {
      const mockData = [mockPrompt];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchAll(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompts_with_share_count");
      expect(chain.select).toHaveBeenCalledWith("*");
      expect(chain.order).toHaveBeenCalledWith("updated_at", { ascending: false });
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchAll("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "DB error" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchAll(mockUserId)).rejects.toThrow();
    });
  });

  describe("fetchOwned", () => {
    it("should fetch prompts owned by user", async () => {
      const mockData = [mockPrompt];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchOwned(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompts_with_share_count");
      expect(chain.eq).toHaveBeenCalledWith("owner_id", mockUserId);
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchOwned("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "DB error" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchOwned(mockUserId)).rejects.toThrow();
    });
  });

  describe("fetchSharedWithMe", () => {
    it("should fetch prompts shared with user", async () => {
      const sharesData = [{ prompt_id: mockPromptId }];
      const promptsData = [mockPrompt];
      
      let callCount = 0;
      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === "prompt_shares") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: sharesData, error: null }),
          };
        }
        // prompts_with_share_count
        const chain = createChainMock({ data: promptsData, error: null });
        return chain;
      });

      const result = await repository.fetchSharedWithMe(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompt_shares");
      expect(result).toEqual(promptsData);
    });

    it("should return empty array if no shares exist", async () => {
      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }));

      const result = await repository.fetchSharedWithMe(mockUserId);

      expect(result).toEqual([]);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchSharedWithMe("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
      }));

      await expect(repository.fetchSharedWithMe(mockUserId)).rejects.toThrow();
    });
  });

  describe("fetchById", () => {
    it("should fetch a single prompt by id", async () => {
      const chain = createChainMock({ data: mockPrompt, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchById(mockPromptId);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.eq).toHaveBeenCalledWith("id", mockPromptId);
      expect(chain.single).toHaveBeenCalled();
      expect(result).toEqual(mockPrompt);
    });

    it("should throw error if id is empty", async () => {
      await expect(repository.fetchById("")).rejects.toThrow("ID requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "Not found" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchById(mockPromptId)).rejects.toThrow();
    });
  });

  describe("fetchRecent", () => {
    it("should fetch recent prompts with default parameters", async () => {
      const mockData = [mockPrompt];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchRecent(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.eq).toHaveBeenCalledWith("owner_id", mockUserId);
      expect(chain.gte).toHaveBeenCalled();
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockData);
    });

    it("should use custom days and limit parameters", async () => {
      const mockData = [mockPrompt];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      await repository.fetchRecent(mockUserId, 14, 10);

      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchRecent("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "DB error" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchRecent(mockUserId)).rejects.toThrow();
    });
  });

  describe("fetchFavorites", () => {
    it("should fetch favorite prompts", async () => {
      const mockData = [{ ...mockPrompt, is_favorite: true }];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchFavorites(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.eq).toHaveBeenCalledWith("owner_id", mockUserId);
      expect(chain.eq).toHaveBeenCalledWith("is_favorite", true);
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockData);
    });

    it("should use custom limit parameter", async () => {
      const mockData = [mockPrompt];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      await repository.fetchFavorites(mockUserId, 10);

      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchFavorites("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "DB error" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchFavorites(mockUserId)).rejects.toThrow();
    });
  });

  describe("fetchPublicShared", () => {
    it("should fetch public shared prompts excluding own", async () => {
      const mockData = [{ ...mockPrompt, visibility: "SHARED" }];
      const chain = createChainMock({ data: mockData, error: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.fetchPublicShared(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.eq).toHaveBeenCalledWith("visibility", "SHARED");
      expect(chain.neq).toHaveBeenCalledWith("owner_id", mockUserId);
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockData);
    });

    it("should throw error if userId is empty", async () => {
      await expect(repository.fetchPublicShared("")).rejects.toThrow("ID utilisateur requis");
    });

    it("should throw on Supabase error", async () => {
      const chain = createChainMock({ data: null, error: { message: "DB error" } });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.fetchPublicShared(mockUserId)).rejects.toThrow();
    });
  });

  describe("countPublic", () => {
    it("should count public published prompts", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      chain.eq.mockResolvedValue({ data: null, error: null, count: 42 });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.countPublic();

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(chain.select).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(chain.eq).toHaveBeenCalledWith("visibility", "SHARED");
      expect(chain.eq).toHaveBeenCalledWith("status", "PUBLISHED");
      expect(result).toBe(42);
    });

    it("should return 0 if count is null", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      chain.eq.mockResolvedValue({ data: null, error: null, count: null });
      (supabase.from as Mock).mockReturnValue(chain);

      const result = await repository.countPublic();

      expect(result).toBe(0);
    });

    it("should throw on Supabase error", async () => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };
      chain.eq.mockResolvedValue({ data: null, error: { message: "DB error" }, count: null });
      (supabase.from as Mock).mockReturnValue(chain);

      await expect(repository.countPublic()).rejects.toThrow();
    });
  });
});
