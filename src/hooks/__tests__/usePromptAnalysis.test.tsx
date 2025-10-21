import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePromptAnalysis } from '../usePromptAnalysis';
import { AnalysisRepositoryProvider } from '@/contexts/AnalysisRepositoryContext';
import type { AnalysisRepository, AnalysisResult } from '@/repositories/AnalysisRepository';

// Mock toast utilities
vi.mock('@/lib/toastUtils', () => ({
  errorToast: vi.fn(),
  loadingToast: vi.fn(),
  successToast: vi.fn(),
}));

// Mock messages
vi.mock('@/constants/messages', () => ({
  messages: {
    errors: {
      validation: { emptyPrompt: 'Empty prompt' },
      analysis: { failed: 'Analysis failed' },
    },
    loading: { analyzing: 'Analyzing...' },
    success: { analysisComplete: 'Analysis complete' },
  },
}));

describe('usePromptAnalysis', () => {
  let mockRepository: AnalysisRepository;
  let mockAnalysisResult: AnalysisResult;

  beforeEach(() => {
    mockAnalysisResult = {
      sections: { intro: 'Test' },
      variables: [],
      prompt_template: 'Template',
      metadata: { role: 'assistant', objectifs: [] },
      exports: { json: {}, markdown: '# Test' },
    };

    mockRepository = {
      analyzePrompt: vi.fn().mockResolvedValue(mockAnalysisResult),
    };
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AnalysisRepositoryProvider repository={mockRepository}>
      {children}
    </AnalysisRepositoryProvider>
  );

  it('should initialize with null result and not analyzing', () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    expect(result.current.result).toBeNull();
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should analyze a prompt successfully', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    result.current.analyze('Test prompt');

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(mockRepository.analyzePrompt).toHaveBeenCalledWith('Test prompt');
    expect(result.current.result).toEqual(mockAnalysisResult);
  });

  it('should not analyze empty prompt', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    await result.current.analyze('   ');

    expect(mockRepository.analyzePrompt).not.toHaveBeenCalled();
    expect(result.current.result).toBeNull();
  });

  it('should handle analysis error', async () => {
    const error = new Error('Analysis failed');
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    result.current.analyze('Test prompt');

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.result).toBeNull();
  });

  it('should reset result', () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Manually set result
    result.current.analyze('Test');
    result.current.reset();

    expect(result.current.result).toBeNull();
  });
});
