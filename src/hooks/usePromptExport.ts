/**
 * Hook d'orchestration pour l'export de prompts
 * Gère le chargement lazy des versions, la génération et les actions
 */

import { useState, useCallback, useMemo } from "react";
import { useVersionRepository } from "@/contexts/VersionRepositoryContext";
import { useToastNotifier } from "@/hooks/useToastNotifier";
import { messages } from "@/constants/messages";
import type { Tables } from "@/integrations/supabase/types";
import {
  generateExport,
  mapPromptToExportable,
  mapVariablesToExportable,
  mapVersionsToExportable,
  downloadFile,
  getExportFilename,
  getExportMimeType,
  type ExportFormat,
  type ExportData,
} from "@/lib/promptExport";

type Prompt = Tables<"prompts">;
type Variable = Tables<"variables">;
type Version = Tables<"versions">;

export interface UsePromptExportOptions {
  prompt: Prompt;
  variables: Variable[];
}

export interface ExportAction {
  format: ExportFormat;
  action: "copy" | "download";
  includeVersions: boolean;
}

export function usePromptExport({ prompt, variables }: UsePromptExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [cachedVersions, setCachedVersions] = useState<Version[] | null>(null);
  
  const versionRepository = useVersionRepository();
  const { notifySuccess, notifyError } = useToastNotifier();

  /**
   * Charge les versions (lazy loading)
   */
  const loadVersions = useCallback(async (): Promise<Version[]> => {
    if (cachedVersions) return cachedVersions;
    
    setIsLoadingVersions(true);
    try {
      const versions = await versionRepository.fetchByPromptId(prompt.id);
      setCachedVersions(versions);
      return versions;
    } finally {
      setIsLoadingVersions(false);
    }
  }, [versionRepository, prompt.id, cachedVersions]);

  /**
   * Prépare les données pour l'export
   */
  const prepareExportData = useCallback((versions: Version[] = []): ExportData => {
    return {
      prompt: mapPromptToExportable(prompt),
      variables: mapVariablesToExportable(variables),
      versions: mapVersionsToExportable(versions),
    };
  }, [prompt, variables]);

  /**
   * Génère un aperçu de l'export
   */
  const generatePreview = useCallback((
    format: ExportFormat,
    includeVersions: boolean,
    versions: Version[] = []
  ): string => {
    const data = prepareExportData(versions);
    return generateExport(data, format, { includeVersions });
  }, [prepareExportData]);

  /**
   * Exécute l'export (copie ou téléchargement)
   */
  const exportPrompt = useCallback(async ({
    format,
    action,
    includeVersions,
  }: ExportAction): Promise<void> => {
    setIsExporting(true);
    
    try {
      // Charger les versions si nécessaire
      let versions: Version[] = [];
      if (includeVersions) {
        versions = await loadVersions();
      }

      // Générer le contenu
      const data = prepareExportData(versions);
      const content = generateExport(data, format, { includeVersions });

      // Exécuter l'action
      if (action === "copy") {
        await navigator.clipboard.writeText(content);
        notifySuccess(
          messages.prompts.export.success.copied,
          ""
        );
      } else {
        const filename = getExportFilename(prompt.title, format);
        const mimeType = getExportMimeType(format);
        downloadFile(content, filename, mimeType);
        notifySuccess(
          messages.prompts.export.success.downloaded(filename),
          ""
        );
      }
    } catch (error) {
      console.error("Export error:", error);
      notifyError(
        messages.labels.error,
        messages.prompts.export.errors.failed
      );
    } finally {
      setIsExporting(false);
    }
  }, [loadVersions, prepareExportData, prompt.title, notifySuccess, notifyError]);

  /**
   * Données mémoïsées pour l'aperçu sans versions
   */
  const baseExportData = useMemo(() => prepareExportData([]), [prepareExportData]);

  return {
    exportPrompt,
    generatePreview,
    loadVersions,
    isExporting,
    isLoadingVersions,
    cachedVersions,
    baseExportData,
  };
}
