import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptVisibilityService } from "../PromptVisibilityService";
import type { 
  PromptQueryRepository, 
  PromptMutationRepository,
  Prompt 
} from "@/repositories/PromptRepository.interfaces";

const mockQueryRepository: PromptQueryRepository = {
  fetchAll: vi.fn(),
  fetchOwned: vi.fn(),
  fetchSharedWithMe: vi.fn(),
  fetchById: vi.fn(),
};

const mockMutationRepository: PromptMutationRepository = {
  update: vi.fn(),
};

describe("PromptVisibilityService", () => {
  let service: SupabasePromptVisibilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabasePromptVisibilityService(mockQueryRepository, mockMutationRepository);
  });

  describe("toggleVisibility", () => {
    it("bascule PRIVATE → SHARED avec permission par défaut READ", async () => {
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE");

      expect(result).toBe("SHARED");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "READ",
      });
    });

    it("bascule PRIVATE → SHARED avec permission explicite WRITE", async () => {
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "PRIVATE", "WRITE");

      expect(result).toBe("SHARED");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "WRITE",
      });
    });

    it("bascule SHARED → PRIVATE", async () => {
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await service.toggleVisibility("prompt-123", "SHARED");

      expect(result).toBe("PRIVATE");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        visibility: "PRIVATE",
        status: "DRAFT",
      });
    });

    it("gère les erreurs du toggle", async () => {
      const mockError = new Error("Update failed");
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(service.toggleVisibility("prompt-123", "PRIVATE")).rejects.toThrow(mockError);
    });
  });

  describe("updatePublicPermission", () => {
    it("met à jour la permission publique d'un prompt SHARED", async () => {
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue({
        visibility: "SHARED",
      } as Prompt);
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await service.updatePublicPermission("prompt-123", "WRITE");

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockMutationRepository.update).toHaveBeenCalledWith("prompt-123", {
        public_permission: "WRITE",
      });
    });

    it("refuse de mettre à jour la permission d'un prompt PRIVATE", async () => {
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue({
        visibility: "PRIVATE",
      } as Prompt);

      await expect(service.updatePublicPermission("prompt-123", "WRITE")).rejects.toThrow(
        "PERMISSION_UPDATE_ON_PRIVATE_PROMPT"
      );

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-123");
      expect(mockMutationRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs de fetch lors de l'update permission", async () => {
      const mockError = new Error("Fetch failed");
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(service.updatePublicPermission("prompt-123", "WRITE")).rejects.toThrow(mockError);

      expect(mockMutationRepository.update).not.toHaveBeenCalled();
    });

    it("gère les erreurs d'update lors de l'update permission", async () => {
      const mockError = new Error("Update failed");
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue({
        visibility: "SHARED",
      } as Prompt);
      (mockMutationRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(service.updatePublicPermission("prompt-123", "WRITE")).rejects.toThrow(mockError);
    });
  });
});
