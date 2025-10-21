import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseVariableRepository } from "../VariableRepository";
import type { Variable, VariableInsert } from "../VariableRepository";

// Mock du client Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("SupabaseVariableRepository", () => {
  let repository: SupabaseVariableRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseVariableRepository();
  });

  describe("fetch", () => {
    it("récupère les variables d'un prompt par ordre croissant", async () => {
      const mockVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "firstName",
          type: "STRING",
          required: true,
          default_value: "",
          help: "Prénom de l'utilisateur",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "var-2",
          prompt_id: "prompt-123",
          name: "age",
          type: "NUMBER",
          required: false,
          default_value: "18",
          help: "Âge de l'utilisateur",
          pattern: "",
          options: [],
          order_index: 1,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockOrder = vi.fn().mockResolvedValue({
        data: mockVariables,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await repository.fetch("prompt-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("variables");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("prompt_id", "prompt-123");
      expect(mockOrder).toHaveBeenCalledWith("order_index", { ascending: true });
      expect(result).toEqual(mockVariables);
    });

    it("retourne un tableau vide si le promptId est vide", async () => {
      const result = await repository.fetch("");

      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("gère les erreurs de récupération", async () => {
      const mockError = new Error("Database error");

      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockEq = vi.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(repository.fetch("prompt-123")).rejects.toThrow(mockError);
    });
  });

  describe("create", () => {
    it("crée une nouvelle variable", async () => {
      const newVariable: VariableInsert = {
        prompt_id: "prompt-123",
        name: "newVar",
        type: "STRING",
        required: false,
        default_value: "test",
        help: "Variable de test",
        pattern: "",
        options: [],
        order_index: 0,
      };

      const createdVariable: Variable = {
        id: "var-new",
        prompt_id: "prompt-123",
        name: "newVar",
        type: "STRING",
        required: false,
        default_value: "test",
        help: "Variable de test",
        pattern: "",
        options: [],
        order_index: 0,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: createdVariable,
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

      const result = await repository.create(newVariable);

      expect(mockSupabase.from).toHaveBeenCalledWith("variables");
      expect(mockInsert).toHaveBeenCalledWith(newVariable);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(createdVariable);
    });

    it("gère les erreurs de création", async () => {
      const mockError = new Error("Insert failed");
      const newVariable: VariableInsert = {
        prompt_id: "prompt-123",
        name: "newVar",
        type: "STRING",
        required: false,
        default_value: "",
        help: "",
        pattern: "",
        options: [],
        order_index: 0,
      };

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

      await expect(repository.create(newVariable)).rejects.toThrow(mockError);
    });
  });

  describe("update", () => {
    it("met à jour une variable existante", async () => {
      const updates = {
        name: "updatedName",
        required: true,
      };

      const updatedVariable: Variable = {
        id: "var-1",
        prompt_id: "prompt-123",
        name: "updatedName",
        type: "STRING",
        required: true,
        default_value: "",
        help: "",
        pattern: "",
        options: [],
        order_index: 0,
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedVariable,
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

      const result = await repository.update("var-1", updates);

      expect(mockSupabase.from).toHaveBeenCalledWith("variables");
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "var-1");
      expect(result).toEqual(updatedVariable);
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

      await expect(repository.update("var-1", {})).rejects.toThrow(mockError);
    });
  });

  describe("deleteMany", () => {
    it("supprime toutes les variables d'un prompt", async () => {
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

      await repository.deleteMany("prompt-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("variables");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("prompt_id", "prompt-123");
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

      await expect(repository.deleteMany("prompt-123")).rejects.toThrow(mockError);
    });
  });

  describe("upsertMany", () => {
    it("insère de nouvelles variables quand aucune n'existe", async () => {
      const newVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
        {
          name: "var2",
          type: "NUMBER",
          required: false,
          default_value: "0",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
      ];

      // Mock fetch pour récupérer les variables existantes (vide)
      const mockOrderFetch = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        order: mockOrderFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock upsert
      const upsertedVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "var-2",
          prompt_id: "prompt-123",
          name: "var2",
          type: "NUMBER",
          required: false,
          default_value: "0",
          help: "",
          pattern: "",
          options: [],
          order_index: 1,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: upsertedVariables,
        error: null,
      });

      const mockUpsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const result = await repository.upsertMany("prompt-123", newVariables);

      expect(result).toEqual(upsertedVariables);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            prompt_id: "prompt-123",
            name: "var1",
            order_index: 0,
          }),
          expect.objectContaining({
            prompt_id: "prompt-123",
            name: "var2",
            order_index: 1,
          }),
        ]),
        { onConflict: "id" }
      );
    });

    it("met à jour les variables existantes", async () => {
      const existingVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const updatedVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          name: "var1",
          type: "STRING",
          required: false, // Modifié
          default_value: "nouveau",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
      ];

      // Mock fetch
      const mockOrderFetch = vi.fn().mockResolvedValue({
        data: existingVariables,
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        order: mockOrderFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock upsert
      const resultVariables: Variable[] = [
        {
          ...existingVariables[0],
          required: false,
          default_value: "nouveau",
        },
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: resultVariables,
        error: null,
      });

      const mockUpsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const result = await repository.upsertMany("prompt-123", updatedVariables);

      expect(result).toEqual(resultVariables);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "var-1",
            name: "var1",
            required: false,
            default_value: "nouveau",
          }),
        ]),
        { onConflict: "id" }
      );
    });

    it("supprime les variables qui ne sont plus présentes", async () => {
      const existingVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "var-2",
          prompt_id: "prompt-123",
          name: "var2",
          type: "NUMBER",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 1,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const newVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
      ];

      // Mock fetch
      const mockOrderFetch = vi.fn().mockResolvedValue({
        data: existingVariables,
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        order: mockOrderFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock delete
      const mockIn = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        in: mockIn,
      });

      // Mock upsert
      const resultVariables: Variable[] = [existingVariables[0]];

      const mockSelect = vi.fn().mockResolvedValue({
        data: resultVariables,
        error: null,
      });

      const mockUpsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const result = await repository.upsertMany("prompt-123", newVariables);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockIn).toHaveBeenCalledWith("id", ["var-2"]);
      expect(result).toEqual(resultVariables);
    });

    it("supprime toutes les variables si le tableau est vide", async () => {
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

      const result = await repository.upsertMany("prompt-123", []);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("prompt_id", "prompt-123");
      expect(result).toEqual([]);
    });

    it("gère les erreurs lors de l'upsert", async () => {
      const mockError = new Error("Upsert failed");

      const newVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          name: "var1",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
      ];

      // Mock fetch
      const mockOrderFetch = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockEqFetch = vi.fn().mockReturnValue({
        order: mockOrderFetch,
      });

      const mockSelectFetch = vi.fn().mockReturnValue({
        eq: mockEqFetch,
      });

      // Mock upsert avec erreur
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockUpsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      mockSupabase.from
        .mockReturnValueOnce({ select: mockSelectFetch })
        .mockReturnValueOnce({ upsert: mockUpsert });

      await expect(
        repository.upsertMany("prompt-123", newVariables)
      ).rejects.toThrow(mockError);
    });
  });
});
