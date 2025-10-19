import { toast } from "@/hooks/use-toast";

export const successToast = (title: string, description?: string) => {
  toast({
    title: `✅ ${title}`,
    description,
    duration: 3000,
  });
};

export const errorToast = (title: string, description?: string) => {
  toast({
    title: `❌ ${title}`,
    description,
    variant: "destructive",
    duration: 5000,
  });
};

export const infoToast = (title: string, description?: string) => {
  toast({
    title: `ℹ️ ${title}`,
    description,
    duration: 4000,
  });
};

export const warningToast = (title: string, description?: string) => {
  toast({
    title: `⚠️ ${title}`,
    description,
    duration: 4000,
  });
};

export const loadingToast = (title: string) => {
  return toast({
    title: `⏳ ${title}`,
    duration: Infinity,
  });
};
