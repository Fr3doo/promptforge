import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptRepository } from "../PromptRepository";
import type { Prompt } from "../PromptRepository";
import type { VariableRepository } from "../VariableRepository";

// Mock du client Supabase
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("SupabasePromptRepository", () => {
  let repository: SupabasePromptRepository;
  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabasePromptRepository();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
  });

  describe("fetchAll", () => {
    it("récupère tous les prompts par ordre décroissant de mise à jour", async () => {
      const mockPrompts: Prompt[] = [
        {
          id: "prompt-1",
          title: "Prompt 1",
          content: "Contenu 1",
          description: "Description 1",
          tags: ["tag1"],
          visibility: "PRIVATE",
          version: "1.0.0",
          status: "PUBLISHED",
          is_favorite: false,
          owner_id: "user-123",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
          public_permission: "READ",
        },
        {
          id: "prompt-2",
          title: "Prompt 2",
          content: "Contenu 2",
          description: null,
          tags: [],
          visibility: "SHARED",
          version: "1.0.0",
          status: "PUBLISHED",
          is_favorite: true,
          owner_id: "user-123",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
          public_permission: "READ",
        },
      ];

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockPrompts,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await repository.fetchAll("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("updated_at", { ascending: false });
      expect(result).toEqual(mockPrompts);
    });

    it("gère les erreurs de récupération", async () => {
      const mockError = new Error("Database error");

      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(repository.fetchAll("user-123")).rejects.toThrow(mockError);
    });
  });

  describe("fetchById", () => {
    it("récupère un prompt par son ID", async () => {
      const mockPrompt: Prompt = {
        id: "prompt-123",
        title: "Mon Prompt",
        content: "Contenu du prompt",
        description: "Description",
        tags: ["test"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockPrompt,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await repository.fetchById("prompt-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
      expect(result).toEqual(mockPrompt);
    });

    it("lève une erreur si l'ID est manquant", async () => {
      await expect(repository.fetchById("")).rejects.toThrow("ID requis");
    });

    it("gère les erreurs de récupération par ID", async () => {
      const mockError = new Error("Prompt not found");

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(repository.fetchById("invalid-id")).rejects.toThrow(mockError);
    });
  });

  describe("create", () => {
    it("crée un nouveau prompt avec l'utilisateur connecté", async () => {
      const newPromptData = {
        title: "Nouveau Prompt",
        content: "Contenu du nouveau prompt",
        description: "Description",
        tags: ["nouveau", "test"],
        visibility: "PRIVATE" as const,
        version: "1.0.0",
        status: "PUBLISHED" as const,
        is_favorite: false,
        public_permission: "READ" as const,
      };

      const createdPrompt: Prompt = {
        id: "prompt-new",
        ...newPromptData,
        owner_id: mockUser.id,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: createdPrompt,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const result = await repository.create(mockUser.id, newPromptData);

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockInsert).toHaveBeenCalledWith({
        ...newPromptData,
        owner_id: mockUser.id,
      });
      expect(result).toEqual(createdPrompt);
    });

    it("lève une erreur si l'ID utilisateur n'est pas fourni", async () => {
      const newPromptData = {
        title: "Nouveau Prompt",
        content: "Contenu",
        description: null,
        tags: [],
        visibility: "PRIVATE" as const,
        version: "1.0.0",
        status: "PUBLISHED" as const,
        is_favorite: false,
        public_permission: "READ" as const,
      };

      await expect(repository.create("", newPromptData)).rejects.toThrow("ID utilisateur requis");
    });

    it("n'appelle pas supabase.auth.getUser", async () => {
      const newPromptData = {
        title: "Test",
        content: "Contenu",
        description: null,
        tags: [],
        visibility: "PRIVATE" as const,
        version: "1.0.0",
        status: "PUBLISHED" as const,
        is_favorite: false,
        public_permission: "READ" as const,
      };

      const createdPrompt: Prompt = {
        ...newPromptData,
        id: "new-id",
        owner_id: mockUser.id,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: createdPrompt,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await repository.create(mockUser.id, newPromptData);

      // Vérifier que auth.getUser n'a PAS été appelé
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    });

    it("gère les erreurs de création", async () => {
      const mockError = new Error("Insert failed");

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      const newPromptData = {
        title: "Nouveau Prompt",
        content: "Contenu",
        description: null,
        tags: [],
        visibility: "PRIVATE" as const,
        version: "1.0.0",
        status: "PUBLISHED" as const,
        is_favorite: false,
        public_permission: "READ" as const,
      };

      await expect(repository.create(mockUser.id, newPromptData)).rejects.toThrow(mockError);
    });
  });

  describe("update", () => {
    it("met à jour un prompt existant", async () => {
      const updates = {
        title: "Titre Modifié",
        content: "Nouveau contenu",
      };

      const updatedPrompt: Prompt = {
        id: "prompt-123",
        title: "Titre Modifié",
        content: "Nouveau contenu",
        description: null,
        tags: [],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        public_permission: "READ",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedPrompt,
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await repository.update("prompt-123", updates);

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
      expect(result).toEqual(updatedPrompt);
    });

    it("gère les erreurs de mise à jour", async () => {
      const mockError = new Error("Update failed");

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await expect(repository.update("prompt-123", {})).rejects.toThrow(mockError);
    });
  });

  describe("delete", () => {
    it("supprime un prompt", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      });

      await repository.delete("prompt-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
    });

    it("gère les erreurs de suppression", async () => {
      const mockError = new Error("Delete failed");

      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      });

      await expect(repository.delete("prompt-123")).rejects.toThrow(mockError);
    });
  });

  describe("duplicate", () => {
    let mockVariableRepository: VariableRepository;

    beforeEach(() => {
      mockVariableRepository = {
        fetch: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteMany: vi.fn(),
        upsertMany: vi.fn(),
      };
    });

    it("duplique un prompt avec ses variables en utilisant VariableRepository", async () => {
      const originalPrompt = {
        id: "prompt-original",
        title: "Prompt Original",
        content: "Contenu {{var1}}",
        description: "Description",
        tags: ["original"],
        visibility: "SHARED",
        version: "2.0.0",
        status: "PUBLISHED",
        is_favorite: true,
        owner_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const duplicatedPrompt: Prompt = {
        id: "prompt-duplicate",
        title: "Prompt Original (Copie)",
        content: "Contenu {{var1}}",
        description: "Description",
        tags: ["original"],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: mockUser.id,
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
          default_value: "",
          help: "Help text",
          pattern: "",
          options: null,
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock VariableRepository.fetch to return original variables
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue(originalVariables as any);

      // Mock VariableRepository.upsertMany
      vi.mocked(mockVariableRepository.upsertMany).mockResolvedValue([
        {
          ...originalVariables[0],
          id: "var-new",
          prompt_id: "prompt-duplicate",
        },
      ] as any);

      // Mock pour récupérer le prompt original
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

      // Mock pour créer le nouveau prompt
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
        .mockReturnValueOnce({ select: mockSelectFetch }) // Fetch original prompt
        .mockReturnValueOnce({ insert: mockInsert }); // Insert new prompt

      const result = await repository.duplicate(mockUser.id, "prompt-original", mockVariableRepository);

      // Verify prompt was fetched
      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");

      // Verify variables were fetched using VariableRepository
      expect(mockVariableRepository.fetch).toHaveBeenCalledWith("prompt-original");

      // Verify prompt was created with correct data
      expect(mockInsert).toHaveBeenCalledWith({
        title: "Prompt Original (Copie)",
        content: originalPrompt.content,
        description: originalPrompt.description,
        tags: originalPrompt.tags,
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: mockUser.id,
      });

      // Verify variables were duplicated using VariableRepository.upsertMany
      expect(mockVariableRepository.upsertMany).toHaveBeenCalledWith(
        "prompt-duplicate",
        [
          {
            name: "var1",
            type: "STRING",
            required: true,
            default_value: "",
            help: "Help text",
            pattern: "",
            options: null,
            order_index: 0,
          },
        ]
      );

      expect(result).toEqual(duplicatedPrompt);
    });

    it("duplique un prompt sans variables", async () => {
      const originalPrompt = {
        id: "prompt-original",
        title: "Prompt Simple",
        content: "Contenu simple",
        description: null,
        tags: [],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const duplicatedPrompt: Prompt = {
        id: "prompt-duplicate",
        title: "Prompt Simple (Copie)",
        content: "Contenu simple",
        description: null,
        tags: [],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "DRAFT",
        is_favorite: false,
        owner_id: mockUser.id,
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        public_permission: "READ",
      };

      // Mock VariableRepository to return no variables
      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

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

      const result = await repository.duplicate(mockUser.id, "prompt-original", mockVariableRepository);

      expect(mockVariableRepository.fetch).toHaveBeenCalledWith("prompt-original");
      expect(mockVariableRepository.upsertMany).not.toHaveBeenCalled();
      expect(result).toEqual(duplicatedPrompt);
    });

    it("n'appelle pas supabase.auth.getUser lors de la duplication", async () => {
      const originalPrompt: Prompt = {
        id: "prompt-original",
        title: "Test",
        content: "Contenu",
        description: null,
        tags: [],
        visibility: "PRIVATE",
        version: "1.0.0",
        status: "PUBLISHED",
        is_favorite: false,
        owner_id: "user-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        public_permission: "READ",
      };

      const duplicatedPrompt: Prompt = {
        ...originalPrompt,
        id: "prompt-duplicate",
        title: "Test (Copie)",
        owner_id: mockUser.id,
      };

      vi.mocked(mockVariableRepository.fetch).mockResolvedValue([]);

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

      await repository.duplicate(mockUser.id, "prompt-original", mockVariableRepository);

      // Vérifier que auth.getUser n'a PAS été appelé
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    });

    it("gère les erreurs lors de la duplication", async () => {
      const mockError = new Error("Fetch failed");

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
        repository.duplicate(mockUser.id, "invalid-id", mockVariableRepository)
      ).rejects.toThrow(mockError);
    });
  });


  describe("toggleVisibility", () => {
    it("passe un prompt de PRIVATE à SHARED", async () => {
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

      const result = await repository.toggleVisibility("prompt-123", "PRIVATE");

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockUpdate).toHaveBeenCalledWith({
        visibility: "SHARED",
        status: "PUBLISHED",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de SHARED à PRIVATE", async () => {
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

      const result = await repository.toggleVisibility("prompt-123", "SHARED");

      expect(mockUpdate).toHaveBeenCalledWith({
        visibility: "PRIVATE",
        status: "PUBLISHED",
      });
      expect(result).toBe("PRIVATE");
    });

    it("gère les erreurs du toggle visibility", async () => {
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

      await expect(repository.toggleVisibility("prompt-123", "PRIVATE")).rejects.toThrow(mockError);
    });
  });
});
