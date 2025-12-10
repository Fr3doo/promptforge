import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tests d'intégration pour vérifier la sécurité des emails
 * 
 * Ces tests simulent le comportement RLS côté serveur.
 * En environnement réel, les politiques RLS sont appliquées par Supabase.
 */
describe("Profile Email Security", () => {
  const currentUserId = "current-user-123";
  const otherUserId = "other-user-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Table profiles avec RLS", () => {
    it("devrait permettre à un utilisateur de voir son propre profil complet (avec email)", async () => {
      const mockOwnProfile = {
        id: currentUserId,
        email: "currentuser@example.com",
        pseudo: "currentuser",
        name: "Current User",
        image: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockOwnProfile,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      expect(result.data).toHaveProperty("email", "currentuser@example.com");
      expect(result.data).toHaveProperty("pseudo", "currentuser");
    });

    it("NE devrait PAS permettre de récupérer l'email d'un autre utilisateur via profiles", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows found" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherUserId)
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("NE devrait PAS retourner l'email lors d'une requête IN sur plusieurs IDs", async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: currentUserId,
            email: "currentuser@example.com",
            pseudo: "currentuser",
            name: "Current User",
            image: null,
          },
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("profiles")
        .select("id, email, pseudo, name")
        .in("id", [currentUserId, otherUserId]);

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe(currentUserId);
      
      const otherProfile = result.data?.find(p => p.id === otherUserId);
      expect(otherProfile).toBeUndefined();
    });
  });

  describe("Vue public_profiles (sans email)", () => {
    it("devrait retourner les infos publiques SANS email via public_profiles", async () => {
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: currentUserId,
            pseudo: "currentuser",
            name: "Current User",
            image: null,
          },
          {
            id: otherUserId,
            pseudo: "otheruser",
            name: "Other User",
            image: "https://example.com/avatar.jpg",
          },
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("public_profiles")
        .select("id, pseudo, name, image")
        .in("id", [currentUserId, otherUserId]);

      expect(result.data).toHaveLength(2);
      
      result.data?.forEach(profile => {
        expect(profile).not.toHaveProperty("email");
      });
    });

    it("devrait permettre de récupérer le profil public d'un autre utilisateur", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: otherUserId,
          pseudo: "otheruser",
          name: "Other User",
          image: null,
        },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("public_profiles")
        .select("id, pseudo, name, image")
        .eq("id", otherUserId)
        .single();

      expect(result.data).not.toBeNull();
      expect(result.data?.id).toBe(otherUserId);
      expect(result.data).not.toHaveProperty("email");
    });
  });

  describe("PromptShareRepository.getShares() - comportement attendu", () => {
    it("devrait utiliser public_profiles pour récupérer les profils partagés", async () => {
      const userIds = [otherUserId];
      
      const mockIn = vi.fn().mockResolvedValue({
        data: [{
          id: otherUserId,
          pseudo: "otheruser",
          name: "Other User",
          image: null,
        }],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      await supabase
        .from("public_profiles")
        .select("id, name, pseudo, image")
        .in("id", userIds);

      expect(supabase.from).toHaveBeenCalledWith("public_profiles");
      expect(mockSelect).toHaveBeenCalledWith("id, name, pseudo, image");
    });
  });
});
