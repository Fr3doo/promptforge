import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "../useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with remaining 0 and isActive false", () => {
    const { result } = renderHook(() => useCountdown());

    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("should start countdown with specified seconds", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(60);
    });

    expect(result.current.remaining).toBe(60);
    expect(result.current.isActive).toBe(true);
  });

  it("should decrement remaining every second", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(5);
    });

    expect(result.current.remaining).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(4);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(3);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(1);
  });

  it("should stop countdown and preserve remaining", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(10);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(7);

    act(() => {
      result.current.stop();
    });

    expect(result.current.remaining).toBe(7);
    expect(result.current.isActive).toBe(false);

    // Timer should not continue after stop
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(7);
  });

  it("should reset countdown to 0 and stop", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(10);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(7);

    act(() => {
      result.current.reset();
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("should call onComplete when countdown reaches 0", () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useCountdown({ onComplete }));

    act(() => {
      result.current.start(3);
    });

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("should restart countdown when start is called again", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(10);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(7);

    // Start new countdown
    act(() => {
      result.current.start(20);
    });

    expect(result.current.remaining).toBe(20);
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(19);
  });

  it("should not go below 0", () => {
    const { result } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(2);
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remaining).toBe(0);
  });

  it("should cleanup interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { result, unmount } = renderHook(() => useCountdown());

    act(() => {
      result.current.start(60);
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
