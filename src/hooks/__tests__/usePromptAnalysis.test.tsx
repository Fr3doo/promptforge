import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePromptAnalysis } from '../usePromptAnalysis';
import { AnalysisRepositoryProvider } from '@/contexts/AnalysisRepositoryContext';
import type { AnalysisRepository, AnalysisResult } from '@/repositories/AnalysisRepository';
import * as toastUtils from '@/lib/toastUtils';
import { messages } from '@/constants/messages';

// Mock toast utilities
vi.mock('@/lib/toastUtils', () => ({
  errorToast: vi.fn(),
  loadingToast: vi.fn(),
  successToast: vi.fn(),
}));

describe('usePromptAnalysis', () => {
  let mockRepository: AnalysisRepository;
  let mockAnalysisResult: AnalysisResult;

  beforeEach(() => {
    mockAnalysisResult = {
      sections: { intro: 'Test' },
      variables: [{
        name: 'testVar',
        description: 'Test variable',
        type: 'STRING',
      }],
      prompt_template: 'Template {{testVar}}',
      metadata: { 
        role: 'assistant', 
        objectifs: ['Test objective'],
        etapes: ['Step 1'],
        criteres: ['Criterion 1'],
      },
      exports: { 
        json: { 
          test: 'data',
          original: 'Original prompt content',
          version: '1.0',
          created_at: new Date().toISOString(),
        }, 
        markdown: '# Test\n\nContent here' 
      },
    };

    mockRepository = {
      analyzePrompt: vi.fn().mockResolvedValue(mockAnalysisResult),
    };

    vi.clearAllMocks();
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

  it('should analyze a prompt successfully and show success toast', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Start analysis
    result.current.analyze('Test prompt content');

    // Should immediately set isAnalyzing to true
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });

    // Wait for analysis to complete
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Verify repository was called correctly
    expect(mockRepository.analyzePrompt).toHaveBeenCalledWith('Test prompt content');
    expect(mockRepository.analyzePrompt).toHaveBeenCalledTimes(1);

    // Verify toasts were called
    expect(toastUtils.loadingToast).toHaveBeenCalledWith(messages.loading.analyzing);
    expect(toastUtils.successToast).toHaveBeenCalledWith(messages.success.analysisComplete);

    // Verify result is set correctly
    expect(result.current.result).toEqual(mockAnalysisResult);
  });

  it('should not analyze empty or whitespace-only prompt', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Test with empty string
    await result.current.analyze('');
    expect(mockRepository.analyzePrompt).not.toHaveBeenCalled();
    expect(toastUtils.errorToast).toHaveBeenCalledWith('Erreur', messages.errors.validation.emptyPrompt);

    vi.clearAllMocks();

    // Test with whitespace
    await result.current.analyze('   ');
    expect(mockRepository.analyzePrompt).not.toHaveBeenCalled();
    expect(toastUtils.errorToast).toHaveBeenCalledWith('Erreur', messages.errors.validation.emptyPrompt);

    // Result should remain null
    expect(result.current.result).toBeNull();
  });

  it('should handle analysis error and show error toast', async () => {
    const error = new Error('Analysis service unavailable');
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Start analysis
    result.current.analyze('Test prompt');

    // Wait for error handling
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Verify error handling
    expect(toastUtils.loadingToast).toHaveBeenCalled();
    expect(toastUtils.errorToast).toHaveBeenCalledWith(
      'Erreur', 
      'Analysis service unavailable'
    );
    expect(result.current.result).toBeNull();
  });

  it('should handle error without message and use fallback', async () => {
    const error = { code: 'UNKNOWN' }; // Error without message property
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    result.current.analyze('Test prompt');

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(toastUtils.errorToast).toHaveBeenCalledWith(
      'Erreur',
      messages.analysis.notifications.errors.failed
    );
  });

  it('should reset result to null', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // First, analyze to set a result
    result.current.analyze('Test prompt');

    await waitFor(() => {
      expect(result.current.result).not.toBeNull();
    });

    // Then reset
    result.current.reset();

    expect(result.current.result).toBeNull();
  });

  it('should maintain isAnalyzing state during the entire analysis', async () => {
    let resolveAnalysis: (value: AnalysisResult) => void;
    const analysisPromise = new Promise<AnalysisResult>((resolve) => {
      resolveAnalysis = resolve;
    });

    mockRepository.analyzePrompt = vi.fn().mockReturnValue(analysisPromise);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Start analysis
    result.current.analyze('Test prompt');

    // Should be analyzing
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });

    // Resolve the analysis
    resolveAnalysis!(mockAnalysisResult);

    // Should finish analyzing
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.result).toEqual(mockAnalysisResult);
  });

  it('should set isAnalyzing to false even if analysis fails', async () => {
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    result.current.analyze('Test prompt');

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.result).toBeNull();
  });
});

