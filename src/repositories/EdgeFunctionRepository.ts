import { supabase } from "@/integrations/supabase/client";
import type { SimpleVariable } from "@/hooks/prompt-save/useInitialVersionCreator";

/**
 * Repository pour gérer les appels aux Edge Functions Supabase
 * Isole la logique d'invocation des fonctions serverless
 */
/**
 * Repository pour gérer les appels aux Edge Functions Supabase
 * Isole la logique d'invocation des fonctions serverless
 * 
 * @remarks
 * Ces méthodes invoquent des edge functions protégées par JWT.
 * L'utilisateur doit être authentifié pour les appeler.
 */
export interface EdgeFunctionRepository {
  /**
   * Crée la version initiale (1.0.0) d'un prompt via edge function
   * 
   * Cette fonction est idempotente : si une version existe déjà, elle retourne skipped=true
   * 
   * @param options - Configuration de la version initiale
   * @param options.prompt_id - ID du prompt (requis, non vide)
   * @param options.content - Contenu du prompt (requis)
   * @param options.semver - Version semver (généralement "1.0.0")
   * @param options.message - Message de commit de la version
   * @param options.variables - Variables à associer à la version
   * @returns Objet avec success et skipped (si version existait déjà)
   * @throws {Error} Si prompt_id est manquant
   * @throws {Error} Si l'utilisateur n'est pas authentifié (JWT invalide)
   * @throws {Error} Si l'edge function échoue (erreur réseau/timeout)
   * @throws {Error} Si le prompt n'existe pas ou accès refusé (RLS)
   */
  createInitialVersion(options: {
    prompt_id: string;
    content: string;
    semver: string;
    message: string;
    variables: SimpleVariable[];
  }): Promise<{ success: boolean; skipped?: boolean }>;
  
  /**
   * Restaure une version spécifique d'un prompt
   * 
   * Crée une nouvelle version avec le contenu de la version sélectionnée
   * 
   * @param options - Configuration de la restauration
   * @param options.versionId - ID de la version à restaurer (requis, non vide)
   * @param options.promptId - ID du prompt parent (requis, non vide)
   * @returns Objet avec success, version restaurée ou error
   * @throws {Error} Si versionId ou promptId est manquant
   * @throws {Error} Si l'utilisateur n'est pas authentifié (JWT invalide)
   * @throws {Error} Si l'edge function échoue (erreur réseau/timeout)
   * @throws {Error} Si la version ou le prompt n'existe pas
   */
  restoreVersion(options: {
    versionId: string;
    promptId: string;
  }): Promise<{
    success: boolean;
    version?: {
      semver: string;
      variablesCount: number;
    };
    error?: string;
  }>;
}

export class SupabaseEdgeFunctionRepository implements EdgeFunctionRepository {
  async createInitialVersion(options: {
    prompt_id: string;
    content: string;
    semver: string;
    message: string;
    variables: SimpleVariable[];
  }): Promise<{ success: boolean; skipped?: boolean }> {
    const { data, error } = await supabase.functions.invoke(
      "create-initial-version",
      { body: options }
    );

    if (error) {
      throw new Error(error.message || "Erreur lors de la création de la version initiale");
    }

    return {
      success: data?.success ?? true,
      skipped: data?.skipped ?? false,
    };
  }

  async restoreVersion(options: {
    versionId: string;
    promptId: string;
  }): Promise<{
    success: boolean;
    version?: {
      semver: string;
      variablesCount: number;
    };
    error?: string;
  }> {
    const { data, error } = await supabase.functions.invoke(
      "restore-version",
      { body: options }
    );

    if (error) {
      throw new Error(error.message || "Erreur lors de la restauration de la version");
    }

    if (!data?.success) {
      return {
        success: false,
        error: data?.error || "Échec de la restauration",
      };
    }

    return {
      success: true,
      version: data.version,
    };
  }
}
