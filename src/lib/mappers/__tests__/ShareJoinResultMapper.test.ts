import { describe, it, expect } from "vitest";
import {
  mapShareJoinToPromptWithPermission,
  type ShareJoinResult,
} from "../ShareJoinResultMapper";
import type { Prompt } from "@/repositories/PromptRepository.interfaces";

describe("ShareJoinResultMapper", () => {
  // Helper pour créer un prompt mock
  const createMockPrompt = (overrides: Partial<Prompt> = {}): Prompt => ({
    id: "prompt-123",
    title: "Test Prompt",
    content: "Test content",
    description: null,
    owner_id: "owner-123",
    visibility: "PRIVATE",
    status: "PUBLISHED",
    public_permission: "READ",
    is_favorite: false,
    tags: null,
    version: "1.0.0",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    ...overrides,
  });

  describe("mapShareJoinToPromptWithPermission", () => {
    // ============================================
    // Liste vide
    // ============================================
    it("devrait retourner un tableau vide pour une liste vide", () => {
      const result = mapShareJoinToPromptWithPermission([]);
      expect(result).toEqual([]);
    });

    // ============================================
    // Filtrage des prompts null
    // ============================================
    it("devrait filtrer les lignes avec prompts null", () => {
      const data: ShareJoinResult[] = [
        { permission: "READ", prompts: createMockPrompt({ id: "p1" }) },
        { permission: "WRITE", prompts: null },
        { permission: "READ", prompts: createMockPrompt({ id: "p2" }) },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(["p1", "p2"]);
    });

    it("devrait retourner un tableau vide si tous les prompts sont null", () => {
      const data: ShareJoinResult[] = [
        { permission: "READ", prompts: null },
        { permission: "WRITE", prompts: null },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result).toEqual([]);
    });

    // ============================================
    // Préservation des permissions
    // ============================================
    it("devrait préserver la permission READ correctement", () => {
      const data: ShareJoinResult[] = [
        { permission: "READ", prompts: createMockPrompt() },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result[0].shared_permission).toBe("READ");
    });

    it("devrait préserver la permission WRITE correctement", () => {
      const data: ShareJoinResult[] = [
        { permission: "WRITE", prompts: createMockPrompt() },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result[0].shared_permission).toBe("WRITE");
    });

    it("devrait préserver toutes les propriétés du prompt", () => {
      const mockPrompt = createMockPrompt({
        id: "special-id",
        title: "Special Title",
        tags: ["tag1", "tag2"],
        is_favorite: true,
      });

      const data: ShareJoinResult[] = [
        { permission: "READ", prompts: mockPrompt },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result[0].id).toBe("special-id");
      expect(result[0].title).toBe("Special Title");
      expect(result[0].tags).toEqual(["tag1", "tag2"]);
      expect(result[0].is_favorite).toBe(true);
      expect(result[0].shared_permission).toBe("READ");
    });

    // ============================================
    // Tri par date
    // ============================================
    it("devrait trier par updated_at en ordre décroissant", () => {
      const data: ShareJoinResult[] = [
        {
          permission: "READ",
          prompts: createMockPrompt({
            id: "old",
            updated_at: "2024-01-01T00:00:00Z",
          }),
        },
        {
          permission: "WRITE",
          prompts: createMockPrompt({
            id: "new",
            updated_at: "2024-06-01T00:00:00Z",
          }),
        },
        {
          permission: "READ",
          prompts: createMockPrompt({
            id: "mid",
            updated_at: "2024-03-01T00:00:00Z",
          }),
        },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result.map((p) => p.id)).toEqual(["new", "mid", "old"]);
    });

    it("devrait gérer les dates nulles en les traitant comme anciennes", () => {
      const data: ShareJoinResult[] = [
        {
          permission: "READ",
          prompts: createMockPrompt({
            id: "with-date",
            updated_at: "2024-01-01T00:00:00Z",
          }),
        },
        {
          permission: "WRITE",
          prompts: createMockPrompt({
            id: "null-date",
            updated_at: null,
          }),
        },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      // Le prompt avec date valide devrait être en premier
      expect(result[0].id).toBe("with-date");
      expect(result[1].id).toBe("null-date");
    });

    it("devrait gérer plusieurs prompts avec la même date", () => {
      const sameDate = "2024-01-01T00:00:00Z";
      const data: ShareJoinResult[] = [
        {
          permission: "READ",
          prompts: createMockPrompt({ id: "p1", updated_at: sameDate }),
        },
        {
          permission: "WRITE",
          prompts: createMockPrompt({ id: "p2", updated_at: sameDate }),
        },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      // Les deux doivent être présents, l'ordre entre eux n'est pas garanti
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id).sort()).toEqual(["p1", "p2"]);
    });

    // ============================================
    // Edge cases
    // ============================================
    it("devrait gérer un seul élément", () => {
      const data: ShareJoinResult[] = [
        { permission: "WRITE", prompts: createMockPrompt({ id: "solo" }) },
      ];

      const result = mapShareJoinToPromptWithPermission(data);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("solo");
      expect(result[0].shared_permission).toBe("WRITE");
    });
  });
});
