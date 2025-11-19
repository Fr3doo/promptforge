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
});
