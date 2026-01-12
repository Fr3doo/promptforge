import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseVersionRepository } from "../VersionRepository";

// Mock Supabase client
const mockMaybeSingle = vi.fn();
const mockSingle = vi.fn();
const mockLimit = vi.fn(() => ({ single: mockSingle }));
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockIn = vi.fn();
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
    order: mockOrder,
  })),
  in: vi.fn(() => ({ data: [], error: null })),
}));
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({ single: mockSingle })),
}));
const mockDelete = vi.fn(() => ({
  in: mockIn,
}));
const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({ data: null, error: null })),
}));
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => mockFrom(),
  },
}));

describe("SupabaseVersionRepository", () => {
  let repository: SupabaseVersionRepository;

  beforeEach(() => {
    repository = new SupabaseVersionRepository();
    vi.clearAllMocks();
  });

  describe("existsBySemver", () => {
    it("should return true when version exists", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { id: "version-123" },
        error: null,
      });

      const result = await repository.existsBySemver("prompt-1", "1.0.0");

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("versions");
    });

    it("should return false when version does not exist", async () => {
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.existsBySemver("prompt-1", "2.0.0");

      expect(result).toBe(false);
    });

    it("should return false and log error on database error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: { message: "Database error", code: "500" },
      });

      const result = await repository.existsBySemver("prompt-1", "1.0.0");

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur vérification version:",
        expect.any(Object)
      );
      consoleErrorSpy.mockRestore();
    });

    it("should throw if promptId is missing", async () => {
      await expect(repository.existsBySemver("", "1.0.0")).rejects.toThrow(
        "ID prompt requis"
      );
    });

    it("should throw if semver is missing", async () => {
      await expect(repository.existsBySemver("prompt-1", "")).rejects.toThrow(
        "Version semver requise"
      );
    });
  });
});
