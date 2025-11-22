import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Crée un utilisateur de test pour les tests d'intégration
 * Utilise un email unique avec timestamp pour éviter les conflits
 */
export async function createTestUser(): Promise<User> {
  const timestamp = Date.now();
  const email = `test-integration-${timestamp}@example.com`;
  const password = "TestPassword123!";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`);
  }

  return data.user;
}

/**
 * Connecte un utilisateur de test
 */
export async function signInTestUser(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  return data.user;
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function signOutTestUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.warn("Failed to sign out test user:", error.message);
  }
}

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
