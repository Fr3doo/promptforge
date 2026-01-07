import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConflictHandler } from "../useConflictHandler";
import { toast } from "sonner";

// Mock useOptimisticLocking
const mockCheckForServerUpdates = vi.fn();
vi.mock("@/hooks/useOptimisticLocking", () => ({
  useOptimisticLocking: () => ({
    checkForServerUpdates: mockCheckForServerUpdates,
  }),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useConflictHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns hasConflict: false when promptId is undefined", async () => {
    const { result } = renderHook(() => useConflictHandler(undefined, "2025-01-01T00:00:00Z"));

    const conflictResult = await act(async () => result.current.checkConflict());

    expect(conflictResult.hasConflict).toBe(false);
    expect(mockCheckForServerUpdates).not.toHaveBeenCalled();
  });

  it("returns hasConflict: false when clientUpdatedAt is undefined", async () => {
    const { result } = renderHook(() => useConflictHandler("prompt-123", undefined));

    const conflictResult = await act(async () => result.current.checkConflict());

    expect(conflictResult.hasConflict).toBe(false);
    expect(mockCheckForServerUpdates).not.toHaveBeenCalled();
  });

  it("detects conflict when server has newer timestamp", async () => {
    mockCheckForServerUpdates.mockResolvedValue({
      hasConflict: true,
      serverUpdatedAt: "2025-01-02T00:00:00Z",
    });

    const { result } = renderHook(() =>
      useConflictHandler("prompt-123", "2025-01-01T00:00:00Z")
    );

    const conflictResult = await act(async () => result.current.checkConflict());

    expect(conflictResult.hasConflict).toBe(true);
    expect(conflictResult.conflictMessage).toContain("modifié par un autre utilisateur");
    expect(mockCheckForServerUpdates).toHaveBeenCalledWith("prompt-123", "2025-01-01T00:00:00Z");
  });

  it("shows toast with reload action on conflict", async () => {
    mockCheckForServerUpdates.mockResolvedValue({
      hasConflict: true,
      serverUpdatedAt: "2025-01-02T00:00:00Z",
    });

    const { result } = renderHook(() =>
      useConflictHandler("prompt-123", "2025-01-01T00:00:00Z")
    );

    await act(async () => result.current.checkConflict());

    expect(toast.error).toHaveBeenCalledWith(
      "Conflit détecté",
      expect.objectContaining({
        description: expect.stringContaining("modifié par un autre utilisateur"),
        action: expect.objectContaining({
          label: "Recharger",
        }),
      })
    );
  });

  it("returns hasConflict: false when timestamps match", async () => {
    mockCheckForServerUpdates.mockResolvedValue({
      hasConflict: false,
    });

    const { result } = renderHook(() =>
      useConflictHandler("prompt-123", "2025-01-01T00:00:00Z")
    );

    const conflictResult = await act(async () => result.current.checkConflict());

    expect(conflictResult.hasConflict).toBe(false);
    expect(conflictResult.conflictMessage).toBeUndefined();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("returns hasConflict: false when client timestamp is newer", async () => {
    mockCheckForServerUpdates.mockResolvedValue({
      hasConflict: false,
    });

    const { result } = renderHook(() =>
      useConflictHandler("prompt-123", "2025-01-02T00:00:00Z")
    );

    const conflictResult = await act(async () => result.current.checkConflict());

    expect(conflictResult.hasConflict).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
