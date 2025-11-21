import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptVisibilityService } from "../PromptVisibilityService";
import type { PromptRepository, Prompt } from "@/repositories/PromptRepository";

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

describe("PromptVisibilityService", () => {
  let service: SupabasePromptVisibilityService;

  beforeEach(() => {
    service = new SupabasePromptVisibilityService(mockPromptRepository);
    vi.clearAllMocks();
  });

  describe("toggleVisibility", () => {
    it("passe un prompt de PRIVATE à SHARED avec permission READ par défaut", async () => {
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE");

      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "READ",
      });
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de PRIVATE à SHARED avec permission WRITE explicite", async () => {
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE", "WRITE");

      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "WRITE",
      });
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de SHARED à PRIVATE et réinitialise permission à READ", async () => {
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "SHARED");

      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "PRIVATE",
        public_permission: "READ",
      });
      expect(result).toBe("PRIVATE");
    });

    it("gère les erreurs lors du toggle", async () => {
      const mockError = new Error("Update failed");
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        service.toggleVisibility("prompt-123", "PRIVATE")
      ).rejects.toThrow(mockError);
    });
  });

  describe("updatePublicPermission", () => {
    it("met à jour la permission d'un prompt SHARED", async () => {
      const mockPrompt = { visibility: "SHARED" } as Prompt;
      (mockPromptRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(mockPrompt);
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.updatePublicPermission("prompt-123", "WRITE");

      expect(mockPromptRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", {
        public_permission: "WRITE",
      });
    });

    it("rejette la mise à jour si le prompt est PRIVATE", async () => {
      const mockPrompt = { visibility: "PRIVATE" } as Prompt;
      (mockPromptRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(mockPrompt);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");

      expect(mockPromptRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockPromptRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors du select", async () => {
      const mockError = new Error("Select failed");
      (mockPromptRepository.fetchById as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);

      expect(mockPromptRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors de l'update", async () => {
      const mockPrompt = { visibility: "SHARED" } as Prompt;
      const mockError = new Error("Update failed");
      (mockPromptRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(mockPrompt);
      (mockPromptRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);

      expect(mockPromptRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockPromptRepository.update).toHaveBeenCalledWith("prompt-123", {
        public_permission: "WRITE",
      });
    });
  });
});
