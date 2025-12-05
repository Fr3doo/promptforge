import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateInitializationService } from "../TemplateInitializationService";
import type { PromptQueryRepository, PromptCommandRepository } from "@/repositories/PromptRepository.interfaces";
import type { VariableRepository } from "@/repositories/VariableRepository";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

vi.mock("@/lib/exampleTemplates", () => ({
  exampleTemplates: [
    {
      title: "Test Template",
      description: "Test description",
      content: "Test content with {{variable}}",
      tags: ["test"],
      visibility: "PRIVATE",
      public_permission: "READ",
      variables: [
        {
          name: "variable",
          type: "STRING",
          required: true,
          default_value: "default",
          help: "Test variable",
          order_index: 0,
        },
      ],
      variableSets: [
        {
          name: "Test Set",
          values: { variable: "test value" },
        },
      ],
    },
  ],
}));

describe("TemplateInitializationService", () => {
  let service: TemplateInitializationService;
  let mockPromptQueryRepository: PromptQueryRepository;
  let mockPromptCommandRepository: PromptCommandRepository;
  let mockVariableRepository: VariableRepository;
  let mockVariableSetRepository: any;
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();

    mockPromptQueryRepository = {
      fetchOwned: vi.fn(),
      fetchAll: vi.fn(),
      fetchById: vi.fn(),
      fetchSharedWithMe: vi.fn(),
      fetchRecent: vi.fn(),
      fetchFavorites: vi.fn(),
      fetchPublicShared: vi.fn(),
      countPublic: vi.fn(),
    } as any;

    mockPromptCommandRepository = {
      create: vi.fn().mockResolvedValue({
        id: "prompt-123",
        title: "Test Template",
        content: "Test content",
        owner_id: mockUserId,
      }),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    mockVariableRepository = {
      create: vi.fn().mockResolvedValue({
        id: "variable-123",
        name: "variable",
      }),
    } as any;

    mockVariableSetRepository = {
      bulkInsert: vi.fn().mockResolvedValue(undefined),
    } as any;

    service = new TemplateInitializationService(
      mockPromptQueryRepository,
      mockPromptCommandRepository,
      mockVariableRepository,
      mockVariableSetRepository
    );
  });

  describe("shouldCreateTemplates", () => {
    it("should return true when user has no prompts", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(true);
      expect(mockPromptQueryRepository.fetchOwned).toHaveBeenCalledWith(mockUserId);
    });

    it("should return false when user has existing prompts", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([
        { id: "existing-prompt" },
      ] as any);

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockRejectedValue(
        new Error("Database error")
      );

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe("createTemplatesForNewUser", () => {
    it("should create templates when user has no prompts", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptCommandRepository.create).toHaveBeenCalled();
      expect(mockVariableRepository.create).toHaveBeenCalled();
    });

    it("should not create templates when user already has prompts", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([
        { id: "existing" },
      ] as any);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptCommandRepository.create).not.toHaveBeenCalled();
      expect(mockVariableRepository.create).not.toHaveBeenCalled();
    });

    it("should create prompt with correct data", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptCommandRepository.create).toHaveBeenCalledWith(mockUserId, {
        title: "Test Template",
        description: "Test description",
        content: "Test content with {{variable}}",
        tags: ["test"],
        visibility: "PRIVATE",
        public_permission: "READ",
        status: "PUBLISHED",
        is_favorite: false,
        version: "1.0.0",
      });
    });

    it("should create variables for template", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockVariableRepository.create).toHaveBeenCalledWith({
        prompt_id: "prompt-123",
        name: "variable",
        type: "STRING",
        required: true,
        default_value: "default",
        help: "Test variable",
        order_index: 0,
      });
    });

    it("should create variable sets", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockVariableSetRepository.bulkInsert).toHaveBeenCalledWith([
        {
          prompt_id: "prompt-123",
          name: "Test Set",
          values: { variable: "test value" },
        },
      ]);
    });

    it("should handle variable creation errors gracefully", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);
      vi.mocked(mockVariableRepository.create).mockRejectedValue(
        new Error("Variable creation failed")
      );

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });

    it("should handle variable set creation errors gracefully", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);
      vi.mocked(mockVariableSetRepository.bulkInsert).mockRejectedValue(
        new Error("Insert failed")
      );

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });

    it("should handle prompt creation errors gracefully", async () => {
      vi.mocked(mockPromptQueryRepository.fetchOwned).mockResolvedValue([]);
      vi.mocked(mockPromptCommandRepository.create).mockRejectedValue(
        new Error("Prompt creation failed")
      );

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });
  });
});
