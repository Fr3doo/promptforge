import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePromptSave } from '../usePromptSave';
import * as usePromptsHook from '../usePrompts';
import * as useVariablesHook from '../useVariables';
import * as useToastNotifierHook from '../useToastNotifier';
import { messages } from '@/constants/messages';
import type { Variable } from '@/features/prompts/types';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('usePromptSave', () => {
  let mockCreatePrompt: any;
  let mockUpdatePrompt: any;
  let mockSaveVariables: any;
  let mockNotifyError: any;

  beforeEach(() => {
    mockCreatePrompt = vi.fn((data, options) => {
      // Simulate success callback
      options?.onSuccess?.({ id: 'new-prompt-id', ...data });
    });
    
    mockUpdatePrompt = vi.fn((data, options) => {
      // Simulate success callback
      options?.onSuccess?.();
    });

    mockSaveVariables = vi.fn();
    mockNotifyError = vi.fn();

    // Mock hooks
    vi.spyOn(usePromptsHook, 'useCreatePrompt').mockReturnValue({
      mutate: mockCreatePrompt,
      isPending: false,
    } as any);

    vi.spyOn(usePromptsHook, 'useUpdatePrompt').mockReturnValue({
      mutate: mockUpdatePrompt,
      isPending: false,
    } as any);

    vi.spyOn(useVariablesHook, 'useBulkUpsertVariables').mockReturnValue({
      mutate: mockSaveVariables,
    } as any);

    vi.spyOn(useToastNotifierHook, 'useToastNotifier').mockReturnValue({
      notifyError: mockNotifyError,
      notifySuccess: vi.fn(),
      notifyInfo: vi.fn(),
      notifyWarning: vi.fn(),
      notifyLoading: vi.fn((title: string) => ({ 
        id: 'mock-toast-id',
        dismiss: vi.fn(),
        update: vi.fn(),
      })),
    });

    vi.clearAllMocks();
  });

  const validPromptData = {
    title: 'Test Prompt',
    description: 'Test Description',
    content: 'Test content {{variable1}}',
    tags: ['test', 'prompt'],
    visibility: 'PRIVATE' as const,
    variables: [] as Variable[],
  };

  describe('Validation', () => {
    it('should validate and create prompt with valid data', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      await result.current.savePrompt(validPromptData);

      expect(mockCreatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Prompt',
          description: 'Test Description',
          content: 'Test content {{variable1}}',
          tags: ['test', 'prompt'],
          visibility: 'PRIVATE',
        }),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/prompts');
    });

    it('should show error when title is empty', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const invalidData = { ...validPromptData, title: '' };
      await result.current.savePrompt(invalidData);

      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.validation.failed,
        expect.stringContaining('titre')
      );
      expect(mockCreatePrompt).not.toHaveBeenCalled();
    });

    it('should show error when content is empty', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const invalidData = { ...validPromptData, content: '' };
      await result.current.savePrompt(invalidData);

      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.validation.failed,
        expect.stringContaining('contenu')
      );
      expect(mockCreatePrompt).not.toHaveBeenCalled();
    });

    it('should show error when title exceeds maximum length', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const invalidData = { ...validPromptData, title: 'a'.repeat(201) };
      await result.current.savePrompt(invalidData);

      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.validation.failed,
        expect.stringContaining('200')
      );
      expect(mockCreatePrompt).not.toHaveBeenCalled();
    });

    it('should validate variables and show error for invalid variable', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const invalidVariable = {
        name: '', // Empty name is invalid
        type: 'STRING' as const,
        required: false,
      } as Variable;

      const dataWithInvalidVariable = {
        ...validPromptData,
        variables: [invalidVariable],
      };

      await result.current.savePrompt(dataWithInvalidVariable);

      expect(mockNotifyError).toHaveBeenCalled();
      expect(mockCreatePrompt).not.toHaveBeenCalled();
    });
  });

  describe('Create Mode', () => {
    it('should create new prompt without variables', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      await result.current.savePrompt(validPromptData);

      expect(mockCreatePrompt).toHaveBeenCalledTimes(1);
      expect(mockSaveVariables).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/prompts');
    });

    it('should create new prompt with variables', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const variables: Variable[] = [
        {
          id: 'var-1',
          name: 'variable1',
          type: 'STRING',
          required: true,
          default_value: 'default',
          help: 'Help text',
          pattern: '',
          options: null,
          order_index: 0,
          prompt_id: '',
          created_at: '',
        },
      ];

      const dataWithVariables = { ...validPromptData, variables };

      await result.current.savePrompt(dataWithVariables);

      expect(mockCreatePrompt).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: 'new-prompt-id',
          variables: expect.arrayContaining([
            expect.objectContaining({
              name: 'variable1',
              type: 'STRING',
              required: true,
              order_index: 0,
            }),
          ]),
        });
      });
    });

    it('should preserve variable order with correct order_index', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const variables: Variable[] = [
        {
          id: 'var-1',
          name: 'first',
          type: 'STRING',
          required: true,
          default_value: '',
          help: '',
          pattern: '',
          options: null,
          order_index: 0,
          prompt_id: '',
          created_at: '',
        },
        {
          id: 'var-2',
          name: 'second',
          type: 'NUMBER',
          required: false,
          default_value: '',
          help: '',
          pattern: '',
          options: null,
          order_index: 1,
          prompt_id: '',
          created_at: '',
        },
        {
          id: 'var-3',
          name: 'third',
          type: 'ENUM',
          required: true,
          default_value: '',
          help: '',
          pattern: '',
          options: ['a', 'b'],
          order_index: 2,
          prompt_id: '',
          created_at: '',
        },
      ];

      const dataWithVariables = { ...validPromptData, variables };

      await result.current.savePrompt(dataWithVariables);

      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: 'new-prompt-id',
          variables: [
            expect.objectContaining({
              name: 'first',
              order_index: 0,
            }),
            expect.objectContaining({
              name: 'second',
              order_index: 1,
            }),
            expect.objectContaining({
              name: 'third',
              order_index: 2,
            }),
          ],
        });
      });
    });

    it('should call onSuccess callback after creation', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => 
        usePromptSave({ isEditMode: false, onSuccess })
      );

      await result.current.savePrompt(validPromptData);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update Mode', () => {
    it('should update existing prompt', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: true }));

      await result.current.savePrompt(validPromptData, 'existing-prompt-id');

      expect(mockUpdatePrompt).toHaveBeenCalledWith(
        {
          id: 'existing-prompt-id',
          updates: expect.objectContaining({
            title: 'Test Prompt',
            content: 'Test content {{variable1}}',
          }),
        },
        expect.any(Object)
      );
      expect(mockCreatePrompt).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/prompts');
    });

    it('should update prompt and save variables', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: true }));

      const variables: Variable[] = [
        {
          id: 'var-1',
          name: 'updatedVar',
          type: 'NUMBER',
          required: false,
          default_value: '42',
          help: '',
          pattern: '',
          options: null,
          order_index: 0,
          prompt_id: 'existing-prompt-id',
          created_at: '',
        },
      ];

      const dataWithVariables = { ...validPromptData, variables };

      await result.current.savePrompt(dataWithVariables, 'existing-prompt-id');

      expect(mockUpdatePrompt).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(mockSaveVariables).toHaveBeenCalledWith({
          promptId: 'existing-prompt-id',
          variables: expect.arrayContaining([
            expect.objectContaining({
              name: 'updatedVar',
              type: 'NUMBER',
            }),
          ]),
        });
      });
    });

    it('should call onSuccess callback after update', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(() => 
        usePromptSave({ isEditMode: true, onSuccess })
      );

      await result.current.savePrompt(validPromptData, 'existing-prompt-id');

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('isSaving state', () => {
    it('should return false when not saving', () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      expect(result.current.isSaving).toBe(false);
    });

    it('should return true when creating', () => {
      vi.spyOn(usePromptsHook, 'useCreatePrompt').mockReturnValue({
        mutate: mockCreatePrompt,
        isPending: true,
      } as any);

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      expect(result.current.isSaving).toBe(true);
    });

    it('should return true when updating', () => {
      vi.spyOn(usePromptsHook, 'useUpdatePrompt').mockReturnValue({
        mutate: mockUpdatePrompt,
        isPending: true,
      } as any);

      const { result } = renderHook(() => usePromptSave({ isEditMode: true }));

      expect(result.current.isSaving).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle generic errors with fallback message', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      // Trigger an error by passing an object that will cause validation to fail
      // but won't have the standard Zod error structure
      mockCreatePrompt.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const dataWithInvalidStructure = { 
        ...validPromptData,
        visibility: 'INVALID' as any, // Invalid enum value
      };

      await result.current.savePrompt(dataWithInvalidStructure);

      expect(mockNotifyError).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    it('should handle null or empty description correctly', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const dataWithEmptyDescription = {
        ...validPromptData,
        description: '',
      };

      await result.current.savePrompt(dataWithEmptyDescription);

      expect(mockCreatePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
        expect.any(Object)
      );
    });
  });

  describe('Network Error Simulation (Task 9)', () => {
    it('should handle createPrompt network error without navigating', async () => {
      const mockError = new Error('Network error: Failed to create prompt');
      
      mockCreatePrompt.mockImplementation((data, options) => {
        options?.onError?.(mockError);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      await result.current.savePrompt(validPromptData);

      // Should NOT navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Should NOT create variables on error
      expect(mockSaveVariables).not.toHaveBeenCalled();
    });

    it('should handle updatePrompt network error without navigating', async () => {
      const mockError = new Error('Network error: Failed to update prompt');
      
      mockUpdatePrompt.mockImplementation((data, options) => {
        options?.onError?.(mockError);
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: true }));

      await result.current.savePrompt(validPromptData, 'existing-prompt-id');

      // Should NOT navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Should NOT update variables on error
      expect(mockSaveVariables).not.toHaveBeenCalled();
    });

    it('should show error message when createPrompt fails', async () => {
      const mockError = new Error('Database connection failed');
      
      mockCreatePrompt.mockImplementation((data, options) => {
        throw mockError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      await result.current.savePrompt(validPromptData);

      // Should display error notification
      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.save.failed,
        messages.errors.save.unexpected
      );
      
      // Should NOT navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle timeout error gracefully', async () => {
      const timeoutError = new Error('Request timeout');
      
      mockCreatePrompt.mockImplementation(() => {
        throw timeoutError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      await result.current.savePrompt(validPromptData);

      expect(mockNotifyError).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle 500 server error without creating version', async () => {
      const serverError = new Error('Internal Server Error');
      
      mockCreatePrompt.mockImplementation((data, options) => {
        throw serverError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const dataWithVariables = {
        ...validPromptData,
        variables: [
          {
            id: 'var-1',
            name: 'test_var',
            type: 'STRING' as const,
            required: false,
            default_value: '',
            help: '',
            pattern: '',
            options: null,
            order_index: 0,
            prompt_id: '',
            created_at: '',
          },
        ],
      };

      await result.current.savePrompt(dataWithVariables);

      // Should NOT save variables when prompt creation fails
      expect(mockSaveVariables).not.toHaveBeenCalled();
      
      // Should display error
      expect(mockNotifyError).toHaveBeenCalled();
      
      // Should NOT navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network disconnection error', async () => {
      const networkError = new Error('Network request failed');
      
      mockUpdatePrompt.mockImplementation(() => {
        throw networkError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: true }));

      await result.current.savePrompt(validPromptData, 'prompt-id');

      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.save.failed,
        messages.errors.save.unexpected
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should prevent onSuccess callback from being called on error', async () => {
      const onSuccess = vi.fn();
      const mockError = new Error('Save failed');
      
      mockCreatePrompt.mockImplementation(() => {
        throw mockError;
      });

      const { result } = renderHook(() => 
        usePromptSave({ isEditMode: false, onSuccess })
      );

      await result.current.savePrompt(validPromptData);

      // onSuccess should NOT be called when save fails
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockNotifyError).toHaveBeenCalled();
    });

    it('should handle error during variable save gracefully', async () => {
      const variableError = new Error('Failed to save variables');
      
      // Prompt creation succeeds but variable save fails
      mockCreatePrompt.mockImplementation((data, options) => {
        options?.onSuccess?.({ id: 'new-prompt-id', ...data });
      });
      
      mockSaveVariables.mockImplementation(() => {
        throw variableError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const dataWithVariables = {
        ...validPromptData,
        variables: [
          {
            id: 'var-1',
            name: 'test',
            type: 'STRING' as const,
            required: false,
            default_value: '',
            help: '',
            pattern: '',
            options: null,
            order_index: 0,
            prompt_id: '',
            created_at: '',
          },
        ],
      };

      await result.current.savePrompt(dataWithVariables);

      // Prompt should still be created
      expect(mockCreatePrompt).toHaveBeenCalled();
      
      // But error during variable save shouldn't prevent navigation
      // (this is acceptable behavior as the prompt itself was created)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/prompts');
      });
    });

    it('should display specific Zod validation error messages on network error with validation data', async () => {
      const zodError = {
        errors: [
          {
            path: ['content'],
            message: 'Le contenu ne peut pas dépasser 200000 caractères',
          },
        ],
      };
      
      mockCreatePrompt.mockImplementation(() => {
        throw zodError;
      });

      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      const dataWithVeryLongContent = {
        ...validPromptData,
        content: 'a'.repeat(200001),
      };

      await result.current.savePrompt(dataWithVeryLongContent);

      expect(mockNotifyError).toHaveBeenCalledWith(
        messages.errors.validation.failed,
        expect.stringContaining('200000')
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should remain on page after multiple consecutive errors', async () => {
      const { result } = renderHook(() => usePromptSave({ isEditMode: false }));

      // Simulate multiple save attempts failing
      mockCreatePrompt.mockImplementation(() => {
        throw new Error('Network error');
      });

      // First attempt
      await result.current.savePrompt(validPromptData);
      expect(mockNavigate).not.toHaveBeenCalled();

      // Second attempt
      await result.current.savePrompt(validPromptData);
      expect(mockNavigate).not.toHaveBeenCalled();

      // Third attempt
      await result.current.savePrompt(validPromptData);
      expect(mockNavigate).not.toHaveBeenCalled();

      // Error notification should be called 3 times
      expect(mockNotifyError).toHaveBeenCalledTimes(3);
    });
  });
});
