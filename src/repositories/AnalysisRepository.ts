import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

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
export interface AnalysisRepository {
  /**
   * Analyzes a prompt and returns structured data
   * @param content - The prompt content to analyze
   * @returns Promise resolving to the analysis result
   * @throws Error if analysis fails
   */
  analyzePrompt(content: string): Promise<AnalysisResult>;
}

/**
 * Supabase implementation of the AnalysisRepository
 * Invokes the analyze-prompt edge function
 */
export class SupabaseAnalysisRepository implements AnalysisRepository {
  async analyzePrompt(content: string): Promise<AnalysisResult> {
    const result = await supabase.functions.invoke('analyze-prompt', {
      body: { promptContent: content }
    });

    handleSupabaseError(result);

    if (result.data.error) {
      throw new Error(result.data.error);
    }

    return result.data as AnalysisResult;
  }
}

/**
 * Factory function to create the default analysis repository
 * Useful for dependency injection and testing
 */
export const createAnalysisRepository = (): AnalysisRepository => {
  return new SupabaseAnalysisRepository();
};
