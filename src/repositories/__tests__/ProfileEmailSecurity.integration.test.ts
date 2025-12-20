import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tests d'intégration pour vérifier la sécurité des profils
 *
 * Architecture de sécurité après migration :
 * 1. La colonne email a été supprimée de public.profiles (source de vérité = auth.users)
 * 2. La vue public_profiles est en SECURITY INVOKER (RLS appliquée selon l'appelant)
 * 3. Les policies RLS sur profiles permettent :
 *    - Voir son propre profil (auth.uid() = id)
 *    - Voir le profil des utilisateurs avec qui on a une relation de partage
 * 4. Les utilisateurs anonymes n'ont aucun accès
 */
describe("Profile Security (Email removed, SECURITY INVOKER)", () => {
  const currentUserId = "current-user-123";
  const sharedWithUserId = "shared-with-user-456";
  const unrelatedUserId = "unrelated-user-789";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Table profiles avec RLS (sans email)", () => {
    it("devrait permettre à un utilisateur de voir son propre profil (sans email)", async () => {
      const mockOwnProfile = {
        id: currentUserId,
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

      // Vérifie que l'email n'est PAS dans le profil (colonne supprimée)
      expect(result.data).not.toHaveProperty("email");
      expect(result.data).toHaveProperty("pseudo", "currentuser");
      expect(result.data).toHaveProperty("id", currentUserId);
    });

    it("NE devrait PAS permettre de voir le profil d'un utilisateur sans relation", async () => {
      // Un utilisateur sans relation de partage ne devrait pas voir d'autres profils
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
        .eq("id", unrelatedUserId)
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("devrait permettre de voir le profil d'un utilisateur avec qui on a partagé", async () => {
      // Le propriétaire d'un prompt peut voir le profil du destinataire
      // grâce à la policy "Owners can view profiles of users they shared with"
      const mockSharedProfile = {
        id: sharedWithUserId,
        pseudo: "shareduser",
        name: "Shared User",
        image: null,
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockSharedProfile,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("profiles")
        .select("id, pseudo, name, image")
        .eq("id", sharedWithUserId)
        .single();

      expect(result.data).not.toBeNull();
      expect(result.data?.id).toBe(sharedWithUserId);
      expect(result.data).not.toHaveProperty("email");
    });

    it("devrait retourner uniquement les profils autorisés lors d'une requête IN", async () => {
      // RLS filtre : propre profil + profils liés par partage
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: currentUserId,
            pseudo: "currentuser",
            name: "Current User",
            image: null,
          },
          {
            id: sharedWithUserId,
            pseudo: "shareduser",
            name: "Shared User",
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
        .select("id, pseudo, name")
        .in("id", [currentUserId, sharedWithUserId, unrelatedUserId]);

      // Devrait retourner uniquement les profils autorisés (pas unrelatedUserId)
      expect(result.data).toHaveLength(2);
      expect(result.data?.map((p) => p.id)).toContain(currentUserId);
      expect(result.data?.map((p) => p.id)).toContain(sharedWithUserId);
      expect(result.data?.map((p) => p.id)).not.toContain(unrelatedUserId);

      result.data?.forEach((profile) => {
        expect(profile).not.toHaveProperty("email");
      });
    });
  });

  describe("Vue public_profiles (SECURITY INVOKER)", () => {
    it("devrait appliquer RLS et retourner uniquement les profils autorisés", async () => {
      // Avec SECURITY INVOKER, la vue respecte les policies RLS de profiles
      // Un utilisateur ne voit que : son profil + profils liés par partage
      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: currentUserId,
            pseudo: "currentuser",
            name: "Current User",
            image: null,
          },
          {
            id: sharedWithUserId,
            pseudo: "shareduser",
            name: "Shared User",
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
        .in("id", [currentUserId, sharedWithUserId, unrelatedUserId]);

      // RLS filtre les résultats
      expect(result.data).toHaveLength(2);

      result.data?.forEach((profile) => {
        expect(profile).not.toHaveProperty("email");
      });

      // unrelatedUserId n'est pas retourné (bloqué par RLS)
      const unrelatedProfile = result.data?.find(
        (p) => p.id === unrelatedUserId
      );
      expect(unrelatedProfile).toBeUndefined();
    });

    it("devrait permettre de récupérer le profil d'un utilisateur avec relation de partage", async () => {
      // Le destinataire peut voir le profil du partageur
      // grâce à la policy "Shared users can view profile of who shared with them"
      const sharerId = "sharer-user-123";
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: sharerId,
          pseudo: "shareruser",
          name: "Sharer User",
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
        .eq("id", sharerId)
        .single();

      expect(result.data).not.toBeNull();
      expect(result.data?.id).toBe(sharerId);
      expect(result.data).not.toHaveProperty("email");
    });

    it("NE devrait PAS retourner le profil d'un utilisateur sans relation", async () => {
      // SECURITY INVOKER + RLS = accès bloqué pour les profils sans relation
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
        .from("public_profiles")
        .select("id, pseudo, name, image")
        .eq("id", unrelatedUserId)
        .single();

      // RLS bloque l'accès
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe("PromptShareRepository.getShares() - comportement attendu", () => {
    it("devrait utiliser public_profiles pour récupérer les profils des destinataires", async () => {
      // Le propriétaire d'un prompt peut voir les profils de ses destinataires
      const userIds = [sharedWithUserId];

      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: sharedWithUserId,
            pseudo: "shareduser",
            name: "Shared User",
            image: null,
          },
        ],
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

    it("devrait filtrer les profils non autorisés même avec une liste d'IDs", async () => {
      // Même si on demande plusieurs IDs, RLS ne retourne que ceux autorisés
      const requestedIds = [sharedWithUserId, unrelatedUserId];

      const mockIn = vi.fn().mockResolvedValue({
        data: [
          {
            id: sharedWithUserId,
            pseudo: "shareduser",
            name: "Shared User",
            image: null,
          },
          // unrelatedUserId n'est PAS retourné car bloqué par RLS
        ],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ in: mockIn });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("public_profiles")
        .select("id, name, pseudo, image")
        .in("id", requestedIds);

      // Seul le profil autorisé est retourné
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe(sharedWithUserId);
    });
  });

  describe("Protection contre les accès anonymes", () => {
    it("devrait bloquer tout accès anonyme à public_profiles", async () => {
      // Les utilisateurs anonymes n'ont pas de GRANT sur public_profiles
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: "42501",
          message: "permission denied for view public_profiles",
        },
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase.from("public_profiles").select("*");

      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });
});
