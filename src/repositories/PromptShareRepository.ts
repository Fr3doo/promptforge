import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export type PromptShare = Tables<"prompt_shares">;

export interface PromptShareWithProfile extends PromptShare {
  shared_with_profile?: {
    id: string;
    email: string | null;
    name: string | null;
  };
}

export interface PromptShareRepository {
  getShares(promptId: string): Promise<PromptShareWithProfile[]>;
  addShare(promptId: string, sharedWithUserId: string, permission: "READ" | "WRITE"): Promise<void>;
  deleteShare(shareId: string): Promise<void>;
  getUserByEmail(email: string): Promise<{ id: string } | null>;
}

export class SupabasePromptShareRepository implements PromptShareRepository {
  async getShares(promptId: string): Promise<PromptShareWithProfile[]> {
    // Fetch shares
    const sharesResult = await supabase
      .from("prompt_shares")
      .select("*")
      .eq("prompt_id", promptId);

    handleSupabaseError(sharesResult);
    const sharesData = sharesResult.data || [];

    if (sharesData.length === 0) {
      return [];
    }

    // Fetch profiles for each shared user
    const userIds = sharesData.map(s => s.shared_with_user_id);
    const profilesResult = await supabase
      .from("profiles")
      .select("id, email, name")
      .in("id", userIds);

    handleSupabaseError(profilesResult);
    const profilesData = profilesResult.data || [];

    // Merge profiles with shares
    return sharesData.map(share => ({
      ...share,
      shared_with_profile: profilesData.find(p => p.id === share.shared_with_user_id)
    }));
  }

  async getUserByEmail(email: string): Promise<{ id: string } | null> {
    const result = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    handleSupabaseError(result);
    return result.data;
  }

  async addShare(promptId: string, sharedWithUserId: string, permission: "READ" | "WRITE"): Promise<void> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");

    const result = await supabase
      .from("prompt_shares")
      .insert({
        prompt_id: promptId,
        shared_with_user_id: sharedWithUserId,
        permission,
        shared_by: user.id,
      });

    handleSupabaseError(result);
  }

  async deleteShare(shareId: string): Promise<void> {
    const result = await supabase
      .from("prompt_shares")
      .delete()
      .eq("id", shareId);

    handleSupabaseError(result);
  }
}
