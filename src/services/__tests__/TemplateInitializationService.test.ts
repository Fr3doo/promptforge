import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateInitializationService } from "../TemplateInitializationService";
import type { PromptRepository } from "@/repositories/PromptRepository";
import type { VariableRepository } from "@/repositories/VariableRepository";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

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
  let mockPromptRepository: PromptRepository;
  let mockVariableRepository: VariableRepository;
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();

    mockPromptRepository = {
      fetchOwned: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: "prompt-123",
        title: "Test Template",
        content: "Test content",
        owner_id: mockUserId,
      }),
    } as any;

    mockVariableRepository = {
      create: vi.fn().mockResolvedValue({
        id: "variable-123",
        name: "variable",
      }),
    } as any;

    service = new TemplateInitializationService(
      mockPromptRepository,
      mockVariableRepository
    );
  });

  describe("shouldCreateTemplates", () => {
    it("should return true when user has no prompts", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(true);
      expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUserId);
    });

    it("should return false when user has existing prompts", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([
        { id: "existing-prompt" },
      ] as any);

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockRejectedValue(
        new Error("Database error")
      );

      const result = await service.shouldCreateTemplates(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe("createTemplatesForNewUser", () => {
    it("should create templates when user has no prompts", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptRepository.create).toHaveBeenCalled();
      expect(mockVariableRepository.create).toHaveBeenCalled();
    });

    it("should not create templates when user already has prompts", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([
        { id: "existing" },
      ] as any);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptRepository.create).not.toHaveBeenCalled();
      expect(mockVariableRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("createTemplates (private method)", () => {
    it("should create prompt with correct data", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await service.createTemplatesForNewUser(mockUserId);

      expect(mockPromptRepository.create).toHaveBeenCalledWith(mockUserId, {
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
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

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
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await service.createTemplatesForNewUser(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("variable_sets");
      expect(mockInsert).toHaveBeenCalledWith([
        {
          prompt_id: "prompt-123",
          name: "Test Set",
          values: { variable: "test value" },
        },
      ]);
    });

    it("should handle variable creation errors gracefully", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);
      vi.mocked(mockVariableRepository.create).mockRejectedValue(
        new Error("Variable creation failed")
      );

      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });

    it("should handle variable set creation errors gracefully", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);

      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Insert failed" },
      });
      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any);

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });

    it("should handle prompt creation errors gracefully", async () => {
      vi.mocked(mockPromptRepository.fetchOwned).mockResolvedValue([]);
      vi.mocked(mockPromptRepository.create).mockRejectedValue(
        new Error("Prompt creation failed")
      );

      await expect(
        service.createTemplatesForNewUser(mockUserId)
      ).resolves.not.toThrow();
    });
  });
});
