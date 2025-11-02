import { toast } from "@/hooks/use-toast";
import { TIMING } from "@/constants/application-config";

export const successToast = (title: string, description?: string) => {
  toast({
    title: `✅ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION,
  });
};

export const errorToast = (title: string, description?: string) => {
  toast({
    title: `❌ ${title}`,
    description,
    variant: "destructive",
    duration: TIMING.TOAST_DURATION + 2000, // 5000ms pour les erreurs (plus visibles)
  });
};

export const infoToast = (title: string, description?: string) => {
  toast({
    title: `ℹ️ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION + 1000, // 4000ms pour les infos
  });
};

export const warningToast = (title: string, description?: string) => {
  toast({
    title: `⚠️ ${title}`,
    description,
    duration: TIMING.TOAST_DURATION + 1000, // 4000ms pour les warnings
  });
};

export const loadingToast = (title: string) => {
  return toast({
    title: `⏳ ${title}`,
    duration: Infinity,
  });
};
