import { describe, it, expect } from "vitest";
import { requireId, requireIds, RequiredIdError } from "../requireId";

describe("requireId", () => {
  // Cas positifs
  it("retourne la valeur si présente", () => {
    expect(requireId("abc-123", "ID")).toBe("abc-123");
  });

  it("retourne une chaîne avec espaces", () => {
    expect(requireId("  id  ", "ID")).toBe("  id  ");
  });

  // Cas négatifs - compatibilité messages existants
  it("lève RequiredIdError si undefined", () => {
    expect(() => requireId(undefined, "ID utilisateur")).toThrow(
      "ID utilisateur requis"
    );
  });

  it("lève RequiredIdError si null", () => {
    expect(() => requireId(null, "ID")).toThrow("ID requis");
  });

  it("lève RequiredIdError si chaîne vide", () => {
    expect(() => requireId("", "ID prompt")).toThrow("ID prompt requis");
  });

  it("utilise 'ID' par défaut si fieldName non fourni", () => {
    expect(() => requireId(undefined)).toThrow("ID requis");
  });

  // Test d'intégration : format du message identique à l'ancien pattern
  it("produit un message identique à l'ancien pattern", () => {
    const oldPattern = () => {
      const id = undefined;
      if (!id) throw new Error("ID utilisateur requis");
    };
    const newPattern = () => requireId(undefined, "ID utilisateur");

    expect(() => oldPattern()).toThrow("ID utilisateur requis");
    expect(() => newPattern()).toThrow("ID utilisateur requis");
  });

  // Vérification de l'instance pour filtrage éventuel
  it("lève une instance de RequiredIdError", () => {
    try {
      requireId(undefined, "ID");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RequiredIdError);
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe("requireIds", () => {
  it("retourne le tableau si non vide", () => {
    expect(requireIds(["a", "b"], "IDs")).toEqual(["a", "b"]);
  });

  it("retourne un tableau avec un seul élément", () => {
    expect(requireIds(["single"], "IDs")).toEqual(["single"]);
  });

  it("lève RequiredIdError si tableau vide", () => {
    expect(() => requireIds([], "IDs version")).toThrow("IDs version requis");
  });

  it("utilise 'IDs' par défaut si fieldName non fourni", () => {
    expect(() => requireIds([])).toThrow("IDs requis");
  });

  it("lève une instance de RequiredIdError", () => {
    try {
      requireIds([], "IDs");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RequiredIdError);
    }
  });
});

describe("RequiredIdError", () => {
  it("a le nom RequiredIdError", () => {
    const error = new RequiredIdError("test");
    expect(error.name).toBe("RequiredIdError");
  });

  it("expose fieldName pour filtrage", () => {
    const error = new RequiredIdError("ID utilisateur");
    expect(error.fieldName).toBe("ID utilisateur");
  });

  it("utilise 'ID' par défaut pour fieldName", () => {
    const error = new RequiredIdError();
    expect(error.fieldName).toBe("ID");
    expect(error.message).toBe("ID requis");
  });

  it("est compatible avec classifyError (fallback SERVER)", () => {
    // Vérifie que RequiredIdError n'interfère pas avec le classifier existant
    const error = new RequiredIdError("ID");
    expect(error.message).not.toContain("permission");
    expect((error as unknown as { code?: string }).code).toBeUndefined();
    // => classifyError retournera "SERVER" (fallback)
  });

  it("hérite correctement de Error", () => {
    const error = new RequiredIdError("test");
    expect(error instanceof Error).toBe(true);
    expect(error.stack).toBeDefined();
  });
});
