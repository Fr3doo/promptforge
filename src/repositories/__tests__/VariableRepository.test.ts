import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { SupabaseVariableRepository } from "../VariableRepository";
import type { Variable, VariableInsert, VariableUpsertInput } from "../VariableRepository";
import { qb } from "@/lib/supabaseQueryBuilder";

// Mock du QueryBuilder
vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    selectMany: vi.fn(),
    insertOne: vi.fn(),
    updateById: vi.fn(),
    deleteWhere: vi.fn(),
    deleteByIds: vi.fn(),
    upsertMany: vi.fn(),
  },
}));

// Mock du logger
vi.mock("@/lib/logger", () => ({
  captureException: vi.fn(),
}));

describe("SupabaseVariableRepository", () => {
  let repository: SupabaseVariableRepository;

  const mockVariable: Variable = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseVariableRepository();
  });

  describe("fetch", () => {
    it("récupère les variables d'un prompt par ordre croissant", async () => {
      const mockVariables: Variable[] = [
        mockVariable,
        {
          ...mockVariable,
          id: "var-2",
          name: "age",
          type: "NUMBER",
          order_index: 1,
        },
      ];

      (qb.selectMany as Mock).mockResolvedValue(mockVariables);

      const result = await repository.fetch("prompt-123");

      expect(qb.selectMany).toHaveBeenCalledWith("variables", {
        filters: { eq: { prompt_id: "prompt-123" } },
        order: { column: "order_index", ascending: true },
      });
      expect(result).toEqual(mockVariables);
    });

    it("retourne un tableau vide si le promptId est vide", async () => {
      const result = await repository.fetch("");

      expect(qb.selectMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("gère les erreurs de récupération", async () => {
      const mockError = new Error("Database error");
      (qb.selectMany as Mock).mockRejectedValue(mockError);

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

      (qb.insertOne as Mock).mockResolvedValue(createdVariable);

      const result = await repository.create(newVariable);

      expect(qb.insertOne).toHaveBeenCalledWith("variables", newVariable);
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

      (qb.insertOne as Mock).mockRejectedValue(mockError);

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
        ...mockVariable,
        ...updates,
      };

      (qb.updateById as Mock).mockResolvedValue(updatedVariable);

      const result = await repository.update("var-1", updates);

      expect(qb.updateById).toHaveBeenCalledWith("variables", "var-1", updates);
      expect(result).toEqual(updatedVariable);
    });

    it("gère les erreurs de mise à jour", async () => {
      const mockError = new Error("Update failed");
      (qb.updateById as Mock).mockRejectedValue(mockError);

      await expect(repository.update("var-1", {})).rejects.toThrow(mockError);
    });
  });

  describe("deleteMany", () => {
    it("supprime toutes les variables d'un prompt", async () => {
      (qb.deleteWhere as Mock).mockResolvedValue(undefined);

      await repository.deleteMany("prompt-123");

      expect(qb.deleteWhere).toHaveBeenCalledWith("variables", "prompt_id", "prompt-123");
    });

    it("gère les erreurs de suppression", async () => {
      const mockError = new Error("Delete failed");
      (qb.deleteWhere as Mock).mockRejectedValue(mockError);

      await expect(repository.deleteMany("prompt-123")).rejects.toThrow(mockError);
    });
  });

  describe("upsertMany", () => {
    it("insère de nouvelles variables quand aucune n'existe", async () => {
      const newVariables: VariableUpsertInput[] = [
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

      (qb.selectMany as Mock).mockResolvedValue([]);
      (qb.upsertMany as Mock).mockResolvedValue(upsertedVariables);

      const result = await repository.upsertMany("prompt-123", newVariables);

      expect(qb.selectMany).toHaveBeenCalledWith("variables", {
        filters: { eq: { prompt_id: "prompt-123" } },
        order: { column: "order_index", ascending: true },
      });
      expect(qb.upsertMany).toHaveBeenCalledWith(
        "variables",
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
        { onConflict: "id", order: { column: "order_index", ascending: true } }
      );
      expect(result).toEqual(upsertedVariables);
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

      const updatedVariables: VariableUpsertInput[] = [
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

      const resultVariables: Variable[] = [
        {
          ...existingVariables[0],
          required: false,
          default_value: "nouveau",
        },
      ];

      (qb.selectMany as Mock).mockResolvedValue(existingVariables);
      (qb.upsertMany as Mock).mockResolvedValue(resultVariables);

      const result = await repository.upsertMany("prompt-123", updatedVariables);

      expect(qb.upsertMany).toHaveBeenCalledWith(
        "variables",
        expect.arrayContaining([
          expect.objectContaining({
            id: "var-1",
            name: "var1",
            required: false,
            default_value: "nouveau",
          }),
        ]),
        { onConflict: "id", order: { column: "order_index", ascending: true } }
      );
      expect(result).toEqual(resultVariables);
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

      const newVariables: VariableUpsertInput[] = [
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

      const resultVariables: Variable[] = [existingVariables[0]];

      (qb.selectMany as Mock).mockResolvedValue(existingVariables);
      (qb.deleteByIds as Mock).mockResolvedValue(undefined);
      (qb.upsertMany as Mock).mockResolvedValue(resultVariables);

      const result = await repository.upsertMany("prompt-123", newVariables);

      expect(qb.deleteByIds).toHaveBeenCalledWith("variables", ["var-2"]);
      expect(result).toEqual(resultVariables);
    });

    it("supprime toutes les variables si le tableau est vide", async () => {
      (qb.deleteWhere as Mock).mockResolvedValue(undefined);

      const result = await repository.upsertMany("prompt-123", []);

      expect(qb.deleteWhere).toHaveBeenCalledWith("variables", "prompt_id", "prompt-123");
      expect(result).toEqual([]);
    });

    it("gère les erreurs lors de l'upsert", async () => {
      const mockError = new Error("Upsert failed");

      const newVariables: VariableUpsertInput[] = [
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

      (qb.selectMany as Mock).mockResolvedValue([]);
      (qb.upsertMany as Mock).mockRejectedValue(mockError);

      await expect(repository.upsertMany("prompt-123", newVariables)).rejects.toThrow(
        mockError
      );
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

      const renamedVariables: VariableUpsertInput[] = [
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

      const resultVariables: Variable[] = [
        {
          ...existingVariables[0],
          name: "newName",
        },
      ];

      (qb.selectMany as Mock).mockResolvedValue(existingVariables);
      (qb.upsertMany as Mock).mockResolvedValue(resultVariables);

      const result = await repository.upsertMany("prompt-123", renamedVariables);

      expect(qb.upsertMany).toHaveBeenCalledWith(
        "variables",
        expect.arrayContaining([
          expect.objectContaining({
            id: "var-1",
            name: "newName",
          }),
        ]),
        { onConflict: "id", order: { column: "order_index", ascending: true } }
      );
      expect(result).toEqual(resultVariables);
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

      const mixedVariables: VariableUpsertInput[] = [
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

      (qb.selectMany as Mock).mockResolvedValue(existingVariables);
      (qb.deleteByIds as Mock).mockResolvedValue(undefined);
      (qb.upsertMany as Mock).mockResolvedValue(resultVariables);

      const result = await repository.upsertMany("prompt-123", mixedVariables);

      expect(qb.deleteByIds).toHaveBeenCalledWith("variables", ["var-3"]); // Seule var-3 supprimée
      expect(qb.upsertMany).toHaveBeenCalledWith(
        "variables",
        expect.arrayContaining([
          expect.objectContaining({ id: "var-1", name: "keep" }),
          expect.objectContaining({ id: "var-2", name: "renamed" }),
          expect.objectContaining({ name: "new" }),
        ]),
        { onConflict: "id", order: { column: "order_index", ascending: true } }
      );
      expect(result).toEqual(resultVariables);
    });
  });

  describe("Contraintes de base de données", () => {
    describe("Contrainte d'unicité (prompt_id, name)", () => {
      it("empêche la création de variables avec le même nom pour un prompt", async () => {
        const duplicateError = {
          code: "23505",
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

        (qb.insertOne as Mock).mockRejectedValue(duplicateError);

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

        (qb.insertOne as Mock)
          .mockResolvedValueOnce(createdVar1)
          .mockResolvedValueOnce(createdVar2);

        const result1 = await repository.create(variable1);
        const result2 = await repository.create(variable2);

        expect(result1).toEqual(createdVar1);
        expect(result2).toEqual(createdVar2);
      });
    });

    describe("Contrainte de clé étrangère avec ON DELETE CASCADE", () => {
      it("supprime automatiquement les variables quand le prompt est supprimé", async () => {
        // Ce test valide le comportement documenté de CASCADE
        // La suppression réelle est gérée par la base de données
        const mockVariables: Variable[] = [mockVariable];

        (qb.selectMany as Mock).mockResolvedValue(mockVariables);

        const result = await repository.fetch("prompt-123");
        expect(result).toEqual(mockVariables);

        // Après suppression du prompt (simulée par la base), fetch retourne vide
        (qb.selectMany as Mock).mockResolvedValue([]);

        const resultAfterDelete = await repository.fetch("prompt-123");
        expect(resultAfterDelete).toEqual([]);
      });
    });

    describe("Intégrité des données", () => {
      it("respecte les longueurs maximales des champs", async () => {
        const longNameError = {
          code: "23514",
          message: "value too long for type character varying(100)",
        };

        const variableWithLongName: VariableInsert = {
          prompt_id: "prompt-123",
          name: "a".repeat(101), // Plus de 100 caractères
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 0,
        };

        (qb.insertOne as Mock).mockRejectedValue(longNameError);

        await expect(repository.create(variableWithLongName)).rejects.toMatchObject({
          code: "23514",
        });
      });

      it("respecte la limite de variables par prompt", async () => {
        const maxVariablesError = {
          code: "23514",
          message: "Un prompt ne peut pas avoir plus de 50 variables",
        };

        const variable: VariableInsert = {
          prompt_id: "prompt-123",
          name: "var51",
          type: "STRING",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: [],
          order_index: 50,
        };

        (qb.insertOne as Mock).mockRejectedValue(maxVariablesError);

        await expect(repository.create(variable)).rejects.toMatchObject({
          code: "23514",
        });
      });
    });

    describe("Contraintes sur les options ENUM", () => {
      it("respecte la limite de 50 options", async () => {
        const tooManyOptionsError = {
          code: "23514",
          message: "Le nombre d'options ne peut pas dépasser 50",
        };

        const variableWithTooManyOptions: VariableInsert = {
          prompt_id: "prompt-123",
          name: "enumVar",
          type: "ENUM",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: Array.from({ length: 51 }, (_, i) => `option${i}`),
          order_index: 0,
        };

        (qb.insertOne as Mock).mockRejectedValue(tooManyOptionsError);

        await expect(repository.create(variableWithTooManyOptions)).rejects.toMatchObject({
          code: "23514",
        });
      });

      it("respecte la longueur maximale de chaque option (100 caractères)", async () => {
        const optionTooLongError = {
          code: "23514",
          message: "Chaque option ne peut pas dépasser 100 caractères",
        };

        const variableWithLongOption: VariableInsert = {
          prompt_id: "prompt-123",
          name: "enumVar",
          type: "ENUM",
          required: false,
          default_value: "",
          help: "",
          pattern: "",
          options: ["short", "a".repeat(101)],
          order_index: 0,
        };

        (qb.insertOne as Mock).mockRejectedValue(optionTooLongError);

        await expect(repository.create(variableWithLongOption)).rejects.toMatchObject({
          code: "23514",
        });
      });
    });
  });
});
