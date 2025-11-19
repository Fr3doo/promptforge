import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabasePromptVisibilityService } from "../PromptVisibilityService";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

describe("PromptVisibilityService", () => {
  let service: SupabasePromptVisibilityService;

  beforeEach(() => {
    service = new SupabasePromptVisibilityService();
    vi.clearAllMocks();
  });

  describe("toggleVisibility", () => {
    it("passe un prompt de PRIVATE à SHARED avec permission READ par défaut", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await service.toggleVisibility("prompt-123", "PRIVATE");

      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockUpdate).toHaveBeenCalledWith({
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "READ",
      });
      expect(mockEq).toHaveBeenCalledWith("id", "prompt-123");
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de PRIVATE à SHARED avec permission WRITE explicite", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await service.toggleVisibility("prompt-123", "PRIVATE", "WRITE");

      expect(mockUpdate).toHaveBeenCalledWith({
        visibility: "SHARED",
        status: "PUBLISHED",
        public_permission: "WRITE",
      });
      expect(result).toBe("SHARED");
    });

    it("passe un prompt de SHARED à PRIVATE et réinitialise permission à READ", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await service.toggleVisibility("prompt-123", "SHARED");

      expect(mockUpdate).toHaveBeenCalledWith({
        visibility: "PRIVATE",
        public_permission: "READ", // Reset to default
      });
      expect(result).toBe("PRIVATE");
    });

    it("gère les erreurs Supabase lors du toggle", async () => {
      const mockError = new Error("Update failed");

      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      await expect(
        service.toggleVisibility("prompt-123", "PRIVATE")
      ).rejects.toThrow(mockError);
    });
  });

  describe("updatePublicPermission", () => {
    it("met à jour la permission d'un prompt SHARED", async () => {
      // Mock du select pour vérifier que le prompt est SHARED
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: { visibility: "SHARED" },
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({
        single: mockSelectSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq,
      });

      // Mock de l'update pour la permission
      const mockUpdateEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdate,
        });

      await service.updatePublicPermission("prompt-123", "WRITE");

      // Vérifications du select
      expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
      expect(mockSelect).toHaveBeenCalledWith("visibility");
      expect(mockSelectEq).toHaveBeenCalledWith("id", "prompt-123");

      // Vérifications de l'update
      expect(mockUpdate).toHaveBeenCalledWith({ public_permission: "WRITE" });
      expect(mockUpdateEq).toHaveBeenCalledWith("id", "prompt-123");
    });

    it("lance une erreur si le prompt est PRIVATE", async () => {
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: { visibility: "PRIVATE" },
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({
        single: mockSelectSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");
    });

    it("gère les erreurs Supabase lors du select", async () => {
      const mockError = new Error("Select failed");

      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockSelectEq = vi.fn().mockReturnValue({
        single: mockSelectSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);
    });

    it("gère les erreurs Supabase lors de l'update", async () => {
      // Mock du select (succès)
      const mockSelectSingle = vi.fn().mockResolvedValue({
        data: { visibility: "SHARED" },
        error: null,
      });

      const mockSelectEq = vi.fn().mockReturnValue({
        single: mockSelectSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockSelectEq,
      });

      // Mock de l'update (erreur)
      const mockError = new Error("Update failed");

      const mockUpdateEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockUpdateEq,
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          update: mockUpdate,
        });

      await expect(
        service.updatePublicPermission("prompt-123", "WRITE")
      ).rejects.toThrow(mockError);
    });
  });
});
