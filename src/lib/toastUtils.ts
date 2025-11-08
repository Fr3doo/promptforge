import { toast } from "@/hooks/use-toast";
import { TIMING } from "@/constants/application-config";

/**
 * @deprecated Utilisez usePromptMessages() pour les messages liés aux prompts
 * Conservé pour compatibilité avec d'autres modules (Analyzer, Variables, etc.)
 */
export const successToast = (title: string, description?: string) => {
  toast({
    title: `✅ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION,
  });
};

/**
 * @deprecated Utilisez usePromptMessages() pour les messages liés aux prompts
 * Conservé pour compatibilité avec d'autres modules (Analyzer, Variables, etc.)
 */
export const errorToast = (title: string, description?: string, customDuration?: number) => {
  toast({
    title: `❌ ${title}`,
    description,
    variant: "destructive",
    duration: customDuration ?? TIMING.TOAST_DURATION + 2000, // 5000ms pour les erreurs (plus visibles)
  });
};

/**
 * @deprecated Utilisez usePromptMessages() pour les messages liés aux prompts
 * Conservé pour compatibilité avec d'autres modules (Analyzer, Variables, etc.)
 */
export const infoToast = (title: string, description?: string) => {
  toast({
    title: `ℹ️ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION + 1000, // 4000ms pour les infos
  });
};

/**
 * @deprecated Utilisez usePromptMessages() pour les messages liés aux prompts
 * Conservé pour compatibilité avec d'autres modules (Analyzer, Variables, etc.)
 */
export const warningToast = (title: string, description?: string) => {
  toast({
    title: `⚠️ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION + 1000, // 4000ms pour les warnings
  });
};

/**
 * @deprecated Utilisez usePromptMessages() pour les messages liés aux prompts
 * Conservé pour compatibilité avec d'autres modules (Analyzer, Variables, etc.)
 */
export const loadingToast = (title: string) => {
  return toast({
    title: `⏳ ${title}`,
    duration: Infinity,
  });
};
