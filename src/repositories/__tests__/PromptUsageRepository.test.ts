import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptUsageRepository } from "../PromptUsageRepository";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("SupabasePromptUsageRepository", () => {
  let repository: SupabasePromptUsageRepository;
  const mockUserId = "user-123";

  beforeEach(() => {
    repository = new SupabasePromptUsageRepository();
    vi.clearAllMocks();
  });

  describe("fetchUsageStats", () => {
    it("should fetch and calculate usage statistics correctly", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Test Prompt 1",
          prompt_usage: [
            { id: "usage-1", success: true },
            { id: "usage-2", success: true },
            { id: "usage-3", success: false },
          ],
        },
        {
          id: "prompt-2",
          title: "Test Prompt 2",
          prompt_usage: [
            { id: "usage-4", success: true },
            { id: "usage-5", success: false },
          ],
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId);

      expect(result).toEqual([
        {
          promptId: "prompt-1",
          title: "Test Prompt 1",
          usageCount: 3,
          successRate: (2 / 3) * 100, // 66.67%
        },
        {
          promptId: "prompt-2",
          title: "Test Prompt 2",
          usageCount: 2,
          successRate: 50, // 50%
        },
      ]);

      expect(supabase.from).toHaveBeenCalledWith("prompts");
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("prompt_usage"));
    });

    it("should filter out prompts with 0 usage", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Used Prompt",
          prompt_usage: [{ id: "usage-1", success: true }],
        },
        {
          id: "prompt-2",
          title: "Unused Prompt",
          prompt_usage: [],
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0].promptId).toBe("prompt-1");
    });

    it("should sort by usage count in descending order", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Low Usage",
          prompt_usage: [{ id: "usage-1", success: true }],
        },
        {
          id: "prompt-2",
          title: "High Usage",
          prompt_usage: [
            { id: "usage-2", success: true },
            { id: "usage-3", success: true },
            { id: "usage-4", success: false },
          ],
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId);

      expect(result[0].usageCount).toBe(3);
      expect(result[0].title).toBe("High Usage");
      expect(result[1].usageCount).toBe(1);
      expect(result[1].title).toBe("Low Usage");
    });

    it("should limit results when limit parameter is provided", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Prompt 1",
          prompt_usage: [{ id: "usage-1", success: true }],
        },
        {
          id: "prompt-2",
          title: "Prompt 2",
          prompt_usage: [{ id: "usage-2", success: true }],
        },
        {
          id: "prompt-3",
          title: "Prompt 3",
          prompt_usage: [{ id: "usage-3", success: true }],
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId, 2);

      expect(result).toHaveLength(2);
    });

    it("should calculate 0% success rate when all usages failed", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Failed Prompt",
          prompt_usage: [
            { id: "usage-1", success: false },
            { id: "usage-2", success: false },
          ],
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId);

      expect(result[0].successRate).toBe(0);
    });

    it("should throw error when Supabase query fails", async () => {
      const mockError = { message: "Database error", code: "500" };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      await expect(repository.fetchUsageStats(mockUserId)).rejects.toEqual(mockError);
    });

    it("should handle null prompt_usage array", async () => {
      const mockData = [
        {
          id: "prompt-1",
          title: "Prompt without usage",
          prompt_usage: null,
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await repository.fetchUsageStats(mockUserId);

      expect(result).toHaveLength(0); // Filtered out because usageCount = 0
    });
  });
});
