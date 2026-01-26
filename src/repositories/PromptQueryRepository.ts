/**
 * SupabasePromptQueryRepository - Implémentation spécialisée LECTURE seule
 *
 * Phase 1 de la migration SRP : séparer les opérations de lecture du "god service"
 *
 * Responsabilités :
 * - fetchAll, fetchOwned, fetchSharedWithMe, fetchById
 * - fetchRecent, fetchFavorites, fetchPublicShared, countPublic
 *
 * Consommateurs prévus :
 * - usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 * - PromptDuplicationService (lecture du prompt original)
 * - PromptVisibilityService (lecture avant mutation)
 */

import { qb } from "@/lib/supabaseQueryBuilder";
import type {
  PromptQueryRepository,
  Prompt,
  PromptWithSharePermission,
} from "./PromptRepository.interfaces";
import {
  mapShareJoinToPromptWithPermission,
  type ShareJoinResult,
} from "@/lib/mappers/ShareJoinResultMapper";

export class SupabasePromptQueryRepository implements PromptQueryRepository {
  async fetchAll(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.selectMany<Prompt>("prompts_with_share_count", {
      order: { column: "updated_at", ascending: false },
    });
  }

  async fetchOwned(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.selectMany<Prompt>("prompts_with_share_count", {
      filters: { eq: { owner_id: userId } },
      order: { column: "updated_at", ascending: false },
    });
  }

  async fetchSharedWithMe(userId: string): Promise<PromptWithSharePermission[]> {
    if (!userId) throw new Error("ID utilisateur requis");

    // Jointure via qb.selectWithJoin
    const data = await qb.selectWithJoin<ShareJoinResult>(
      "prompt_shares",
      "permission, prompts:prompt_id (*)",
      { eq: { shared_with_user_id: userId } }
    );

    // Délégation au mapper dédié (SRP)
    return mapShareJoinToPromptWithPermission(data ?? []);
  }

  async fetchById(id: string): Promise<Prompt> {
    if (!id) throw new Error("ID requis");
    return qb.selectOneRequired<Prompt>("prompts", "id", id);
  }

  async fetchRecent(
    userId: string,
    days: number = 7,
    limit: number = 5
  ): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return qb.selectMany<Prompt>("prompts", {
      filters: {
        eq: { owner_id: userId },
        gte: { updated_at: daysAgo.toISOString() },
      },
      order: { column: "updated_at", ascending: false },
      limit,
    });
  }

  async fetchFavorites(userId: string, limit: number = 5): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.selectMany<Prompt>("prompts", {
      filters: { eq: { owner_id: userId, is_favorite: true } },
      order: { column: "updated_at", ascending: false },
      limit,
    });
  }

  async fetchPublicShared(userId: string, limit: number = 5): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    return qb.selectMany<Prompt>("prompts", {
      filters: {
        eq: { visibility: "SHARED" },
        neq: { owner_id: userId },
      },
      order: { column: "updated_at", ascending: false },
      limit,
    });
  }

  async countPublic(): Promise<number> {
    return qb.countRows("prompts", {
      eq: { visibility: "SHARED", status: "PUBLISHED" },
    });
  }
}
