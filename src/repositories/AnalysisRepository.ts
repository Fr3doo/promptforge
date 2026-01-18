import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import { TIMING } from "@/constants/application-config";
import { messages } from "@/constants/messages";

/**
 * Custom error class for timeout scenarios
 */
export class AnalysisTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisTimeoutError';
  }
}

/**
 * Custom error class for rate limiting scenarios
 */
export class RateLimitError extends Error {
  readonly retryAfter: number;
  readonly reason: 'minute' | 'daily';
  
  constructor(message: string, retryAfter: number, reason: 'minute' | 'daily' = 'minute') {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.reason = reason;
  }
}

/**
 * Result structure returned by prompt analysis
 */
export interface AnalysisResult {
  sections: Record<string, string>;
  variables: Array<{
    name: string;
    description: string;
    type: string;
    default_value?: string;
    options?: string[];
    required?: boolean;
    pattern?: string;
  }>;
  prompt_template: string;
  metadata: {
    role: string;
    objectifs: string[];
    etapes?: string[];
    criteres?: string[];
    categories?: string[];
  };
  exports: {
    json: {
      version?: string;
      created_at?: string;
      original: string;
      [key: string]: any;
    };
    markdown: string;
  };
}

/**
 * Repository interface for prompt analysis operations
 * Follows SOLID principles by abstracting the data source
 */
/**
 * Repository interface for prompt analysis operations
 * Follows SOLID principles by abstracting the data source
 * 
 * @remarks
 * Cette interface abstrait l'appel à l'edge function analyze-prompt.
 * Les implémentations doivent gérer les timeouts et le rate limiting.
 */
export interface AnalysisRepository {
  /**
   * Analyzes a prompt and returns structured data
   * @param content - The prompt content to analyze (requis, non vide)
   * @returns Promise resolving to the analysis result
   * @throws {Error} Si content est vide ou undefined
   * @throws {AnalysisTimeoutError} Si l'analyse dépasse le délai maximum (60s client)
   * @throws {RateLimitError} Si les limites de requêtes sont atteintes (10/min ou 50/jour)
   * @throws {Error} Si l'edge function retourne une erreur
   * @throws {Error} Si la requête réseau échoue
   */
  analyzePrompt(content: string): Promise<AnalysisResult>;
}

/**
 * Supabase implementation of the AnalysisRepository
 * Invokes the analyze-prompt edge function with timeout protection
 */
export class SupabaseAnalysisRepository implements AnalysisRepository {
  async analyzePrompt(content: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    let timedOut = false;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMING.ANALYSIS_CLIENT_TIMEOUT);

    try {
      const result = await supabase.functions.invoke('analyze-prompt', {
        body: { promptContent: content },
        // @ts-ignore - Supabase types don't include signal yet
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const duration = Date.now() - startTime;
      console.log(`[ANALYSIS] ✅ Completed in ${duration}ms`);
      
      // Détecter le rate limiting (status 429)
      if (result.error?.message?.includes('429') || result.data?.retry_after) {
        const retryAfter = result.data?.retry_after || 60;
        const errorMessage = result.data?.error || 'Trop de requêtes';
        const isDaily = errorMessage.includes('journalière') || errorMessage.includes('50');
        throw new RateLimitError(errorMessage, retryAfter, isDaily ? 'daily' : 'minute');
      }
      
      handleSupabaseError(result);

      if (result.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data as AnalysisResult;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      const duration = Date.now() - startTime;
      console.error(`[ANALYSIS] ❌ Failed after ${duration}ms`, { 
        errorName: error?.name,
        errorMessage: error?.message,
        timedOut
      });

      // ✅ Source de vérité : le flag timedOut
      if (timedOut) {
        throw new AnalysisTimeoutError(
          messages.analysis.notifications.errors.timeout.description
        );
      }

      // ℹ️ Log spécifique pour FunctionsFetchError (mais ne PAS le relabeller en timeout)
      if (error?.name === 'FunctionsFetchError') {
        console.error('[ANALYSIS] FunctionsFetchError détecté (réseau/CORS/infra?)');
      }

      // Rethrow l'erreur originale (pas de relabelling abusif)
      throw error;
    }
  }
}

/**
 * Factory function to create the default analysis repository
 * Useful for dependency injection and testing
 */
export const createAnalysisRepository = (): AnalysisRepository => {
  return new SupabaseAnalysisRepository();
};
