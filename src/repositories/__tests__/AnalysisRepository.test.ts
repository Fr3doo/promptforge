import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAnalysisRepository } from '../AnalysisRepository';
import type { AnalysisResult } from '../AnalysisRepository';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('AnalysisRepository', () => {
  let repository: SupabaseAnalysisRepository;
  let mockInvoke: any;

  beforeEach(() => {
    repository = new SupabaseAnalysisRepository();
    const { supabase } = require('@/integrations/supabase/client');
    mockInvoke = supabase.functions.invoke;
    vi.clearAllMocks();
  });

  describe('analyzePrompt', () => {
    it('should successfully analyze a prompt', async () => {
      const mockResult: AnalysisResult = {
        sections: { introduction: 'Test intro' },
        variables: [
          {
            name: 'testVar',
            description: 'A test variable',
            type: 'STRING',
          },
        ],
        prompt_template: 'Template {{testVar}}',
        metadata: {
          role: 'assistant',
          objectifs: ['Test objective'],
        },
        exports: {
          json: {},
          markdown: '# Test',
        },
      };

      mockInvoke.mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await repository.analyzePrompt('Test prompt');

      expect(mockInvoke).toHaveBeenCalledWith('analyze-prompt', {
        body: { promptContent: 'Test prompt' },
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error when Supabase returns an error', async () => {
      const mockError = new Error('Network error');
      mockInvoke.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(repository.analyzePrompt('Test prompt')).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw error when data contains an error', async () => {
      mockInvoke.mockResolvedValue({
        data: { error: 'Analysis failed' },
        error: null,
      });

      await expect(repository.analyzePrompt('Test prompt')).rejects.toThrow(
        'Analysis failed'
      );
    });
  });
});
