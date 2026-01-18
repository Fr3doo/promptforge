import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRetryCounter } from "../useRetryCounter";
import { RETRY_CONFIG } from "@/lib/network";

describe("useRetryCounter", () => {
  describe("canRetry()", () => {
    it("returns true initially (no attempts made)", () => {
      const { result } = renderHook(() => useRetryCounter());

      expect(result.current.canRetry()).toBe(true);
    });

    it("returns true after fewer than MAX_ATTEMPTS retries", () => {
      const { result } = renderHook(() => useRetryCounter());

      // Execute 2 retries (assuming MAX_ATTEMPTS is 3)
      act(() => {
        result.current.incrementAndRetry(() => {});
        result.current.incrementAndRetry(() => {});
      });

      expect(result.current.canRetry()).toBe(true);
      expect(result.current.getAttempts()).toBe(2);
    });

    it("returns false after MAX_ATTEMPTS retries", () => {
      const { result } = renderHook(() => useRetryCounter());

      // Execute MAX_ATTEMPTS retries
      act(() => {
        for (let i = 0; i < RETRY_CONFIG.MAX_ATTEMPTS; i++) {
          result.current.incrementAndRetry(() => {});
        }
      });

      expect(result.current.canRetry()).toBe(false);
      expect(result.current.getAttempts()).toBe(RETRY_CONFIG.MAX_ATTEMPTS);
    });
  });

  describe("incrementAndRetry()", () => {
    it("executes the retry function when under limit", () => {
      const { result } = renderHook(() => useRetryCounter());
      const retryFn = vi.fn();

      act(() => {
        const executed = result.current.incrementAndRetry(retryFn);
        expect(executed).toBe(true);
      });

      expect(retryFn).toHaveBeenCalledTimes(1);
    });

    it("increments the attempt counter", () => {
      const { result } = renderHook(() => useRetryCounter());

      expect(result.current.getAttempts()).toBe(0);

      act(() => {
        result.current.incrementAndRetry(() => {});
      });

      expect(result.current.getAttempts()).toBe(1);
    });

    it("does NOT execute retry function when limit reached", () => {
      const { result } = renderHook(() => useRetryCounter());
      const retryFn = vi.fn();

      // Exhaust all attempts
      act(() => {
        for (let i = 0; i < RETRY_CONFIG.MAX_ATTEMPTS; i++) {
          result.current.incrementAndRetry(() => {});
        }
      });

      // Try one more time
      act(() => {
        const executed = result.current.incrementAndRetry(retryFn);
        expect(executed).toBe(false);
      });

      expect(retryFn).not.toHaveBeenCalled();
    });

    it("returns false when limit is reached", () => {
      const { result } = renderHook(() => useRetryCounter());

      // Exhaust all attempts
      act(() => {
        for (let i = 0; i < RETRY_CONFIG.MAX_ATTEMPTS; i++) {
          result.current.incrementAndRetry(() => {});
        }
      });

      act(() => {
        const executed = result.current.incrementAndRetry(() => {});
        expect(executed).toBe(false);
      });
    });
  });

  describe("reset()", () => {
    it("resets the attempt counter to 0", () => {
      const { result } = renderHook(() => useRetryCounter());

      // Make some attempts
      act(() => {
        result.current.incrementAndRetry(() => {});
        result.current.incrementAndRetry(() => {});
      });

      expect(result.current.getAttempts()).toBe(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.getAttempts()).toBe(0);
    });

    it("allows retries again after reset", () => {
      const { result } = renderHook(() => useRetryCounter());

      // Exhaust all attempts
      act(() => {
        for (let i = 0; i < RETRY_CONFIG.MAX_ATTEMPTS; i++) {
          result.current.incrementAndRetry(() => {});
        }
      });

      expect(result.current.canRetry()).toBe(false);

      // Reset and verify retry is allowed again
      act(() => {
        result.current.reset();
      });

      expect(result.current.canRetry()).toBe(true);
    });
  });

  describe("getAttempts()", () => {
    it("returns 0 initially", () => {
      const { result } = renderHook(() => useRetryCounter());

      expect(result.current.getAttempts()).toBe(0);
    });

    it("returns accurate count after multiple increments", () => {
      const { result } = renderHook(() => useRetryCounter());

      act(() => {
        result.current.incrementAndRetry(() => {});
        result.current.incrementAndRetry(() => {});
        result.current.incrementAndRetry(() => {});
      });

      expect(result.current.getAttempts()).toBe(3);
    });
  });

  describe("integration with RETRY_CONFIG", () => {
    it("uses MAX_ATTEMPTS from RETRY_CONFIG", () => {
      const { result } = renderHook(() => useRetryCounter());

      // This test verifies that the hook respects the configured MAX_ATTEMPTS
      expect(RETRY_CONFIG.MAX_ATTEMPTS).toBe(3);

      // After exactly MAX_ATTEMPTS, canRetry should be false
      act(() => {
        for (let i = 0; i < RETRY_CONFIG.MAX_ATTEMPTS; i++) {
          expect(result.current.canRetry()).toBe(true);
          result.current.incrementAndRetry(() => {});
        }
      });

      expect(result.current.canRetry()).toBe(false);
    });
  });
});
