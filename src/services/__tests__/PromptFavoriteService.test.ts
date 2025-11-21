import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptFavoriteService } from "../PromptFavoriteService";
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";

/**
 * Tests PromptFavoriteService avec injection ISP
 * Mock uniquement PromptMutationRepository (1 méthode au lieu de 7)
 * Réduction mocking : -86%
 */

// Mock du PromptMutationRepository (ISP - 1 méthode seulement)
const mockMutationRepository: PromptMutationRepository = {
  update: vi.fn(),
};

describe("PromptFavoriteService", () => {
  let service: SupabasePromptFavoriteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabasePromptFavoriteService(mockMutationRepository);
  });

  describe("toggleFavorite", () => {
    it("active le favori d'un prompt", async () => {
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.toggleFavorite("prompt-123", false);

      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", { is_favorite: true });
    });

    it("désactive le favori d'un prompt", async () => {
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.toggleFavorite("prompt-123", true);

      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", { is_favorite: false });
    });

    it("gère les erreurs du toggle favorite", async () => {
      const mockError = new Error("Update failed");
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(service.toggleFavorite("prompt-123", false)).rejects.toThrow(mockError);
    });
  });
});
