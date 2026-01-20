import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseProfileRepository } from "../ProfileRepository";
import { qb } from "@/lib/supabaseQueryBuilder";

vi.mock("@/lib/supabaseQueryBuilder", () => ({
  qb: {
    selectOne: vi.fn(),
    updateById: vi.fn(),
  },
}));

describe("SupabaseProfileRepository", () => {
  let repository: SupabaseProfileRepository;
  const mockUserId = "user-123";
  // Note: email a été supprimé de public.profiles (stocké uniquement dans auth.users)
  const mockProfile = {
    id: mockUserId,
    pseudo: "testuser",
    name: "Test User",
    image: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseProfileRepository();
  });

  describe("fetchByUserId", () => {
    it("should fetch profile by user ID", async () => {
      vi.mocked(qb.selectOne).mockResolvedValue(mockProfile);

      const result = await repository.fetchByUserId(mockUserId);

      expect(qb.selectOne).toHaveBeenCalledWith("profiles", "id", mockUserId);
      expect(result).toEqual(mockProfile);
    });

    it("should return null when profile is not found", async () => {
      vi.mocked(qb.selectOne).mockResolvedValue(null);

      const result = await repository.fetchByUserId(mockUserId);

      expect(result).toBeNull();
    });

    it("should throw error when userId is empty", async () => {
      await expect(repository.fetchByUserId("")).rejects.toThrow(
        "ID utilisateur requis"
      );
      expect(qb.selectOne).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      vi.mocked(qb.selectOne).mockRejectedValue(new Error("Database error"));

      await expect(repository.fetchByUserId(mockUserId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("update", () => {
    it("should update profile with valid data", async () => {
      const updates = { pseudo: "newpseudo" };
      const updatedProfile = { ...mockProfile, ...updates };

      vi.mocked(qb.updateById).mockResolvedValue(updatedProfile);

      const result = await repository.update(mockUserId, updates);

      expect(qb.updateById).toHaveBeenCalledWith("profiles", mockUserId, updates);
      expect(result).toEqual(updatedProfile);
    });

    it("should throw error when userId is empty", async () => {
      await expect(repository.update("", { pseudo: "test" })).rejects.toThrow(
        "ID utilisateur requis"
      );
      expect(qb.updateById).not.toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      vi.mocked(qb.updateById).mockRejectedValue(new Error("Update failed"));

      await expect(
        repository.update(mockUserId, { pseudo: "test" })
      ).rejects.toThrow("Update failed");
    });

    it("should update multiple fields at once", async () => {
      const updates = {
        pseudo: "newpseudo",
        name: "New Name",
        image: "https://example.com/image.jpg",
      };
      const updatedProfile = { ...mockProfile, ...updates };

      vi.mocked(qb.updateById).mockResolvedValue(updatedProfile);

      const result = await repository.update(mockUserId, updates);

      expect(qb.updateById).toHaveBeenCalledWith("profiles", mockUserId, updates);
      expect(result).toEqual(updatedProfile);
    });
  });
});
