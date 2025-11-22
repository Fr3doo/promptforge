import { describe, it, expect, beforeEach, vi } from "vitest";
import { SupabasePromptVisibilityService } from "../PromptVisibilityService";
import type { 
  PromptMutationRepository, 
  PromptQueryRepository,
  Prompt 
} from "@/repositories/PromptRepository.interfaces";

// Mock repositories
const mockMutationRepository: PromptMutationRepository = {
  update: vi.fn(),
};

const mockQueryRepository: PromptQueryRepository = {
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
  fetchRecent: vi.fn(),
  fetchFavorites: vi.fn(),
  fetchPublicShared: vi.fn(),
  countPublic: vi.fn(),
};

describe("PromptVisibilityService", () => {
  let service: SupabasePromptVisibilityService;

  beforeEach(() => {
    service = new SupabasePromptVisibilityService(mockMutationRepository, mockQueryRepository);
    vi.clearAllMocks();
  });

  describe("toggleVisibility", () => {
    it("passe un prompt de PRIVATE à SHARED avec permission READ par défaut", async () => {
      vi.mocked(mockMutationRepository.update).mockResolvedValue({} as Prompt);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE");

      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "READ",
      });
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de PRIVATE à SHARED avec permission WRITE explicite", async () => {
      vi.mocked(mockMutationRepository.update).mockResolvedValue({} as Prompt);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE", "WRITE");

      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "WRITE",
      });
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de SHARED à PRIVATE et réinitialise permission à READ", async () => {
      vi.mocked(mockMutationRepository.update).mockResolvedValue({} as Prompt);

      const result = await service.toggleVisibility("prompt-123", "SHARED");

      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "PRIVATE",
        public_permission: "READ",
      });
      expect(result).toBe("PRIVATE");
    });

    it("gère les erreurs lors du toggle", async () => {
      const mockError = new Error("Update failed");
      vi.mocked(mockMutationRepository.update).mockRejectedValue(mockError);

      await expect(
        service.toggleVisibility("prompt-123", "PRIVATE")
      ).rejects.toThrow(mockError);
    });
  });

  describe("updatePublicPermission", () => {
    it("met à jour la permission d'un prompt SHARED", async () => {
      const mockPrompt = { visibility: "SHARED" } as Prompt;
      vi.mocked(mockQueryRepository.fetchById).mockResolvedValue(mockPrompt);
      vi.mocked(mockMutationRepository.update).mockResolvedValue({} as Prompt);

      await service.updatePublicPermission("prompt-123", "WRITE");

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        public_permission: "WRITE",
      });
    });

    it("rejette la mise à jour si le prompt est PRIVATE", async () => {
      const mockPrompt = { visibility: "PRIVATE" } as Prompt;
      vi.mocked(mockQueryRepository.fetchById).mockResolvedValue(mockPrompt);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockMutationRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors du select", async () => {
      const mockError = new Error("Select failed");
      vi.mocked(mockQueryRepository.fetchById).mockRejectedValue(mockError);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);

      expect(mockMutationRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors de l'update", async () => {
      const mockPrompt = { visibility: "SHARED" } as Prompt;
      const mockError = new Error("Update failed");
      vi.mocked(mockQueryRepository.fetchById).mockResolvedValue(mockPrompt);
      vi.mocked(mockMutationRepository.update).mockRejectedValue(mockError);

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        public_permission: "WRITE",
      });
    });
  });
});
