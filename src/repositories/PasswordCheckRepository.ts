import { supabase } from "@/integrations/supabase/client";

/**
 * Interface pour la vérification des mots de passe compromis
 * 
 * Abstraction permettant l'injection de dépendances pour les tests
 * et le respect du principe DIP (SOLID)
 */
export interface PasswordCheckRepository {
  /**
   * Vérifie si un mot de passe est présent dans une fuite de données
   * 
   * @param password - Le mot de passe à vérifier
   * @returns Promesse avec isBreached et optionnellement le nombre de fuites
   */
  checkBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount?: number;
  }>;
}

/**
 * Réponse de l'edge function check-password-breach
 */
interface CheckPasswordResponse {
  isBreached: boolean;
  breachCount?: number;
  error?: string;
}

/**
 * Implémentation du repository utilisant l'edge function check-password-breach
 * 
 * Appelle l'edge function qui vérifie le mot de passe via HaveIBeenPwned
 * en utilisant le protocole k-anonymity (seuls 5 chars du hash sont envoyés)
 */
export class EdgeFunctionPasswordCheckRepository implements PasswordCheckRepository {
  async checkBreach(password: string): Promise<{ isBreached: boolean; breachCount?: number }> {
    const { data, error } = await supabase.functions.invoke<CheckPasswordResponse>(
      'check-password-breach',
      { body: { password } }
    );

    if (error) {
      console.error('[PasswordCheckRepository] Edge function error:', error.message);
      throw new Error('Impossible de vérifier le mot de passe. Réessayez.');
    }

    if (data?.error) {
      console.error('[PasswordCheckRepository] API error:', data.error);
      throw new Error(data.error);
    }

    return {
      isBreached: data?.isBreached ?? false,
      breachCount: data?.breachCount,
    };
  }
}
