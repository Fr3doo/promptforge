import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseProfileRepository } from "../ProfileRepository";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("SupabaseProfileRepository", () => {
  let repository: SupabaseProfileRepository;
  const mockUserId = "user-123";
  const mockProfile = {
    id: mockUserId,
    email: "test@example.com",
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
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      } as any);

      const result = await repository.fetchByUserId(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", mockUserId);
      expect(mockMaybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });

    it("should return null when profile is not found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      } as any);

      const result = await repository.fetchByUserId(mockUserId);

      expect(result).toBeNull();
    });

    it("should throw error when userId is empty", async () => {
      await expect(repository.fetchByUserId("")).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should handle database errors", async () => {
      const mockError = new Error("Database error");
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      } as any);

      await expect(repository.fetchByUserId(mockUserId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("update", () => {
    it("should update profile with valid data", async () => {
      const updates = { pseudo: "newpseudo" };
      const updatedProfile = { ...mockProfile, ...updates };

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any);

      const result = await repository.update(mockUserId, updates);

      expect(supabase.from).toHaveBeenCalledWith("profiles");
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", mockUserId);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(updatedProfile);
    });

    it("should throw error when userId is empty", async () => {
      await expect(repository.update("", { pseudo: "test" })).rejects.toThrow(
        "ID utilisateur requis"
      );
    });

    it("should handle update errors", async () => {
      const mockError = new Error("Update failed");
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any);

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

      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any);

      const result = await repository.update(mockUserId, updates);

      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(result).toEqual(updatedProfile);
    });
  });
});
