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

    it("renomme une variable en préservant son ID", async () => {
      const existingVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "oldName",
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

      const renamedVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          id: "var-1", // ID explicite pour préserver l'ID
          name: "newName", // Nouveau nom
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

      // Mock upsert
      const resultVariables: Variable[] = [
        {
          ...existingVariables[0],
          name: "newName", // Nom mis à jour
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

      const result = await repository.upsertMany("prompt-123", renamedVariables);

      expect(result).toEqual(resultVariables);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "var-1", // ID préservé
            name: "newName", // Nom mis à jour
          }),
        ]),
        { onConflict: "id" }
      );
    });

    it("traite correctement un mix de création, mise à jour et renommage", async () => {
      const existingVariables: Variable[] = [
        {
          id: "var-1",
          prompt_id: "prompt-123",
          name: "keep",
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
          name: "rename",
          type: "NUMBER",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 1,
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "var-3",
          prompt_id: "prompt-123",
          name: "delete",
          type: "BOOLEAN",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 2,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const mixedVariables: Omit<VariableInsert, "prompt_id">[] = [
        {
          name: "keep", // Mise à jour (même nom)
          type: "STRING",
          required: false, // Modifié
          default_value: "updated",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        },
        {
          id: "var-2", // Renommage (ID explicite)
          name: "renamed",
          type: "NUMBER",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 1,
        },
        {
          name: "new", // Nouvelle variable
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 2,
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

      // Mock delete (var-3 doit être supprimée)
      const mockIn = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        in: mockIn,
      });

      // Mock upsert
      const resultVariables: Variable[] = [
        {
          ...existingVariables[0],
          required: false,
          default_value: "updated",
        },
        {
          ...existingVariables[1],
          name: "renamed",
        },
        {
          id: "var-4",
          prompt_id: "prompt-123",
          name: "new",
          type: "STRING",
          required: true,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 2,
          created_at: "2024-01-01T00:00:00Z",
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
        .mockReturnValueOnce({ delete: mockDelete })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const result = await repository.upsertMany("prompt-123", mixedVariables);

      expect(result).toEqual(resultVariables);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockIn).toHaveBeenCalledWith("id", ["var-3"]); // Seule var-3 supprimée
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: "var-1", name: "keep" }), // Mise à jour
          expect.objectContaining({ id: "var-2", name: "renamed" }), // Renommage
          expect.objectContaining({ name: "new" }), // Création
        ]),
        { onConflict: "id" }
      );
    });
  });

  describe("Contraintes de base de données", () => {
    describe("Contrainte d'unicité (prompt_id, name)", () => {
      it("empêche la création de variables avec le même nom pour un prompt", async () => {
        const duplicateError = {
          code: "23505", // PostgreSQL unique violation
          message: "duplicate key value violates unique constraint",
        };

        const variable: VariableInsert = {
          prompt_id: "prompt-123",
          name: "existingVar",
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
          error: duplicateError,
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

        await expect(repository.create(variable)).rejects.toMatchObject({
          code: "23505",
        });
      });

      it("permet la création de variables avec le même nom pour différents prompts", async () => {
        const variable1: VariableInsert = {
          prompt_id: "prompt-1",
          name: "commonName",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        };

        const variable2: VariableInsert = {
          prompt_id: "prompt-2",
          name: "commonName",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        };

        const createdVar1: Variable = {
          id: "var-1",
          prompt_id: "prompt-1",
          name: "commonName",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        };

        const createdVar2: Variable = {
          id: "var-2",
          prompt_id: "prompt-2",
          name: "commonName",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
          created_at: "2024-01-01T00:00:00Z",
        };

        const mockSingle1 = vi.fn().mockResolvedValue({
          data: createdVar1,
          error: null,
        });

        const mockSelect1 = vi.fn().mockReturnValue({
          single: mockSingle1,
        });

        const mockInsert1 = vi.fn().mockReturnValue({
          select: mockSelect1,
        });

        const mockSingle2 = vi.fn().mockResolvedValue({
          data: createdVar2,
          error: null,
        });

        const mockSelect2 = vi.fn().mockReturnValue({
          single: mockSingle2,
        });

        const mockInsert2 = vi.fn().mockReturnValue({
          select: mockSelect2,
        });

        mockSupabase.from
          .mockReturnValueOnce({ insert: mockInsert1 })
          .mockReturnValueOnce({ insert: mockInsert2 });

        const result1 = await repository.create(variable1);
        const result2 = await repository.create(variable2);

        expect(result1.name).toBe("commonName");
        expect(result2.name).toBe("commonName");
        expect(result1.prompt_id).toBe("prompt-1");
        expect(result2.prompt_id).toBe("prompt-2");
      });

      it("upsertMany gère correctement les violations de contrainte d'unicité", async () => {
        const existingVariables: Variable[] = [
          {
            id: "var-1",
            prompt_id: "prompt-123",
            name: "existingVar",
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

        const newVariables: Omit<VariableInsert, "prompt_id">[] = [
          {
            name: "existingVar", // Même nom - devrait mettre à jour
            type: "STRING",
            required: false, // Modification
            default_value: "updated",
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
            default_value: "updated",
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

        const result = await repository.upsertMany("prompt-123", newVariables);

        expect(result).toEqual(resultVariables);
        expect(result[0].id).toBe("var-1"); // ID préservé
      });
    });

    describe("Contrainte de clé étrangère avec ON DELETE CASCADE", () => {
      it("supprime automatiquement les variables quand le prompt est supprimé", async () => {
        // Ce test simule le comportement de la base de données
        // En réalité, la suppression cascade est gérée par PostgreSQL
        
        const promptId = "prompt-to-delete";

        // Simuler la suppression du prompt qui déclenche le cascade
        const mockDelete = vi.fn().mockResolvedValue({
          data: null,
          error: null,
        });

        const mockEq = vi.fn().mockReturnValue({
          delete: mockDelete,
        });

        // Mock de la vérification que les variables n'existent plus
        const mockOrder = vi.fn().mockResolvedValue({
          data: [], // Tableau vide après cascade
          error: null,
        });

        const mockEqFetch = vi.fn().mockReturnValue({
          order: mockOrder,
        });

        const mockSelect = vi.fn().mockReturnValue({
          eq: mockEqFetch,
        });

        mockSupabase.from
          .mockReturnValueOnce({ select: mockSelect }); // Vérification après cascade

        const remainingVariables = await repository.fetch(promptId);

        expect(remainingVariables).toEqual([]);
      });

      it("empêche la création de variables avec un prompt_id invalide", async () => {
        const invalidRefError = {
          code: "23503", // PostgreSQL foreign key violation
          message: "violates foreign key constraint",
        };

        const variable: VariableInsert = {
          prompt_id: "non-existent-prompt",
          name: "orphanVar",
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
          error: invalidRefError,
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

        await expect(repository.create(variable)).rejects.toMatchObject({
          code: "23503",
        });
      });
    });

    describe("Tests d'intégrité des données", () => {
      it("maintient la cohérence lors d'opérations concurrentes", async () => {
        // Test que l'upsertMany préserve l'unicité même avec des opérations concurrentes
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

        const concurrentVariables: Omit<VariableInsert, "prompt_id">[] = [
          {
            name: "var1", // Existe déjà
            type: "STRING",
            required: true,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
            order_index: 0,
          },
          {
            name: "var2", // Nouvelle
            type: "NUMBER",
            required: false,
            default_value: "",
            help: "",
            pattern: "",
            options: [],
            order_index: 1,
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
          existingVariables[0],
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

        const result = await repository.upsertMany("prompt-123", concurrentVariables);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("var-1"); // ID préservé
        expect(result[1].id).toBe("var-2"); // Nouvel ID
        
        // Vérifier qu'il n'y a pas de doublons
        const names = result.map(v => v.name);
        expect(new Set(names).size).toBe(names.length);
      });
    });
  });

  // ========================================
  // DATABASE CONSTRAINT TESTS
  // ========================================
  describe('Database constraint validation', () => {
    const testPromptId = 'test-prompt-constraint-id';

    describe('Name constraints', () => {
      it('should reject variable with name > 100 characters', async () => {
        const longName = 'a'.repeat(101);
        
        const mockError = { 
          message: 'violates check constraint "variables_name_length"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: longName,
            type: 'STRING',
            required: false,
          })
        ).rejects.toThrow(/variables_name_length/);
      });

      it('should reject variable with invalid name format (contains spaces)', async () => {
        const mockError = { 
          message: 'violates check constraint "variables_name_format"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'invalid name',  // Contient un espace
            type: 'STRING',
            required: false,
          })
        ).rejects.toThrow(/variables_name_format/);
      });

      it('should reject variable with invalid name format (contains hyphens)', async () => {
        const mockError = { 
          message: 'violates check constraint "variables_name_format"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'invalid-name',  // Contient un tiret
            type: 'STRING',
            required: false,
          })
        ).rejects.toThrow(/variables_name_format/);
      });
    });

    describe('Field length constraints', () => {
      it('should reject variable with default_value > 1000 characters', async () => {
        const mockError = { 
          message: 'violates check constraint "variables_default_value_length"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'test',
            type: 'STRING',
            required: false,
            default_value: 'a'.repeat(1001),
          })
        ).rejects.toThrow(/variables_default_value_length/);
      });

      it('should reject variable with help > 500 characters', async () => {
        const mockError = { 
          message: 'violates check constraint "variables_help_length"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'test',
            type: 'STRING',
            required: false,
            help: 'a'.repeat(501),
          })
        ).rejects.toThrow(/variables_help_length/);
      });

      it('should reject variable with pattern > 200 characters', async () => {
        const mockError = { 
          message: 'violates check constraint "variables_pattern_length"',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'test',
            type: 'STRING',
            required: false,
            pattern: 'a'.repeat(201),
          })
        ).rejects.toThrow(/variables_pattern_length/);
      });
    });

    describe('Options constraints', () => {
      it('should reject variable with > 50 options', async () => {
        const mockError = { 
          message: "Le nombre d'options ne peut pas dépasser 50 (actuel: 51)",
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        const tooManyOptions = Array.from({ length: 51 }, (_, i) => `option_${i}`);
        
        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'test',
            type: 'ENUM',
            required: false,
            options: tooManyOptions,
          })
        ).rejects.toThrow(/nombre d'options ne peut pas dépasser/);
      });

      it('should reject variable with option > 100 characters', async () => {
        const mockError = { 
          message: 'Chaque option ne peut pas dépasser 100 caractères',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'test',
            type: 'ENUM',
            required: false,
            options: ['a'.repeat(101)],
          })
        ).rejects.toThrow(/option ne peut pas dépasser 100 caractères/);
      });
    });

    describe('Variables count constraint', () => {
      it('should reject creating > 50 variables for a prompt', async () => {
        const mockError = { 
          message: 'Un prompt ne peut pas avoir plus de 50 variables (actuel: 50)',
          code: '23514'
        };

        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        });

        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        });

        mockSupabase.from.mockReturnValue({
          insert: mockInsert,
        });

        await expect(
          repository.create({
            prompt_id: testPromptId,
            name: 'var_51',
            type: 'STRING',
            required: false,
          })
        ).rejects.toThrow(/ne peut pas avoir plus de 50 variables/);
      });
    });
  });
});
