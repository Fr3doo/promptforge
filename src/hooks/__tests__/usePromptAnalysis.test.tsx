import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePromptAnalysis } from '../usePromptAnalysis';
import { AnalysisRepositoryProvider } from '@/contexts/AnalysisRepositoryContext';
import type { AnalysisRepository, AnalysisResult } from '@/repositories/AnalysisRepository';

// Mock analysis messages hook
const mockShowAnalyzing = vi.fn();
const mockShowAnalysisComplete = vi.fn();
const mockShowEmptyPromptError = vi.fn();
const mockShowAnalysisFailed = vi.fn();
const mockShowTimeoutError = vi.fn();
const mockShowRateLimitError = vi.fn();

vi.mock('@/features/prompts/hooks/useAnalysisMessages', () => ({
  useAnalysisMessages: () => ({
    showAnalyzing: mockShowAnalyzing,
    showAnalysisComplete: mockShowAnalysisComplete,
    showEmptyPromptError: mockShowEmptyPromptError,
    showAnalysisFailed: mockShowAnalysisFailed,
    showTimeoutError: mockShowTimeoutError,
    showRateLimitError: mockShowRateLimitError,
  }),
}));

// Mock logger to prevent console noise
vi.mock('@/lib/logger', () => ({
  captureException: vi.fn(),
}));

describe('usePromptAnalysis', () => {
  let mockRepository: AnalysisRepository;
  let mockAnalysisResult: AnalysisResult;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

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
    <QueryClientProvider client={queryClient}>
      <AnalysisRepositoryProvider repository={mockRepository}>
        {children}
      </AnalysisRepositoryProvider>
    </QueryClientProvider>
  );

  it('should initialize with null result and not analyzing', () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    expect(result.current.result).toBeNull();
    expect(result.current.isAnalyzing).toBe(false);
  });

  it('should analyze a prompt successfully and show success toast', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Start analysis
    await act(async () => {
      result.current.analyze('Test prompt content');
    });

    // Wait for analysis to complete
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Verify repository was called correctly
    expect(mockRepository.analyzePrompt).toHaveBeenCalledWith('Test prompt content');
    expect(mockRepository.analyzePrompt).toHaveBeenCalledTimes(1);

    // Verify messages were called
    expect(mockShowAnalyzing).toHaveBeenCalled();
    expect(mockShowAnalysisComplete).toHaveBeenCalled();

    // Verify result is set correctly
    expect(result.current.result).toEqual(mockAnalysisResult);
  });

  it('should not analyze empty or whitespace-only prompt', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Test with empty string
    await act(async () => {
      await result.current.analyze('');
    });
    expect(mockRepository.analyzePrompt).not.toHaveBeenCalled();
    expect(mockShowEmptyPromptError).toHaveBeenCalled();

    vi.clearAllMocks();

    // Test with whitespace
    await act(async () => {
      await result.current.analyze('   ');
    });
    expect(mockRepository.analyzePrompt).not.toHaveBeenCalled();
    expect(mockShowEmptyPromptError).toHaveBeenCalled();

    // Result should remain null
    expect(result.current.result).toBeNull();
  });

  it('should handle analysis error and show error toast', async () => {
    const error = new Error('Analysis service unavailable');
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // Start analysis
    await act(async () => {
      result.current.analyze('Test prompt');
    });

    // Wait for error handling
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Verify error handling
    expect(mockShowAnalyzing).toHaveBeenCalled();
    expect(mockShowAnalysisFailed).toHaveBeenCalledWith('Analysis service unavailable');
    expect(result.current.result).toBeNull();
  });

  it('should handle error without message and use fallback', async () => {
    const error = { code: 'UNKNOWN' }; // Error without message property
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    await act(async () => {
      result.current.analyze('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    // Should use fallback error message for non-Error objects
    expect(mockShowAnalysisFailed).toHaveBeenCalledWith('[object Object]');
  });

  it('should reset result to null', async () => {
    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    // First, analyze to set a result
    await act(async () => {
      result.current.analyze('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.result).not.toBeNull();
    });

    // Then reset
    act(() => {
      result.current.reset();
    });

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
    act(() => {
      result.current.analyze('Test prompt');
    });

    // Should be analyzing
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(true);
    });

    // Resolve the analysis
    await act(async () => {
      resolveAnalysis!(mockAnalysisResult);
    });

    // Should finish analyzing
    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.result).toEqual(mockAnalysisResult);
  });

  it('should set isAnalyzing to false even if analysis fails', async () => {
    mockRepository.analyzePrompt = vi.fn().mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => usePromptAnalysis(), { wrapper });

    await act(async () => {
      result.current.analyze('Test prompt');
    });

    await waitFor(() => {
      expect(result.current.isAnalyzing).toBe(false);
    });

    expect(result.current.result).toBeNull();
  });
});
