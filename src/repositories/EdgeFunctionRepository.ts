import { supabase } from "@/integrations/supabase/client";
import type { SimpleVariable } from "@/hooks/prompt-save/useInitialVersionCreator";

/**
 * Repository pour gérer les appels aux Edge Functions Supabase
 * Isole la logique d'invocation des fonctions serverless
 */
export interface EdgeFunctionRepository {
  createInitialVersion(options: {
    prompt_id: string;
    content: string;
    semver: string;
    message: string;
    variables: SimpleVariable[];
  }): Promise<{ success: boolean; skipped?: boolean }>;
  
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
