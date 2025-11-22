import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Prompt } from "@/features/prompts/types";
import { usePromptQueryRepository } from "@/contexts/PromptQueryRepositoryContext";
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

      // Fetch usage statistics
      const { data: promptsWithUsage } = await supabase
        .from("prompts")
        .select(`
          id,
          title,
          prompt_usage (
            id,
            success
          )
        `)
        .eq("owner_id", user.id);

      const usageStats = (promptsWithUsage || []).map((prompt: any) => {
        const usages = prompt.prompt_usage || [];
        const totalUsage = usages.length;
        const successfulUsage = usages.filter((u: any) => u.success === true).length;
        
        return {
          promptId: prompt.id,
          title: prompt.title,
          usageCount: totalUsage,
          successRate: totalUsage > 0 ? (successfulUsage / totalUsage) * 100 : 0,
        };
      }).filter(stat => stat.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);

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
