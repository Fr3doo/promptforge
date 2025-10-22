import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PromptAnalyzer } from '../PromptAnalyzer';
import * as usePromptAnalysisModule from '@/hooks/usePromptAnalysis';
import * as usePromptsModule from '@/hooks/usePrompts';
import * as useVariablesModule from '@/hooks/useVariables';
import * as useVersionsModule from '@/hooks/useVersions';

// Mock des hooks
vi.mock('@/hooks/usePromptAnalysis');
vi.mock('@/hooks/usePrompts');
vi.mock('@/hooks/useVariables');
vi.mock('@/hooks/useVersions');
vi.mock('@/lib/logger');

const mockAnalysisResult = {
  sections: {},
  variables: [
    {
      name: 'topic',
      description: 'Le sujet principal',
      type: 'STRING',
      default_value: 'test',
      options: [],
      required: true,
    },
  ],
  prompt_template: 'Template avec {{topic}}',
  metadata: {
    role: 'Assistant',
    objectifs: ['Objectif test'],
    etapes: ['Étape 1', 'Étape 2'],
    criteres: ['Critère 1'],
    categories: ['test'],
  },
  exports: {
    json: {},
    markdown: '',
  },
};

describe('PromptAnalyzer - Save Function', () => {
  let mockCreatePrompt: ReturnType<typeof vi.fn>;
  let mockSaveVariables: ReturnType<typeof vi.fn>;
  let mockCreateVersion: ReturnType<typeof vi.fn>;
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreatePrompt = vi.fn();
    mockSaveVariables = vi.fn();
    mockCreateVersion = vi.fn();
    mockOnClose = vi.fn();

    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: null,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    vi.spyOn(usePromptsModule, 'useCreatePrompt').mockReturnValue({
      mutate: mockCreatePrompt,
      isPending: false,
    } as any);

    vi.spyOn(useVariablesModule, 'useBulkUpsertVariables').mockReturnValue({
      mutate: mockSaveVariables,
    } as any);

    vi.spyOn(useVersionsModule, 'useCreateVersion').mockReturnValue({
      mutate: mockCreateVersion,
    } as any);
  });

  it('should save prompt with variables and create initial version', async () => {
    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: mockAnalysisResult,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    render(<PromptAnalyzer onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Objectif test',
          content: 'Template avec {{topic}}',
          tags: ['test'],
          visibility: 'PRIVATE',
        }),
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Simuler le succès de création du prompt
    const createPromptCall = mockCreatePrompt.mock.calls[0];
    const onSuccessCallback = createPromptCall[1].onSuccess;
    onSuccessCallback({ id: 'new-prompt-id', content: 'Template avec {{topic}}' });

    await waitFor(() => {
      expect(mockSaveVariables).toHaveBeenCalledWith(
        {
          promptId: 'new-prompt-id',
          variables: [
            expect.objectContaining({
              name: 'topic',
              type: 'STRING',
              required: true,
              default_value: 'test',
              help: 'Le sujet principal',
            }),
          ],
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Simuler le succès de sauvegarde des variables
    const saveVariablesCall = mockSaveVariables.mock.calls[0];
    const onVariablesSuccess = saveVariablesCall[1].onSuccess;
    onVariablesSuccess();

    await waitFor(() => {
      expect(mockCreateVersion).toHaveBeenCalledWith(
        {
          promptId: 'new-prompt-id',
          content: 'Template avec {{topic}}',
          message: 'Version initiale créée depuis l\'analyseur',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Simuler le succès de création de version
    const createVersionCall = mockCreateVersion.mock.calls[0];
    const onVersionSuccess = createVersionCall[1].onSuccess;
    onVersionSuccess();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle prompt without variables', async () => {
    const resultWithoutVariables = {
      ...mockAnalysisResult,
      variables: [],
    };

    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: resultWithoutVariables,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    render(<PromptAnalyzer onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    });

    // Simuler le succès
    const createPromptCall = mockCreatePrompt.mock.calls[0];
    const onSuccessCallback = createPromptCall[1].onSuccess;
    onSuccessCallback({ id: 'new-prompt-id', content: 'Template' });

    await waitFor(() => {
      expect(mockSaveVariables).not.toHaveBeenCalled();
      expect(mockCreateVersion).toHaveBeenCalled();
    });
  });

  it('should handle validation errors gracefully', async () => {
    const invalidResult = {
      ...mockAnalysisResult,
      metadata: {
        ...mockAnalysisResult.metadata,
        objectifs: [''], // Empty title will fail validation
      },
    };

    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: invalidResult,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    render(<PromptAnalyzer onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).not.toHaveBeenCalled();
    });
  });

  it('should continue even if version creation fails', async () => {
    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: mockAnalysisResult,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    render(<PromptAnalyzer onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    });

    // Simuler succès prompt et variables
    const createPromptCall = mockCreatePrompt.mock.calls[0];
    createPromptCall[1].onSuccess({ id: 'new-prompt-id', content: 'Template' });

    await waitFor(() => {
      expect(mockSaveVariables).toHaveBeenCalled();
    });

    const saveVariablesCall = mockSaveVariables.mock.calls[0];
    saveVariablesCall[1].onSuccess();

    await waitFor(() => {
      expect(mockCreateVersion).toHaveBeenCalled();
    });

    // Simuler échec version
    const createVersionCall = mockCreateVersion.mock.calls[0];
    createVersionCall[1].onError(new Error('Version failed'));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled(); // Should still close
    });
  });

  it('should handle prompt creation errors', async () => {
    vi.spyOn(usePromptAnalysisModule, 'usePromptAnalysis').mockReturnValue({
      result: mockAnalysisResult,
      isAnalyzing: false,
      analyze: vi.fn(),
      reset: vi.fn(),
    });

    render(<PromptAnalyzer onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /sauvegarder/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrompt).toHaveBeenCalled();
    });

    // Simuler échec création prompt
    const createPromptCall = mockCreatePrompt.mock.calls[0];
    createPromptCall[1].onError(new Error('Database error'));

    await waitFor(() => {
      expect(mockSaveVariables).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
