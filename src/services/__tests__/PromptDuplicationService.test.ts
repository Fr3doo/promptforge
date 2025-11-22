import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptDuplicationService } from "../PromptDuplicationService";
import type { 
  PromptQueryRepository, 
  PromptCommandRepository,
  Prompt 
} from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";

// Mock PromptQueryRepository
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

// Mock PromptCommandRepository
const mockCommandRepository: PromptCommandRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock VariableRepository
const mockVariableRepository: VariableRepository = {
  fetch: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
  upsertMany: vi.fn(),
};

describe("PromptDuplicationService", () => {
  let service: SupabasePromptDuplicationService;

  beforeEach(() => {
    service = new SupabasePromptDuplicationService(mockQueryRepository, mockCommandRepository);
    vi.clearAllMocks();
  });

  describe("duplicate", () => {
    it("duplique un prompt avec ses variables", async () => {
      const originalPrompt: Prompt = {
        id: "prompt-original",
        title: "Prompt Original",
        content: "Contenu {{var1}}",
        description: "Description",
        tags: ["tag1", "tag2"],
        visibility: "SHARED",
        version: "2.5.0",
        status: "PUBLISHED",
        is_favorite: true,
        owner_id: "user-original",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "WRITE",
      };

      const duplicatedPrompt: Prompt = {
        id: "prompt-duplicate",
        title: "Prompt Original (Copie)",
        content: "Contenu {{var1}}",
        description: "Description",
        tags: ["tag1", "tag2"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        public_permission: "READ",
      };

      const originalVariables = [
        {
          id: "var-1",
          prompt_id: "prompt-original",
          name: "var1",
          type: "STRING" as const,
          required: true,
          default_value: "default",
          help: "Help text",
          pattern: "^[a-z]+$",
          options: null,
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(originalPrompt);
      (mockCommandRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue(duplicatedPrompt);
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue(originalVariables as any);
      vi.mocked(mockVariableRepository.upsertMany).mockResolvedValue([
        {
          ...originalVariables[0],
          id: "var-new",
          prompt_id: "prompt-duplicate",
        },
      ] as any);

      const result = await service.duplicate("user-123", "prompt-original", mockVariableRepository);

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-original");
      expect(mockCommandRepository.create).toHaveBeenCalledWith("user-123", {
        title: "Prompt Original (Copie)",
        content: "Contenu {{var1}}",
        description: "Description",
        tags: ["tag1", "tag2"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        public_permission: "READ",
      });
      expect(mockVariableRepository.fetch).toHaveBeenCalledWith("prompt-original");
      expect(mockVariableRepository.upsertMany).toHaveBeenCalledWith("prompt-duplicate", [
        {
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "default",
          help: "Help text",
          pattern: "^[a-z]+$",
          options: null,
          order_index: 0,
        },
      ]);
      expect(result).toEqual(duplicatedPrompt);
    });

    it("duplique un prompt sans variables", async () => {
      const originalPrompt: Prompt = {
        id: "prompt-original",
        title: "Prompt Sans Variables",
        content: "Contenu sans variable",
        description: "Description",
        tags: ["tag1"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-original",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const duplicatedPrompt: Prompt = {
        id: "prompt-duplicate",
        title: "Prompt Sans Variables (Copie)",
        content: "Contenu sans variable",
        description: "Description",
        tags: ["tag1"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        public_permission: "READ",
      };

      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(originalPrompt);
      (mockCommandRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue(duplicatedPrompt);
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

      const result = await service.duplicate("user-123", "prompt-original", mockVariableRepository);

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-original");
      expect(mockCommandRepository.create).toHaveBeenCalledWith("user-123", {
        title: "Prompt Sans Variables (Copie)",
        content: "Contenu sans variable",
        description: "Description",
        tags: ["tag1"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        public_permission: "READ",
      });
      expect(mockVariableRepository.fetch).toHaveBeenCalledWith("prompt-original");
      expect(mockVariableRepository.upsertMany).not.toHaveBeenCalled();
      expect(result).toEqual(duplicatedPrompt);
    });

    it("rejette si userId est manquant", async () => {
      await expect(
        service.duplicate("", "prompt-123", mockVariableRepository)
      ).rejects.toThrow("ID utilisateur requis");

      expect(mockQueryRepository.fetchById).not.toHaveBeenCalled();
      expect(mockCommandRepository.create).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors de la récupération du prompt original", async () => {
      const mockError = new Error("Fetch failed");
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        service.duplicate("user-123", "prompt-original", mockVariableRepository)
      ).rejects.toThrow(mockError);

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-original");
      expect(mockCommandRepository.create).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors de la création du duplicata", async () => {
      const originalPrompt: Prompt = {
        id: "prompt-original",
        title: "Prompt Original",
        content: "Contenu",
        description: "Description",
        tags: [],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-original",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const mockError = new Error("Insert failed");
      (mockQueryRepository.fetchById as ReturnType<typeof vi.fn>).mockResolvedValue(originalPrompt);
      (mockCommandRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

      await expect(
        service.duplicate("user-123", "prompt-original", mockVariableRepository)
      ).rejects.toThrow(mockError);

      expect(mockQueryRepository.fetchById).toHaveBeenCalledWith("prompt-original");
      expect(mockCommandRepository.create).toHaveBeenCalled();
    });
  });
});
