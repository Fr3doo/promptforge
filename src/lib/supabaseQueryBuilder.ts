/**
 * QueryBuilder injectable pour Supabase
 *
 * Encapsule les chaînes d'appels Supabase répétitives et centralise
 * la gestion des filtres, tri et pagination.
 *
 * @example
 * // Usage avec instance par défaut
 * import { qb } from "@/lib/supabaseQueryBuilder";
 * const prompts = await qb.selectMany<Prompt>("prompts", {
 *   filters: { eq: { owner_id: userId } },
 *   order: { column: "updated_at", ascending: false },
 * });
 *
 * @example
 * // Usage avec client injecté (tests)
 * const builder = createSupabaseQueryBuilder(fakeClient);
 * const result = await builder.selectOne<Profile>("profiles", "id", id);
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

// ============================================
// Types
// ============================================

type TableName = string;
type ColumnName = string;
type Scalar = string | number | boolean | null;

export interface OrderOptions {
  column: ColumnName;
  ascending?: boolean;
}

export interface FilterOptions {
  eq?: Record<ColumnName, Scalar | undefined>;
  neq?: Record<ColumnName, Scalar | undefined>;
  gte?: Record<ColumnName, Scalar | undefined>;
  lte?: Record<ColumnName, Scalar | undefined>;
  in?: Record<ColumnName, readonly Scalar[] | undefined>;
  isNull?: readonly ColumnName[];
}

export interface QueryOptions {
  filters?: FilterOptions;
  order?: OrderOptions;
  limit?: number;
}

export interface UpsertOptions {
  onConflict?: string;
  order?: OrderOptions;
}

// ============================================
// Internal helpers
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters?: FilterOptions): any {
  if (!filters) return query;

  // Apply eq filters (skip undefined)
  if (filters.eq) {
    for (const [col, val] of Object.entries(filters.eq)) {
      if (val === undefined) continue;
      query = query.eq(col, val);
    }
  }

  // Apply neq filters (skip undefined)
  if (filters.neq) {
    for (const [col, val] of Object.entries(filters.neq)) {
      if (val === undefined) continue;
      query = query.neq(col, val);
    }
  }

  // Apply gte filters (skip undefined)
  if (filters.gte) {
    for (const [col, val] of Object.entries(filters.gte)) {
      if (val === undefined) continue;
      query = query.gte(col, val);
    }
  }

  // Apply lte filters (skip undefined)
  if (filters.lte) {
    for (const [col, val] of Object.entries(filters.lte)) {
      if (val === undefined) continue;
      query = query.lte(col, val);
    }
  }

  // Apply in filters (skip undefined or empty arrays)
  if (filters.in) {
    for (const [col, arr] of Object.entries(filters.in)) {
      if (!arr || arr.length === 0) continue;
      query = query.in(col, arr as Scalar[]);
    }
  }

  // Apply isNull filters
  if (filters.isNull) {
    for (const col of filters.isNull) {
      query = query.is(col, null);
    }
  }

  return query;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOrderLimit(query: any, options?: QueryOptions): any {
  if (options?.order) {
    query = query.order(options.order.column, {
      ascending: options.order.ascending ?? false,
    });
  }
  if (options?.limit !== undefined) {
    query = query.limit(options.limit);
  }
  return query;
}

// ============================================
// Factory
// ============================================

/**
 * Crée un QueryBuilder avec un client Supabase injectable.
 * @param client - Client Supabase (par défaut: client global)
 * @returns API de requêtes standardisée
 */
export function createSupabaseQueryBuilder(
  client: SupabaseClient = supabase as unknown as SupabaseClient
) {
  return {
    /**
     * Sélectionne plusieurs enregistrements avec filtres, tri et limite.
     * @throws {Error} Si la requête échoue
     */
    async selectMany<T>(
      table: TableName,
      options: QueryOptions = {},
      columns = "*"
    ): Promise<T[]> {
      let q = client.from(table).select(columns);
      q = applyFilters(q, options.filters);
      q = applyOrderLimit(q, options);
      const res = await q;
      handleSupabaseError(res);
      return (res.data ?? []) as T[];
    },

    /**
     * Sélectionne un enregistrement optionnel (0 ou 1).
     * @returns L'enregistrement ou null si non trouvé
     * @throws {Error} Si plusieurs résultats ou requête échoue
     */
    async selectOne<T>(
      table: TableName,
      column: ColumnName,
      value: Scalar
    ): Promise<T | null> {
      const res = await client
        .from(table)
        .select("*")
        .eq(column, value)
        .maybeSingle();
      handleSupabaseError(res);
      return (res.data ?? null) as T | null;
    },

    /**
     * Sélectionne un enregistrement obligatoire.
     * @throws {Error} PGRST116 si non trouvé, ou requête échoue
     */
    async selectOneRequired<T>(
      table: TableName,
      column: ColumnName,
      value: Scalar
    ): Promise<T> {
      const res = await client
        .from(table)
        .select("*")
        .eq(column, value)
        .single();
      handleSupabaseError(res);
      return res.data as T;
    },

    /**
     * Compte les enregistrements correspondant aux filtres.
     */
    async countRows(table: TableName, filters?: FilterOptions): Promise<number> {
      let q = client.from(table).select("*", { count: "exact", head: true });
      q = applyFilters(q, filters);
      const res = await q;
      handleSupabaseError(res);
      return res.count ?? 0;
    },

    /**
     * Insère un enregistrement et retourne le résultat.
     * @throws {Error} Si l'insertion échoue
     */
    async insertOne<T, D extends Record<string, unknown>>(
      table: TableName,
      data: D
    ): Promise<T> {
      const res = await client.from(table).insert(data).select().single();
      handleSupabaseError(res);
      return res.data as T;
    },

    /**
     * Insère plusieurs enregistrements (batch).
     * No-op si le tableau est vide.
     * @throws {Error} Si l'insertion échoue
     */
    async insertMany<D extends Record<string, unknown>>(
      table: TableName,
      data: D[]
    ): Promise<void> {
      if (data.length === 0) return;
      const res = await client.from(table).insert(data);
      handleSupabaseError(res);
    },

    /**
     * Met à jour un enregistrement par ID et retourne le résultat.
     * @throws {Error} Si la mise à jour échoue
     */
    async updateById<T>(
      table: TableName,
      id: string | number,
      updates: Record<string, unknown>,
      idColumn: ColumnName = "id"
    ): Promise<T> {
      const res = await client
        .from(table)
        .update(updates)
        .eq(idColumn, id)
        .select()
        .single();
      handleSupabaseError(res);
      return res.data as T;
    },

    /**
     * Supprime un enregistrement par ID.
     * @throws {Error} Si la suppression échoue
     */
    async deleteById(
      table: TableName,
      id: string | number,
      idColumn: ColumnName = "id"
    ): Promise<void> {
      const res = await client.from(table).delete().eq(idColumn, id);
      handleSupabaseError(res);
    },

    /**
     * Supprime des enregistrements par liste d'IDs.
     * No-op si le tableau est vide.
     * @throws {Error} Si la suppression échoue
     */
    async deleteByIds(
      table: TableName,
      ids: readonly (string | number)[],
      idColumn: ColumnName = "id"
    ): Promise<void> {
      if (ids.length === 0) return;
      const res = await client
        .from(table)
        .delete()
        .in(idColumn, ids as (string | number)[]);
      handleSupabaseError(res);
    },

    /**
     * Supprime des enregistrements correspondant à un filtre.
     * @throws {Error} Si la suppression échoue
     */
    async deleteWhere(
      table: TableName,
      column: ColumnName,
      value: Scalar
    ): Promise<void> {
      const res = await client.from(table).delete().eq(column, value);
      handleSupabaseError(res);
    },

    /**
     * Upsert avec retour des enregistrements.
     * No-op si le tableau est vide.
     * @throws {Error} Si l'upsert échoue
     */
    async upsertMany<T, D extends Record<string, unknown>>(
      table: TableName,
      data: D[],
      options?: UpsertOptions
    ): Promise<T[]> {
      if (data.length === 0) return [];

      let q = client
        .from(table)
        .upsert(data, {
          onConflict: options?.onConflict ?? "id",
          ignoreDuplicates: false,
        })
        .select();

      if (options?.order) {
        q = q.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        });
      }

      const res = await q;
      handleSupabaseError(res);
      return res.data as T[];
    },

    /**
     * Sélectionne plusieurs enregistrements par liste d'IDs.
     * No-op retournant [] si le tableau est vide.
     * @throws {Error} Si la requête échoue
     */
    async selectManyByIds<T>(
      table: TableName,
      ids: readonly (string | number)[],
      idColumn: ColumnName = "id"
    ): Promise<T[]> {
      if (ids.length === 0) return [];
      const res = await client
        .from(table)
        .select("*")
        .in(idColumn, ids as (string | number)[]);
      handleSupabaseError(res);
      return (res.data ?? []) as T[];
    },

    /**
     * Met à jour des enregistrements correspondant à un filtre (sans retour).
     * @throws {Error} Si la mise à jour échoue
     */
    async updateWhere(
      table: TableName,
      column: ColumnName,
      value: Scalar,
      updates: Record<string, unknown>
    ): Promise<void> {
      const res = await client.from(table).update(updates).eq(column, value);
      handleSupabaseError(res);
    },

    /**
     * Sélectionne le premier enregistrement avec filtres et tri.
     * @returns L'enregistrement ou null si non trouvé
     * @throws {Error} Si la requête échoue (hors PGRST116)
     */
    async selectFirst<T>(
      table: TableName,
      options: QueryOptions = {},
      columns = "*"
    ): Promise<T | null> {
      let q = client.from(table).select(columns);
      q = applyFilters(q, options.filters);
      q = applyOrderLimit(q, { ...options, limit: 1 });
      const res = await q.maybeSingle();

      // PGRST116 = 0 résultat avec maybeSingle, retourne null
      if (res.error?.code === "PGRST116") {
        return null;
      }
      handleSupabaseError(res);
      return (res.data ?? null) as T | null;
    },

    /**
     * Vérifie si un enregistrement existe pour les filtres donnés.
     * @returns true si existe, false sinon (ou en cas d'erreur)
     */
    async exists(table: TableName, filters: FilterOptions): Promise<boolean> {
      let q = client.from(table).select("id");
      q = applyFilters(q, filters);
      const res = await q.maybeSingle();

      if (res.error) {
        console.error("Erreur vérification existence:", res.error);
        return false;
      }
      return !!res.data;
    },
  };
}

// ============================================
// Instance par défaut
// ============================================

/**
 * Instance QueryBuilder par défaut utilisant le client Supabase global.
 * @example
 * import { qb } from "@/lib/supabaseQueryBuilder";
 * const profile = await qb.selectOne<Profile>("profiles", "id", userId);
 */
export const qb = createSupabaseQueryBuilder();
