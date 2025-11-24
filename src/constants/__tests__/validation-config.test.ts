import { describe, it, expect } from 'vitest';
import { VALIDATION } from '../application-config';

describe('VALIDATION constants', () => {
  describe('Prompt Analysis Limits', () => {
    it('should define soft limit correctly', () => {
      expect(VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT).toBe(12_000);
      expect(VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT).toBeGreaterThan(0);
    });

    it('should define hard limit correctly', () => {
      expect(VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT).toBe(20_000);
      expect(VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT).toBeGreaterThan(0);
    });

    it('should ensure hard limit is greater than soft limit', () => {
      expect(VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT).toBeGreaterThan(
        VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT
      );
    });

    it('should have reasonable gap between soft and hard limits', () => {
      const gap = VALIDATION.PROMPT_ANALYSIS_HARD_LIMIT - VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT;
      expect(gap).toBeGreaterThanOrEqual(5_000);
    });
  });

  describe('Immutability', () => {
    it('should be immutable (frozen)', () => {
      expect(() => {
        // @ts-expect-error Testing immutability
        VALIDATION.PROMPT_ANALYSIS_SOFT_LIMIT = 999;
      }).toThrow();
    });
  });
});
