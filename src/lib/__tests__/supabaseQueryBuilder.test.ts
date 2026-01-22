import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSupabaseQueryBuilder } from "../supabaseQueryBuilder";

// ============================================
// Chainable mock factory
// ============================================

interface MockResult {
  data: unknown;
  error: null | { message: string; code?: string };
  count?: number;
}

function createChainableMock(result: MockResult) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    // Thenable: await query resolves to result
    then: (resolve: (value: MockResult) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

function createMockClient(result: MockResult) {
  const chainable = createChainableMock(result);
  return {
    from: vi.fn().mockReturnValue(chainable),
    _chainable: chainable,
  };
}

describe("supabaseQueryBuilder", () => {
  describe("selectMany", () => {
    it("should return array of results", async () => {
      const mockData = [{ id: "1", name: "Test" }];
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectMany("prompts");

      expect(client.from).toHaveBeenCalledWith("prompts");
      expect(client._chainable.select).toHaveBeenCalledWith("*");
      expect(result).toEqual(mockData);
    });

    it("should apply eq filters and skip undefined", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: {
          eq: { owner_id: "user-1", status: undefined },
        },
      });

      expect(client._chainable.eq).toHaveBeenCalledWith("owner_id", "user-1");
      expect(client._chainable.eq).toHaveBeenCalledTimes(1);
    });

    it("should apply neq filters", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: { neq: { visibility: "PRIVATE" } },
      });

      expect(client._chainable.neq).toHaveBeenCalledWith("visibility", "PRIVATE");
    });

    it("should apply gte filters", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: { gte: { updated_at: "2024-01-01" } },
      });

      expect(client._chainable.gte).toHaveBeenCalledWith("updated_at", "2024-01-01");
    });

    it("should skip empty in arrays", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: { in: { id: [] } },
      });

      expect(client._chainable.in).not.toHaveBeenCalled();
    });

    it("should apply in filters with values", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: { in: { id: ["1", "2", "3"] } },
      });

      expect(client._chainable.in).toHaveBeenCalledWith("id", ["1", "2", "3"]);
    });

    it("should apply isNull filters", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        filters: { isNull: ["deleted_at"] },
      });

      expect(client._chainable.is).toHaveBeenCalledWith("deleted_at", null);
    });

    it("should apply order and limit", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectMany("prompts", {
        order: { column: "updated_at", ascending: false },
        limit: 10,
      });

      expect(client._chainable.order).toHaveBeenCalledWith("updated_at", { ascending: false });
      expect(client._chainable.limit).toHaveBeenCalledWith(10);
    });

    it("should return empty array when data is null", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectMany("prompts");

      expect(result).toEqual([]);
    });
  });

  describe("selectOne", () => {
    it("should return single record when found", async () => {
      const mockData = { id: "1", name: "Test" };
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectOne("profiles", "id", "1");

      expect(client._chainable.eq).toHaveBeenCalledWith("id", "1");
      expect(client._chainable.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should return null when not found", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectOne("profiles", "id", "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("selectOneRequired", () => {
    it("should return record when found", async () => {
      const mockData = { id: "1", name: "Test" };
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectOneRequired("profiles", "id", "1");

      expect(client._chainable.single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should throw when not found (PGRST116)", async () => {
      const client = createMockClient({
        data: null,
        error: { message: "Row not found", code: "PGRST116" },
      });
      const qb = createSupabaseQueryBuilder(client as any);

      await expect(qb.selectOneRequired("profiles", "id", "nonexistent")).rejects.toThrow();
    });
  });

  describe("countRows", () => {
    it("should return count", async () => {
      const client = createMockClient({ data: null, error: null, count: 42 });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.countRows("prompts");

      expect(client._chainable.select).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(result).toBe(42);
    });

    it("should apply filters to count", async () => {
      const client = createMockClient({ data: null, error: null, count: 5 });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.countRows("prompts", { eq: { status: "PUBLISHED" } });

      expect(client._chainable.eq).toHaveBeenCalledWith("status", "PUBLISHED");
    });

    it("should return 0 when count is null", async () => {
      const client = createMockClient({ data: null, error: null, count: undefined });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.countRows("prompts");

      expect(result).toBe(0);
    });
  });

  describe("insertOne", () => {
    it("should insert and return created record", async () => {
      const mockData = { id: "new-id", title: "New Prompt" };
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.insertOne("prompts", { title: "New Prompt" });

      expect(client._chainable.insert).toHaveBeenCalledWith({ title: "New Prompt" });
      expect(client._chainable.select).toHaveBeenCalled();
      expect(client._chainable.single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("insertMany", () => {
    it("should insert multiple records", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.insertMany("prompts", [{ title: "A" }, { title: "B" }]);

      expect(client._chainable.insert).toHaveBeenCalledWith([{ title: "A" }, { title: "B" }]);
    });

    it("should no-op when array is empty", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.insertMany("prompts", []);

      expect(client.from).not.toHaveBeenCalled();
    });
  });

  describe("updateById", () => {
    it("should update and return updated record", async () => {
      const mockData = { id: "1", title: "Updated" };
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.updateById("prompts", "1", { title: "Updated" });

      expect(client._chainable.update).toHaveBeenCalledWith({ title: "Updated" });
      expect(client._chainable.eq).toHaveBeenCalledWith("id", "1");
      expect(result).toEqual(mockData);
    });

    it("should use custom id column", async () => {
      const client = createMockClient({ data: { id: "1" }, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.updateById("users", "uuid-123", { name: "Test" }, "user_id");

      expect(client._chainable.eq).toHaveBeenCalledWith("user_id", "uuid-123");
    });
  });

  describe("deleteById", () => {
    it("should delete by id", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.deleteById("prompts", "1");

      expect(client._chainable.delete).toHaveBeenCalled();
      expect(client._chainable.eq).toHaveBeenCalledWith("id", "1");
    });
  });

  describe("deleteByIds", () => {
    it("should delete by list of ids", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.deleteByIds("prompts", ["1", "2", "3"]);

      expect(client._chainable.delete).toHaveBeenCalled();
      expect(client._chainable.in).toHaveBeenCalledWith("id", ["1", "2", "3"]);
    });

    it("should no-op when array is empty", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.deleteByIds("prompts", []);

      expect(client.from).not.toHaveBeenCalled();
    });
  });

  describe("deleteWhere", () => {
    it("should delete records matching filter", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.deleteWhere("variables", "prompt_id", "prompt-123");

      expect(client.from).toHaveBeenCalledWith("variables");
      expect(client._chainable.delete).toHaveBeenCalled();
      expect(client._chainable.eq).toHaveBeenCalledWith("prompt_id", "prompt-123");
    });
  });


  describe("upsertMany", () => {
    it("should upsert and return records", async () => {
      const mockData = [{ id: "1", title: "A" }];
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.upsertMany("prompts", [{ id: "1", title: "A" }]);

      expect(client._chainable.upsert).toHaveBeenCalledWith(
        [{ id: "1", title: "A" }],
        { onConflict: "id", ignoreDuplicates: false }
      );
      expect(result).toEqual(mockData);
    });

    it("should use custom onConflict", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.upsertMany("variables", [{ name: "x" }], { onConflict: "prompt_id,name" });

      expect(client._chainable.upsert).toHaveBeenCalledWith(
        [{ name: "x" }],
        { onConflict: "prompt_id,name", ignoreDuplicates: false }
      );
    });

    it("should apply order option", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.upsertMany("variables", [{ name: "x" }], {
        order: { column: "order_index", ascending: true },
      });

      expect(client._chainable.order).toHaveBeenCalledWith("order_index", { ascending: true });
    });

    it("should return empty array when input is empty", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.upsertMany("prompts", []);

      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });
  });

  describe("selectManyByIds", () => {
    it("should return empty array for empty ids", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectManyByIds("versions", []);

      expect(result).toEqual([]);
      expect(client.from).not.toHaveBeenCalled();
    });

    it("should fetch records by ids", async () => {
      const mockData = [{ id: "1" }, { id: "2" }];
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectManyByIds("versions", ["1", "2"]);

      expect(client._chainable.in).toHaveBeenCalledWith("id", ["1", "2"]);
      expect(result).toEqual(mockData);
    });

    it("should use custom id column", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.selectManyByIds("versions", ["a"], "prompt_id");

      expect(client._chainable.in).toHaveBeenCalledWith("prompt_id", ["a"]);
    });
  });

  describe("updateWhere", () => {
    it("should update records matching filter", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      await qb.updateWhere("prompts", "id", "prompt-1", { version: "2.0.0" });

      expect(client._chainable.update).toHaveBeenCalledWith({ version: "2.0.0" });
      expect(client._chainable.eq).toHaveBeenCalledWith("id", "prompt-1");
    });
  });

  describe("selectFirst", () => {
    it("should return first record with filters and order", async () => {
      const mockData = { id: "1", created_at: "2024-01-01" };
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectFirst("versions", {
        filters: { eq: { prompt_id: "p1" } },
        order: { column: "created_at", ascending: false },
      });

      expect(client._chainable.eq).toHaveBeenCalledWith("prompt_id", "p1");
      expect(client._chainable.order).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(client._chainable.limit).toHaveBeenCalledWith(1);
      expect(client._chainable.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it("should return null when no results", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectFirst("versions");

      expect(result).toBeNull();
    });

    it("should handle PGRST116 gracefully", async () => {
      const client = createMockClient({
        data: null,
        error: { message: "Row not found", code: "PGRST116" },
      });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectFirst("versions");

      expect(result).toBeNull();
    });
  });

  describe("exists", () => {
    it("should return true when record exists", async () => {
      const client = createMockClient({ data: { id: "1" }, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.exists("versions", {
        eq: { prompt_id: "p1", semver: "1.0.0" },
      });

      expect(client._chainable.select).toHaveBeenCalledWith("id");
      expect(client._chainable.eq).toHaveBeenCalledWith("prompt_id", "p1");
      expect(client._chainable.eq).toHaveBeenCalledWith("semver", "1.0.0");
      expect(result).toBe(true);
    });

    it("should return false when record does not exist", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.exists("versions", { eq: { id: "nonexistent" } });

      expect(result).toBe(false);
    });

    it("should return false and log on error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const client = createMockClient({
        data: null,
        error: { message: "Database error" },
      });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.exists("versions", { eq: { id: "x" } });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur vérification existence:",
        expect.any(Object)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("selectWithJoin", () => {
    it("should select with join columns", async () => {
      const mockData = [
        { permission: "READ", prompts: { id: "1", title: "Test" } },
      ];
      const client = createMockClient({ data: mockData, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectWithJoin(
        "prompt_shares",
        "permission, prompts:prompt_id (*)",
        { eq: { shared_with_user_id: "user-123" } }
      );

      expect(client.from).toHaveBeenCalledWith("prompt_shares");
      expect(client._chainable.select).toHaveBeenCalledWith(
        "permission, prompts:prompt_id (*)"
      );
      expect(client._chainable.eq).toHaveBeenCalledWith(
        "shared_with_user_id",
        "user-123"
      );
      expect(result).toEqual(mockData);
    });

    it("should return empty array when no results", async () => {
      const client = createMockClient({ data: [], error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectWithJoin(
        "prompt_shares",
        "permission, prompts:prompt_id (*)"
      );

      expect(result).toEqual([]);
    });

    it("should handle null data as empty array", async () => {
      const client = createMockClient({ data: null, error: null });
      const qb = createSupabaseQueryBuilder(client as any);

      const result = await qb.selectWithJoin("prompt_shares", "*");

      expect(result).toEqual([]);
    });

    it("should throw on error", async () => {
      const client = createMockClient({
        data: null,
        error: { message: "DB error" },
      });
      const qb = createSupabaseQueryBuilder(client as any);

      await expect(
        qb.selectWithJoin("prompt_shares", "*")
      ).rejects.toThrow();
    });
  });

  describe("error handling", () => {
    it("should throw on Supabase error", async () => {
      const client = createMockClient({
        data: null,
        error: { message: "Database error" },
      });
      const qb = createSupabaseQueryBuilder(client as any);

      await expect(qb.selectMany("prompts")).rejects.toThrow();
    });
  });
});
