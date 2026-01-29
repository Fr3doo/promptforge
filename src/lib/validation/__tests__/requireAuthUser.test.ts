import { describe, it, expect } from "vitest";
import { requireAuthUser, UnauthenticatedError } from "../requireAuthUser";

describe("requireAuthUser", () => {
  // Cas positifs
  it("retourne l'utilisateur si présent", () => {
    const user = { id: "user-123", email: "test@example.com" };
    expect(requireAuthUser(user)).toBe(user);
  });

  it("préserve le type de l'objet utilisateur (générique)", () => {
    type CustomUser = { id: string; role: "admin" | "user" };
    const user: CustomUser = { id: "user-123", role: "admin" };
    const result = requireAuthUser(user);
    // TypeScript vérifie que result est CustomUser
    expect(result.role).toBe("admin");
  });

  // Cas négatifs
  it("lève UnauthenticatedError si undefined", () => {
    expect(() => requireAuthUser(undefined)).toThrow(UnauthenticatedError);
    expect(() => requireAuthUser(undefined)).toThrow("Utilisateur non authentifié");
  });

  it("lève UnauthenticatedError si null", () => {
    expect(() => requireAuthUser(null)).toThrow(UnauthenticatedError);
  });

  // Compatibilité messages existants
  it("utilise le message par défaut 'Utilisateur non authentifié'", () => {
    expect(() => requireAuthUser(null)).toThrow("Utilisateur non authentifié");
  });

  it("préserve le message SESSION_EXPIRED pour les handlers onError", () => {
    expect(() => requireAuthUser(null, "SESSION_EXPIRED")).toThrow("SESSION_EXPIRED");
  });

  it("produit un message identique à l'ancien pattern", () => {
    const oldPattern = () => { 
      const user = null; 
      if (!user) throw new Error("SESSION_EXPIRED"); 
    };
    const newPattern = () => requireAuthUser(null, "SESSION_EXPIRED");
    
    expect(() => oldPattern()).toThrow("SESSION_EXPIRED");
    expect(() => newPattern()).toThrow("SESSION_EXPIRED");
  });

  // Instance et héritage
  it("lève une instance de UnauthenticatedError", () => {
    try {
      requireAuthUser(null);
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthenticatedError);
      expect(e).toBeInstanceOf(Error);
    }
  });

  it("a le nom UnauthenticatedError", () => {
    try {
      requireAuthUser(null);
    } catch (e) {
      expect((e as Error).name).toBe("UnauthenticatedError");
    }
  });

  // Type narrowing vérifié (compile-time)
  it("effectue le type narrowing vers NonNullable<T>", () => {
    type User = { id: string } | null;
    const maybeUser: User = { id: "123" };
    const user = requireAuthUser(maybeUser);
    // Si ce test compile, le narrowing fonctionne
    expect(user.id).toBe("123");
  });
});

describe("UnauthenticatedError", () => {
  it("hérite correctement de Error", () => {
    const error = new UnauthenticatedError();
    expect(error instanceof Error).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it("utilise 'Utilisateur non authentifié' par défaut", () => {
    const error = new UnauthenticatedError();
    expect(error.message).toBe("Utilisateur non authentifié");
  });

  it("accepte un message personnalisé", () => {
    const error = new UnauthenticatedError("SESSION_EXPIRED");
    expect(error.message).toBe("SESSION_EXPIRED");
  });
});
