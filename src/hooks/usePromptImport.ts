import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { usePromptImportService } from "@/contexts/PromptImportServiceContext";
import { usePromptCommandRepository } from "@/contexts/PromptCommandRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { messages } from "@/constants/messages";
import {
  parseImportContent,
  readFileContent,
  isAcceptedFileType,
  type ImportResult,
  type ParseResult,
} from "@/lib/promptImport";

export interface UsePromptImportReturn {
  /** Parse content and return result */
  parseContent: (content: string) => ParseResult;
  /** Parse a file and return result */
  parseFile: (file: File) => Promise<ParseResult>;
  /** Import the parsed data and create the prompt */
  importPrompt: (data: ImportResult) => Promise<void>;
  /** Whether an import is in progress */
  isImporting: boolean;
  /** Whether file parsing is in progress */
  isParsing: boolean;
  /** Check if a file type is accepted */
  isAcceptedFile: (file: File) => boolean;
}

/**
 * Hook orchestrating prompt import functionality
 * 
 * Handles:
 * - Content parsing (JSON, Markdown, paste)
 * - File reading
 * - Prompt creation with variables
 * - Navigation after import
 * 
 * @example
 * ```tsx
 * const { parseContent, importPrompt, isImporting } = usePromptImport();
 * 
 * const result = parseContent(pastedText);
 * if (result.success) {
 *   await importPrompt(result.data);
 * }
 * ```
 */
export function usePromptImport(): UsePromptImportReturn {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const importService = usePromptImportService();
  const commandRepository = usePromptCommandRepository();
  const variableRepository = useVariableRepository();
  const { notifySuccess, notifyError } = useToastNotifier();
  
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  
  /**
   * Parse content string (auto-detects format)
   */
  const parseContent = useCallback((content: string): ParseResult => {
    return parseImportContent(content);
  }, []);
  
  /**
   * Parse a file
   */
  const parseFile = useCallback(async (file: File): Promise<ParseResult> => {
    if (!isAcceptedFileType(file)) {
      return {
        success: false,
        error: {
          code: "INVALID_FORMAT",
          message: messages.import.errors.invalidFormat,
        },
      };
    }
    
    setIsParsing(true);
    try {
      const content = await readFileContent(file);
      return parseImportContent(content);
    } catch (error) {
      return {
        success: false,
        error: {
          code: "INVALID_FORMAT",
          message: getSafeErrorMessage(error),
        },
      };
    } finally {
      setIsParsing(false);
    }
  }, []);
  
  /**
   * Import parsed data and create the prompt
   */
  const importPrompt = useCallback(async (data: ImportResult): Promise<void> => {
    if (!user?.id) {
      notifyError(messages.labels.error, "Vous devez être connecté pour importer");
      return;
    }
    
    setIsImporting(true);
    try {
      const createdPrompt = await importService.import(
        user.id,
        data,
        commandRepository,
        variableRepository
      );
      
      // Invalidate prompts cache
      await queryClient.invalidateQueries({ queryKey: ["prompts"] });
      
      // Notify success
      notifySuccess(messages.import.success.imported(data.prompt.title));
      
      // Navigate to the new prompt
      navigate(`/prompts/${createdPrompt.id}`);
    } catch (error) {
      notifyError(messages.labels.error, getSafeErrorMessage(error));
    } finally {
      setIsImporting(false);
    }
  }, [user?.id, importService, commandRepository, variableRepository, queryClient, navigate, notifySuccess, notifyError]);
  
  return {
    parseContent,
    parseFile,
    importPrompt,
    isImporting,
    isParsing,
    isAcceptedFile: isAcceptedFileType,
  };
}
