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
  isPromptOwner(promptId: string, userId: string): Promise<boolean>;
  getShareById(shareId: string): Promise<PromptShare | null>;
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
    const result = await supabase.rpc("get_user_id_by_email", { user_email: email });

    if (result.error) {
      handleSupabaseError(result);
    }

    return result.data ? { id: result.data } : null;
  }

  async addShare(promptId: string, sharedWithUserId: string, permission: "READ" | "WRITE"): Promise<void> {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("SESSION_EXPIRED");
    }

    // Prevent sharing with oneself
    if (sharedWithUserId === user.id) {
      throw new Error("SELF_SHARE");
    }

    // Verify that the user is the prompt owner
    const isOwner = await this.isPromptOwner(promptId, user.id);
    if (!isOwner) {
      throw new Error("NOT_PROMPT_OWNER");
    }

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
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("SESSION_EXPIRED");
    }

    // Get share details
    const share = await this.getShareById(shareId);
    if (!share) {
      throw new Error("SHARE_NOT_FOUND");
    }

    // Verify authorization: user must be either the share creator or the prompt owner
    const isSharedBy = share.shared_by === user.id;
    const isPromptOwner = await this.isPromptOwner(share.prompt_id, user.id);

    if (!isSharedBy && !isPromptOwner) {
      throw new Error("UNAUTHORIZED_DELETE");
    }

    const result = await supabase
      .from("prompt_shares")
      .delete()
      .eq("id", shareId);

    handleSupabaseError(result);
  }

  async isPromptOwner(promptId: string, userId: string): Promise<boolean> {
    const result = await supabase
      .from("prompts")
      .select("owner_id")
      .eq("id", promptId)
      .single();

    if (result.error) {
      if (result.error.code === "PGRST116") {
        return false;
      }
      handleSupabaseError(result);
    }

    return result.data?.owner_id === userId;
  }

  async getShareById(shareId: string): Promise<PromptShare | null> {
    const result = await supabase
      .from("prompt_shares")
      .select("*")
      .eq("id", shareId)
      .maybeSingle();

    if (result.error) {
      handleSupabaseError(result);
    }

    return result.data as PromptShare | null;
  }
}
