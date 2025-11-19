import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptDuplicationService } from "../PromptDuplicationService";
import type { VariableRepository } from "@/repositories/VariableRepository";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

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
    service = new SupabasePromptDuplicationService();
    vi.clearAllMocks();
  });

  describe("duplicate", () => {
    it("duplique un prompt avec ses variables", async () => {
      const originalPrompt = {
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

      const duplicatedPrompt = {
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

      // Mock VariableRepository.fetch
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue(originalVariables as any);

      // Mock VariableRepository.upsertMany
      vi.mocked(mockVariableRepository.upsertMany).mockResolvedValue([
        {
          ...originalVariables[0],
          id: "var-new",
          prompt_id: "prompt-duplicate",
        },
      ] as any);

      // Mock Supabase fetch (select original prompt)
      const mockSingleFetch = vi.fn().mockResolvedValue({
        data: originalPrompt,
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        single: mockSingleFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock Supabase insert (create duplicate)
      const mockSingleInsert = vi.fn().mockResolvedValue({
        data: duplicatedPrompt,
        error: null,
      });

      const mockSelectInsert = vi.fn().mockReturnValue({
        single: mockSingleInsert,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelectInsert,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch }) // Fetch original
        .mockReturnValueOnce({ insert: mockInsert }); // Insert duplicate

      const result = await service.duplicate("user-123", "prompt-original", mockVariableRepository);

      // Vérifications
      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockVariableRepository.fetch).toHaveBeenCalledWith("prompt-original");
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Prompt Original (Copie)",
        content: originalPrompt.content,
        description: originalPrompt.description,
        tags: originalPrompt.tags,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-123",
      });
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
      const originalPrompt = {
        id: "prompt-no-vars",
        title: "Prompt Sans Variables",
        content: "Contenu simple",
        description: null,
        tags: null,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-original",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const duplicatedPrompt = {
        ...originalPrompt,
        id: "prompt-duplicate-no-vars",
        title: "Prompt Sans Variables (Copie)",
        owner_id: "user-123",
      };

      // Mock VariableRepository.fetch (empty array)
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

      // Mock Supabase
      const mockSingleFetch = vi.fn().mockResolvedValue({
        data: originalPrompt,
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        single: mockSingleFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      const mockSingleInsert = vi.fn().mockResolvedValue({
        data: duplicatedPrompt,
        error: null,
      });

      const mockSelectInsert = vi.fn().mockReturnValue({
        single: mockSingleInsert,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelectInsert,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ insert: mockInsert });

      const result = await service.duplicate("user-123", "prompt-no-vars", mockVariableRepository);

      // Vérifier que upsertMany n'est PAS appelé (pas de variables)
      expect(mockVariableRepository.upsertMany).not.toHaveBeenCalled();
      expect(result).toEqual(duplicatedPrompt);
    });

    it("lance une erreur si userId est manquant", async () => {
      await expect(service.duplicate("", "prompt-id", mockVariableRepository)).rejects.toThrow(
        "ID utilisateur requis"
      );

      // Vérifier qu'aucune requête Supabase n'est faite
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("gère les erreurs Supabase lors du fetch du prompt original", async () => {
      const mockError = new Error("Prompt not found");

      const mockSingleFetch = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        single: mockSingleFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      mockSupabase.from.mockReturnValue({ select: mockSelectFetch });

      await expect(
        service.duplicate("user-123", "invalid-prompt", mockVariableRepository)
      ).rejects.toThrow(mockError);
    });

    it("gère les erreurs Supabase lors de la création du duplicata", async () => {
      const originalPrompt = {
        id: "prompt-original",
        title: "Prompt Original",
        content: "Contenu",
        description: null,
        tags: null,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: "user-original",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      // Mock fetch (succès)
      const mockSingleFetch = vi.fn().mockResolvedValue({
        data: originalPrompt,
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        single: mockSingleFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock insert (erreur)
      const mockError = new Error("Insert failed");

      const mockSingleInsert = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelectInsert = vi.fn().mockReturnValue({
        single: mockSingleInsert,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelectInsert,
      });

      // Mock VariableRepository.fetch
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ insert: mockInsert });

      await expect(
        service.duplicate("user-123", "prompt-original", mockVariableRepository)
      ).rejects.toThrow(mockError);
    });
  });
});
