import { supabase } from "@/integrations/supabase/client";

/**
 * Interface pour la vérification des mots de passe compromis et la validation de force
 * 
 * Abstraction permettant l'injection de dépendances pour les tests
 * et le respect du principe DIP (SOLID)
 */
/**
 * Interface pour la vérification des mots de passe compromis et la validation de force
 * 
 * Abstraction permettant l'injection de dépendances pour les tests
 * et le respect du principe DIP (SOLID)
 * 
 * @remarks
 * Ces méthodes appellent des edge functions qui communiquent avec des APIs externes.
 * Les implémentations doivent gérer les erreurs réseau et les timeouts.
 */
export interface PasswordCheckRepository {
  /**
   * Vérifie si un mot de passe est présent dans une fuite de données
   * 
   * Utilise l'API HaveIBeenPwned avec k-anonymity (SHA-1, 5 premiers caractères)
   * 
   * @param password - Le mot de passe à vérifier (requis, non vide)
   * @returns Promesse avec isBreached et optionnellement le nombre de fuites
   * @throws {Error} Si password est vide ou undefined
   * @throws {Error} Si l'edge function échoue (erreur réseau/timeout)
   * @throws {Error} Si l'API HaveIBeenPwned est indisponible
   */
  checkBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount?: number;
  }>;

  /**
   * Valide la force du mot de passe côté serveur
   * 
   * Scoring basé sur : longueur, majuscules, minuscules, chiffres,
   * caractères spéciaux, et détection de patterns courants
   * 
   * @param password - Le mot de passe à valider (requis, non vide)
   * @returns Promesse avec isValid (score >= 4), score, maxScore, et feedback
   * @throws {Error} Si password est vide ou undefined
   * @throws {Error} Si l'edge function échoue (erreur réseau/timeout)
   */
  validateStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    maxScore: number;
    feedback: string[];
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
 * Réponse de l'edge function validate-password-strength
 */
interface ValidateStrengthResponse {
  isValid: boolean;
  score: number;
  maxScore: number;
  feedback: string[];
  error?: string;
}

/**
 * Implémentation du repository utilisant les edge functions
 * 
 * - check-password-breach : vérifie le mot de passe via HaveIBeenPwned (k-anonymity)
 * - validate-password-strength : valide la force du mot de passe (scoring regex)
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

  async validateStrength(password: string): Promise<{
    isValid: boolean;
    score: number;
    maxScore: number;
    feedback: string[];
  }> {
    const { data, error } = await supabase.functions.invoke<ValidateStrengthResponse>(
      'validate-password-strength',
      { body: { password } }
    );

    if (error) {
      console.error('[PasswordCheckRepository] Strength validation error:', error.message);
      throw new Error('Impossible de valider la force du mot de passe. Réessayez.');
    }

    if (data?.error) {
      console.error('[PasswordCheckRepository] API error:', data.error);
      throw new Error(data.error);
    }

    return {
      isValid: data?.isValid ?? false,
      score: data?.score ?? 0,
      maxScore: data?.maxScore ?? 6,
      feedback: data?.feedback ?? [],
    };
  }
}
