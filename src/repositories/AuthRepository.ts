import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

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

/**
 * Implémentation Supabase du repository d'authentification
 */
export class SupabaseAuthRepository implements AuthRepository {
  /**
   * Récupère la session actuelle de l'utilisateur
   */
  async getCurrentSession(): Promise<Session | null> {
    const result = await supabase.auth.getSession();
    handleSupabaseError(result);
    return result.data.session;
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<User | null> {
    const session = await this.getCurrentSession();
    return session?.user ?? null;
  }

  /**
   * Connecte un utilisateur avec email et mot de passe
   */
  async signIn(email: string, password: string): Promise<{ user: User; session: Session }> {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    handleSupabaseError(result);
    
    if (!result.data.user || !result.data.session) {
      throw new Error("Authentification échouée : utilisateur ou session manquant");
    }
    
    return { user: result.data.user, session: result.data.session };
  }

  /**
   * Crée un nouveau compte utilisateur
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { pseudo?: string; emailRedirectTo?: string }
  ): Promise<{ user: User; session: Session }> {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata?.pseudo ? { pseudo: metadata.pseudo } : undefined,
        emailRedirectTo: metadata?.emailRedirectTo,
      },
    });
    handleSupabaseError(result);
    
    if (!result.data.user || !result.data.session) {
      throw new Error("Création de compte échouée : utilisateur ou session manquant");
    }
    
    return { user: result.data.user, session: result.data.session };
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    handleSupabaseError({ data: null, error });
  }

  /**
   * Écoute les changements d'état d'authentification
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => subscription.unsubscribe() };
  }
}
