import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Prompt } from "@/features/prompts/types";

interface DashboardStats {
  recentPrompts: Prompt[];
  favoritePrompts: Prompt[];
  sharedPrompts: Prompt[];
  privatelySharedWithMe: Prompt[];
  usageStats: {
    promptId: string;
    title: string;
    usageCount: number;
    successRate: number;
  }[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch recent prompts (updated in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentPrompts } = await supabase
        .from("prompts")
        .select("*")
        .eq("owner_id", user.id)
        .gte("updated_at", sevenDaysAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch favorite prompts
      const { data: favoritePrompts } = await supabase
        .from("prompts")
        .select("*")
        .eq("owner_id", user.id)
        .eq("is_favorite", true)
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch shared prompts (public)
      const { data: sharedPrompts } = await supabase
        .from("prompts")
        .select("*")
        .eq("visibility", "SHARED")
        .neq("owner_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      // Fetch privately shared prompts
      const { data: privateShares } = await supabase
        .from("prompt_shares")
        .select("prompt_id")
        .eq("shared_with_user_id", user.id)
        .limit(50);
      
      let privatelySharedWithMe: Prompt[] = [];
      if (privateShares && privateShares.length > 0) {
        const promptIds = privateShares.map(share => share.prompt_id);
        const { data: sharedWithMePrompts } = await supabase
          .from("prompts")
          .select("*")
          .in("id", promptIds)
          .order("updated_at", { ascending: false })
          .limit(5);
        privatelySharedWithMe = sharedWithMePrompts || [];
      }

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
        recentPrompts: recentPrompts || [],
        favoritePrompts: favoritePrompts || [],
        sharedPrompts: sharedPrompts || [],
        privatelySharedWithMe,
        usageStats,
      };
    },
  });
}
