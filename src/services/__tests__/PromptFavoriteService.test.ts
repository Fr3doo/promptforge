import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptFavoriteService } from "../PromptFavoriteService";

// Mock du client Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("PromptFavoriteService", () => {
  let service: SupabasePromptFavoriteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabasePromptFavoriteService();
  });

  describe("toggleFavorite", () => {
    it("active le favori d'un prompt", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await service.toggleFavorite("prompt-123", false);

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockUpdate).toHaveBeenCalledWith({ is_favorite: true });
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
    });

    it("désactive le favori d'un prompt", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await service.toggleFavorite("prompt-123", true);

      expect(mockUpdate).toHaveBeenCalledWith({ is_favorite: false });
    });

    it("gère les erreurs du toggle favorite", async () => {
      const mockError = new Error("Update failed");

      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await expect(service.toggleFavorite("prompt-123", false)).rejects.toThrow(mockError);
    });
  });
});
