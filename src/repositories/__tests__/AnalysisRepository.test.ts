import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseAnalysisRepository, AnalysisTimeoutError } from '../AnalysisRepository';
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
          json: {
            original: 'Template {{testVar}}',
            version: '1.0',
            created_at: new Date().toISOString(),
          },
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

  describe('Timeout Handling', () => {
    it('should throw AnalysisTimeoutError on AbortError', async () => {
      const repository = new SupabaseAnalysisRepository();
      
      const abortError = new Error('The user aborted a request.');
      abortError.name = 'AbortError';
      
      mockInvoke.mockRejectedValue(abortError);

      await expect(repository.analyzePrompt('Test prompt'))
        .rejects
        .toThrow(AnalysisTimeoutError);
      
      await expect(repository.analyzePrompt('Test prompt'))
        .rejects
        .toThrow(/dépassé le délai maximum de 30s/);
    });

    it('should clear timeout on successful response', async () => {
      const repository = new SupabaseAnalysisRepository();
      
      const mockResult: AnalysisResult = {
        sections: { introduction: 'Test intro' },
        variables: [],
        prompt_template: 'Template',
        metadata: {
          role: 'assistant',
          objectifs: ['Test objective'],
        },
        exports: {
          json: { original: 'Template', version: '1.0', created_at: new Date().toISOString() },
          markdown: '# Test',
        },
      };

      mockInvoke.mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await repository.analyzePrompt('Test prompt');
      expect(result).toEqual(mockResult);
    });

    it('should throw AnalysisTimeoutError when message contains "aborted"', async () => {
      const repository = new SupabaseAnalysisRepository();
      
      const error = new Error('Request was aborted');
      mockInvoke.mockRejectedValue(error);

      await expect(repository.analyzePrompt('Test prompt'))
        .rejects
        .toThrow(AnalysisTimeoutError);
    });
  });
});
