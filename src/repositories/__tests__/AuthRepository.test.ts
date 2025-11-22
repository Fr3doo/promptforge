import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseAuthRepository } from "../AuthRepository";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

// Helper pour créer un Error mock
const createError = (message: string): Error => new Error(message);

describe("SupabaseAuthRepository", () => {
  let repository: SupabaseAuthRepository;

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2024-01-01T00:00:00Z",
  } as User;

  const mockSession: Session = {
    access_token: "token-123",
    refresh_token: "refresh-123",
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: "bearer",
    user: mockUser,
  } as Session;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new SupabaseAuthRepository();
  });

  describe("getCurrentSession", () => {
    it("devrait retourner la session actuelle", async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      vi.spyOn(repository as any, "getCurrentSession").mockImplementation(
        mockGetSession
      );

      const result = await repository.getCurrentSession();

      expect(result).toEqual(mockSession);
    });

    it("devrait retourner null si pas de session", async () => {
      const mockGetSession = vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      });

      vi.spyOn(repository as any, "getCurrentSession").mockImplementation(
        mockGetSession
      );

      const result = await repository.getCurrentSession();

      expect(result).toBeNull();
    });

    it("devrait gérer les erreurs", async () => {
      const error = createError("Session error");
      const mockGetSession = vi.fn().mockRejectedValue(error);

      vi.spyOn(repository as any, "getCurrentSession").mockImplementation(
        mockGetSession
      );

      await expect(repository.getCurrentSession()).rejects.toThrow("Session error");
    });
  });

  describe("getCurrentUser", () => {
    it("devrait retourner l'utilisateur actuel", async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      vi.spyOn(repository as any, "getCurrentUser").mockImplementation(
        mockGetUser
      );

      const result = await repository.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it("devrait retourner null si pas d'utilisateur", async () => {
      const mockGetUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      });

      vi.spyOn(repository as any, "getCurrentUser").mockImplementation(
        mockGetUser
      );

      const result = await repository.getCurrentUser();

      expect(result).toBeNull();
    });

    it("devrait gérer les erreurs", async () => {
      const error = createError("User error");
      const mockGetUser = vi.fn().mockRejectedValue(error);

      vi.spyOn(repository as any, "getCurrentUser").mockImplementation(
        mockGetUser
      );

      await expect(repository.getCurrentUser()).rejects.toThrow("User error");
    });
  });

  describe("signIn", () => {
    const email = "test@example.com";
    const password = "password123";

    it("devrait authentifier un utilisateur avec succès", async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      vi.spyOn(repository, "signIn").mockImplementation(mockSignIn);

      const result = await repository.signIn(email, password);

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("devrait lever une erreur si user est null", async () => {
      const mockSignIn = vi
        .fn()
        .mockRejectedValue(
          new Error("Échec de l'authentification: utilisateur ou session manquant")
        );

      vi.spyOn(repository, "signIn").mockImplementation(mockSignIn);

      await expect(repository.signIn(email, password)).rejects.toThrow(
        "Échec de l'authentification: utilisateur ou session manquant"
      );
    });

    it("devrait lever une erreur si session est null", async () => {
      const mockSignIn = vi
        .fn()
        .mockRejectedValue(
          new Error("Échec de l'authentification: utilisateur ou session manquant")
        );

      vi.spyOn(repository, "signIn").mockImplementation(mockSignIn);

      await expect(repository.signIn(email, password)).rejects.toThrow(
        "Échec de l'authentification: utilisateur ou session manquant"
      );
    });

    it("devrait gérer les erreurs d'authentification", async () => {
      const error = createError("Invalid credentials");
      const mockSignIn = vi.fn().mockRejectedValue(error);

      vi.spyOn(repository, "signIn").mockImplementation(mockSignIn);

      await expect(repository.signIn(email, password)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("signUp", () => {
    const email = "newuser@example.com";
    const password = "password123";

    it("devrait créer un utilisateur sans métadonnées", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      const result = await repository.signUp(email, password);

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("devrait créer un utilisateur avec pseudo", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      const result = await repository.signUp(email, password, { pseudo: "testuser" });

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("devrait créer un utilisateur avec emailRedirectTo", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      const redirectUrl = "https://example.com/callback";
      const result = await repository.signUp(email, password, {
        emailRedirectTo: redirectUrl,
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("devrait créer un utilisateur avec pseudo et emailRedirectTo", async () => {
      const mockSignUp = vi.fn().mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      const redirectUrl = "https://example.com/callback";
      const result = await repository.signUp(email, password, {
        pseudo: "testuser",
        emailRedirectTo: redirectUrl,
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("devrait lever une erreur si user est null", async () => {
      const mockSignUp = vi
        .fn()
        .mockRejectedValue(
          new Error("Échec de l'inscription: utilisateur ou session manquant")
        );

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      await expect(repository.signUp(email, password)).rejects.toThrow(
        "Échec de l'inscription: utilisateur ou session manquant"
      );
    });

    it("devrait lever une erreur si session est null", async () => {
      const mockSignUp = vi
        .fn()
        .mockRejectedValue(
          new Error("Échec de l'inscription: utilisateur ou session manquant")
        );

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      await expect(repository.signUp(email, password)).rejects.toThrow(
        "Échec de l'inscription: utilisateur ou session manquant"
      );
    });

    it("devrait gérer les erreurs d'inscription", async () => {
      const error = createError("Email already exists");
      const mockSignUp = vi.fn().mockRejectedValue(error);

      vi.spyOn(repository, "signUp").mockImplementation(mockSignUp);

      await expect(repository.signUp(email, password)).rejects.toThrow(
        "Email already exists"
      );
    });
  });

  describe("signOut", () => {
    it("devrait déconnecter l'utilisateur avec succès", async () => {
      const mockSignOut = vi.fn().mockResolvedValue(undefined);

      vi.spyOn(repository, "signOut").mockImplementation(mockSignOut);

      await expect(repository.signOut()).resolves.toBeUndefined();
    });

    it("devrait gérer les erreurs de déconnexion", async () => {
      const error = createError("Signout failed");
      const mockSignOut = vi.fn().mockRejectedValue(error);

      vi.spyOn(repository, "signOut").mockImplementation(mockSignOut);

      await expect(repository.signOut()).rejects.toThrow("Signout failed");
    });
  });

  describe("onAuthStateChange", () => {
    it("devrait souscrire aux changements d'état d'authentification", () => {
      const mockUnsubscribe = vi.fn();
      const mockCallback = vi.fn();

      const mockOnAuthStateChange = vi.fn().mockReturnValue({
        unsubscribe: mockUnsubscribe,
      });

      vi.spyOn(repository, "onAuthStateChange").mockImplementation(
        mockOnAuthStateChange
      );

      const result = repository.onAuthStateChange(mockCallback);

      expect(result).toHaveProperty("unsubscribe");
      expect(typeof result.unsubscribe).toBe("function");

      // Tester la désinscription
      result.unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });

    it("devrait appeler le callback lors des changements d'état", () => {
      const mockCallback = vi.fn();
      let registeredCallback: (event: AuthChangeEvent, session: Session | null) => void;

      const mockOnAuthStateChange = vi.fn().mockImplementation((callback) => {
        registeredCallback = callback;
        return {
          unsubscribe: vi.fn(),
        };
      });

      vi.spyOn(repository, "onAuthStateChange").mockImplementation(
        mockOnAuthStateChange
      );

      repository.onAuthStateChange(mockCallback);

      // Simuler un événement SIGNED_IN
      registeredCallback!("SIGNED_IN" as AuthChangeEvent, mockSession);

      expect(mockCallback).toHaveBeenCalledWith("SIGNED_IN", mockSession);
    });
  });
});
