import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { errorToast, loadingToast, successToast } from "@/lib/toastUtils";
import { messages } from "@/constants/messages";

interface AnalysisResult {
  sections: Record<string, string>;
  variables: Array<{
    name: string;
    description: string;
    type: string;
    default_value?: string;
    options?: string[];
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
    json: any;
    markdown: string;
  };
}

export function usePromptAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async (promptContent: string) => {
    if (!promptContent.trim()) {
      errorToast("Erreur", messages.errors.validation.emptyPrompt);
      return;
    }

    setIsAnalyzing(true);
    loadingToast(messages.loading.analyzing);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-prompt', {
        body: { promptContent }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);
      successToast(messages.success.analysisComplete);
    } catch (error: any) {
      console.error('Erreur:', error);
      errorToast("Erreur", error.message || messages.errors.analysis.failed);
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => setResult(null);

  return { result, isAnalyzing, analyze, reset };
}
