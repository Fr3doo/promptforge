import { useQuery } from "@tanstack/react-query";
import type { Prompt } from "@/features/prompts/types";
import { usePromptQueryRepository } from "@/contexts/PromptQueryRepositoryContext";
import { usePromptUsageRepository } from "@/contexts/PromptUsageRepositoryContext";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  recentPrompts: Prompt[];
  favoritePrompts: Prompt[];
  sharedPrompts: Prompt[];
  usageStats: {
    promptId: string;
    title: string;
    usageCount: number;
    successRate: number;
  }[];
}

export function useDashboard() {
  const queryRepository = usePromptQueryRepository();
  const usageRepository = usePromptUsageRepository();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("User not authenticated");

      // Fetch recent prompts using repository
      const recentPrompts = await queryRepository.fetchRecent(user.id, 7, 5);

      // Fetch favorite prompts using repository
      const favoritePrompts = await queryRepository.fetchFavorites(user.id, 5);

      // Fetch shared prompts using repository
      const sharedPrompts = await queryRepository.fetchPublicShared(user.id, 5);

      // Fetch usage statistics using repository
      const usageStats = await usageRepository.fetchUsageStats(user.id, 5);

      return {
        recentPrompts,
        favoritePrompts,
        sharedPrompts,
        usageStats,
      };
    },
    enabled: !!user,
  });
}
