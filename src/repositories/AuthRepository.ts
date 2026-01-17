import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

/**
 * Interface du repository d'authentification
 * Abstrait tous les appels Supabase directs pour respecter le DIP
 * 
 * @remarks
 * Les méthodes d'authentification peuvent échouer pour diverses raisons :
 * credentials invalides, compte non confirmé, limitations de rate, etc.
 * Les implémentations doivent respecter les postconditions documentées.
 */
export interface AuthRepository {
  /**
   * Récupère la session actuelle de l'utilisateur
   * @returns La session active ou null si non authentifié
   * @throws {Error} Si la requête vers le service auth échoue
   */
  getCurrentSession(): Promise<Session | null>;

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns L'utilisateur connecté ou null si non authentifié
   * @throws {Error} Si la requête vers le service auth échoue
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Connecte un utilisateur avec email et mot de passe
   * @param email - Adresse email de l'utilisateur (requis, format email valide)
   * @param password - Mot de passe (requis, non vide)
   * @returns L'utilisateur et la session créée
   * @throws {Error} Si email ou password est vide
   * @throws {Error} Si les credentials sont invalides
   * @throws {Error} Si le compte n'est pas confirmé (email non vérifié)
   * @throws {Error} Si rate limit atteint
   * @throws {Error} Si la requête échoue
   */
  signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }>;

  /**
   * Crée un nouveau compte utilisateur
   * @param email - Adresse email (requis, format valide, unique)
   * @param password - Mot de passe (requis, respecte les règles de complexité)
   * @param metadata - Données additionnelles optionnelles (pseudo, redirectUrl)
   * @returns L'utilisateur créé et la session
   * @throws {Error} Si email est invalide ou déjà utilisé
   * @throws {Error} Si password ne respecte pas les règles de complexité
   * @throws {Error} Si rate limit atteint
   * @throws {Error} Si la requête échoue
   */
  signUp(
    email: string,
    password: string,
    metadata?: { pseudo?: string; emailRedirectTo?: string }
  ): Promise<{ user: User; session: Session }>;

  /**
   * Déconnecte l'utilisateur actuel
   * @throws {Error} Si aucun utilisateur n'est connecté
   * @throws {Error} Si la requête échoue
   */
  signOut(): Promise<void>;

  /**
   * Écoute les changements d'état d'authentification
   * @param callback - Fonction appelée à chaque changement d'état
   * @returns Objet avec méthode unsubscribe pour arrêter l'écoute
   * @remarks Cette méthode ne lève pas d'erreur - les erreurs sont passées au callback
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
