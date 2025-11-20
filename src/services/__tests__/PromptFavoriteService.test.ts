import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptFavoriteService } from "../PromptFavoriteService";
import type { PromptRepository } from "@/repositories/PromptRepository";

// Mock du PromptRepository
const mockPromptRepository: PromptRepository = {
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe("PromptFavoriteService", () => {
  let service: SupabasePromptFavoriteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabasePromptFavoriteService(mockPromptRepository);
  });

  describe("toggleFavorite", () => {
    it("active le favori d'un prompt", async () => {
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.toggleFavorite("prompt-123", false);

      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", { is_favorite: true });
    });

    it("désactive le favori d'un prompt", async () => {
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.toggleFavorite("prompt-123", true);

      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", { is_favorite: false });
    });

    it("gère les erreurs du toggle favorite", async () => {
      const mockError = new Error("Update failed");
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(service.toggleFavorite("prompt-123", false)).rejects.toThrow(mockError);
    });
  });
});
