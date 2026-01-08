import { describe, it, expect } from "vitest";
import { z } from "zod";
import { extractZodError } from "../zodErrorUtils";

describe("extractZodError", () => {
  describe("avec une ZodError valide", () => {
    it("extrait field et message quand path est présent", () => {
      const schema = z.object({ title: z.string().min(1) });

      try {
        schema.parse({ title: "" });
        expect.fail("Should have thrown");
      } catch (error) {
        const result = extractZodError(error);
        expect(result).toEqual({
          field: "title",
          message: expect.any(String),
        });
      }
    });

    it("retourne 'Champ' quand path est vide", () => {
      const schema = z.string().min(1);

      try {
        schema.parse("");
        expect.fail("Should have thrown");
      } catch (error) {
        const result = extractZodError(error);
        expect(result).toEqual({
          field: "Champ",
          message: expect.any(String),
        });
      }
    });

    it("convertit path numérique en string", () => {
      const schema = z.array(z.string().min(1));

      try {
        schema.parse([""]);
        expect.fail("Should have thrown");
      } catch (error) {
        const result = extractZodError(error);
        expect(result?.field).toBe("0");
      }
    });

    it("extrait le message d'erreur personnalisé", () => {
      const schema = z.object({
        email: z.string().email({ message: "Email invalide" }),
      });

      try {
        schema.parse({ email: "not-an-email" });
        expect.fail("Should have thrown");
      } catch (error) {
        const result = extractZodError(error);
        expect(result).toEqual({
          field: "email",
          message: "Email invalide",
        });
      }
    });
  });

  describe("avec une erreur non-Zod", () => {
    it("retourne null pour une Error standard", () => {
      const result = extractZodError(new Error("test"));
      expect(result).toBeNull();
    });

    it("retourne null pour null", () => {
      const result = extractZodError(null);
      expect(result).toBeNull();
    });

    it("retourne null pour undefined", () => {
      const result = extractZodError(undefined);
      expect(result).toBeNull();
    });

    it("retourne null pour un objet quelconque", () => {
      const result = extractZodError({ errors: [{ message: "fake" }] });
      expect(result).toBeNull();
    });

    it("retourne null pour un objet avec name ZodError mais pas instanceof", () => {
      const fakeZodError = { name: "ZodError", errors: [{ message: "fake" }] };
      const result = extractZodError(fakeZodError);
      expect(result).toBeNull();
    });
  });
});
