import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useConflictDetection } from "../useConflictDetection";
import { useOptimisticLocking } from "../useOptimisticLocking";

vi.mock("../useOptimisticLocking");

describe("useConflictDetection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devrait détecter un conflit initial", async () => {
    const mockCheckForServerUpdates = vi.fn().mockResolvedValue({
      hasConflict: true,
      serverUpdatedAt: "2024-01-02T00:00:00Z",
    });

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    const { result } = renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        true
      )
    );

    await waitFor(() => {
      expect(result.current.hasConflict).toBe(true);
      expect(result.current.serverUpdatedAt).toBe("2024-01-02T00:00:00Z");
    });

    expect(mockCheckForServerUpdates).toHaveBeenCalledWith(
      "prompt-1",
      "2024-01-01T00:00:00Z"
    );
  });

  it("ne devrait pas détecter de conflit si les dates sont identiques", async () => {
    const mockCheckForServerUpdates = vi.fn().mockResolvedValue({
      hasConflict: false,
      serverUpdatedAt: undefined,
    });

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    const { result } = renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        true
      )
    );

    await waitFor(() => {
      expect(result.current.hasConflict).toBe(false);
      expect(result.current.serverUpdatedAt).toBeUndefined();
    });
  });

  it("devrait vérifier périodiquement toutes les 30 secondes", async () => {
    const mockCheckForServerUpdates = vi.fn().mockResolvedValue({
      hasConflict: false,
      serverUpdatedAt: undefined,
    });

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        true
      )
    );

    // Vérification initiale
    await waitFor(() => {
      expect(mockCheckForServerUpdates).toHaveBeenCalledTimes(1);
    });

    // Avancer de 30 secondes
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockCheckForServerUpdates).toHaveBeenCalledTimes(2);
    });

    // Avancer encore de 30 secondes
    vi.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockCheckForServerUpdates).toHaveBeenCalledTimes(3);
    });
  });

  it("devrait permettre de réinitialiser le conflit", async () => {
    const mockCheckForServerUpdates = vi.fn().mockResolvedValue({
      hasConflict: true,
      serverUpdatedAt: "2024-01-02T00:00:00Z",
    });

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    const { result } = renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        true
      )
    );

    await waitFor(() => {
      expect(result.current.hasConflict).toBe(true);
    });

    // Réinitialiser le conflit
    result.current.resetConflict();

    expect(result.current.hasConflict).toBe(false);
    expect(result.current.serverUpdatedAt).toBeUndefined();
  });

  it("ne devrait pas vérifier si isEnabled est false", async () => {
    const mockCheckForServerUpdates = vi.fn();

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        false
      )
    );

    // Attendre un peu
    vi.advanceTimersByTime(1000);

    expect(mockCheckForServerUpdates).not.toHaveBeenCalled();
  });

  it("ne devrait pas vérifier si promptId est undefined", async () => {
    const mockCheckForServerUpdates = vi.fn();

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    renderHook(() =>
      useConflictDetection(
        undefined,
        "2024-01-01T00:00:00Z",
        true
      )
    );

    vi.advanceTimersByTime(1000);

    expect(mockCheckForServerUpdates).not.toHaveBeenCalled();
  });

  it("ne devrait pas vérifier si clientUpdatedAt est undefined", async () => {
    const mockCheckForServerUpdates = vi.fn();

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    renderHook(() =>
      useConflictDetection(
        "prompt-1",
        undefined,
        true
      )
    );

    vi.advanceTimersByTime(1000);

    expect(mockCheckForServerUpdates).not.toHaveBeenCalled();
  });

  it("devrait arrêter la vérification lors du unmount", async () => {
    const mockCheckForServerUpdates = vi.fn().mockResolvedValue({
      hasConflict: false,
      serverUpdatedAt: undefined,
    });

    vi.mocked(useOptimisticLocking).mockReturnValue({
      checkForServerUpdates: mockCheckForServerUpdates,
    } as any);

    const { unmount } = renderHook(() =>
      useConflictDetection(
        "prompt-1",
        "2024-01-01T00:00:00Z",
        true
      )
    );

    await waitFor(() => {
      expect(mockCheckForServerUpdates).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Avancer de 60 secondes après unmount
    vi.advanceTimersByTime(60000);

    // Le nombre d'appels ne devrait pas augmenter
    expect(mockCheckForServerUpdates).toHaveBeenCalledTimes(1);
  });
});
