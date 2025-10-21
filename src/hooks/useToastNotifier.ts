import { toast } from "@/hooks/use-toast";

export function useToastNotifier() {
  const notifySuccess = (title: string, description?: string) => {
    toast({
      title: `✅ ${title}`,
      description,
      duration: 3000,
    });
  };

  const notifyError = (title: string, description?: string) => {
    toast({
      title: `❌ ${title}`,
      description,
      variant: "destructive",
      duration: 5000,
    });
  };

  const notifyInfo = (title: string, description?: string) => {
    toast({
      title: `ℹ️ ${title}`,
      description,
      duration: 4000,
    });
  };

  const notifyWarning = (title: string, description?: string) => {
    toast({
      title: `⚠️ ${title}`,
      description,
      duration: 4000,
    });
  };

  const notifyLoading = (title: string) => {
    return toast({
      title: `⏳ ${title}`,
      duration: Infinity,
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notifyLoading,
  };
}
