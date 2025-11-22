import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

/**
 * Interface du repository d'authentification
 * Abstrait tous les appels Supabase directs pour respecter le DIP
 */
export interface AuthRepository {
  /**
   * Récupère la session actuelle de l'utilisateur
   */
  getCurrentSession(): Promise<Session | null>;

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }>;

  /**
   * Crée un nouveau compte utilisateur
   */
  signUp(
    email: string,
    password: string,
    metadata?: { pseudo?: string; emailRedirectTo?: string }
  ): Promise<{ user: User; session: Session }>;

  /**
   * Déconnecte l'utilisateur actuel
   */
  signOut(): Promise<void>;

  /**
   * Écoute les changements d'état d'authentification
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { unsubscribe: () => void };
}
