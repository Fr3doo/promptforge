/**
 * Pure functions for prompt export generation
 * SOLID: Single responsibility - only generation logic, no side effects
 */

import type { Tables } from "@/integrations/supabase/types";

// Types exportables (découplés de Supabase)
export interface ExportablePrompt {
  title: string;
  description: string | null;
  content: string;
  version: string;
  tags: string[];
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface ExportableVariable {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  options: string[] | null;
  help: string | null;
}

export interface ExportableVersion {
  semver: string;
  content: string;
  message: string | null;
  created_at: string;
  variables: ExportableVariable[];
}

export type ExportFormat = "json" | "markdown" | "toon";

export interface ExportOptions {
  includeVersions: boolean;
}

export interface ExportData {
  prompt: ExportablePrompt;
  variables: ExportableVariable[];
  versions: ExportableVersion[];
}

// Mappers Supabase -> Exportable
export function mapPromptToExportable(prompt: Tables<"prompts">): ExportablePrompt {
  return {
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    version: prompt.version || "1.0.0",
    tags: prompt.tags || [],
    visibility: prompt.visibility || "PRIVATE",
    created_at: prompt.created_at || new Date().toISOString(),
    updated_at: prompt.updated_at || new Date().toISOString(),
  };
}

export function mapVariablesToExportable(variables: Tables<"variables">[]): ExportableVariable[] {
  return variables.map((v) => ({
    name: v.name,
    type: v.type || "STRING",
    required: v.required || false,
    defaultValue: v.default_value,
    options: v.options,
    help: v.help,
  }));
}

export function mapVersionsToExportable(versions: Tables<"versions">[]): ExportableVersion[] {
  return versions.map((v) => ({
    semver: v.semver,
    content: v.content,
    message: v.message,
    created_at: v.created_at || new Date().toISOString(),
    variables: Array.isArray(v.variables) 
      ? (v.variables as unknown as ExportableVariable[])
      : [],
  }));
}

// ============ GENERATION FUNCTIONS ============

/**
 * Point d'entrée unique pour la génération d'export
 */
export function generateExport(
  data: ExportData,
  format: ExportFormat,
  options: ExportOptions
): string {
  const { prompt, variables, versions } = data;
  const versionData = options.includeVersions ? versions : [];

  switch (format) {
    case "json":
      return generateJSON(prompt, variables, versionData);
    case "markdown":
      return generateMarkdown(prompt, variables, versionData);
    case "toon":
      return generateTOON(prompt, variables, versionData);
    default:
      throw new Error(`Format non supporté: ${format}`);
  }
}

/**
 * Génère l'export au format JSON
 */
export function generateJSON(
  prompt: ExportablePrompt,
  variables: ExportableVariable[],
  versions: ExportableVersion[]
): string {
  const data = {
    meta: {
      title: prompt.title,
      description: prompt.description,
      version: prompt.version,
      tags: prompt.tags,
      visibility: prompt.visibility,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
    },
    content: prompt.content,
    variables: variables.map((v) => ({
      name: v.name,
      type: v.type,
      required: v.required,
      defaultValue: v.defaultValue,
      options: v.options,
      help: v.help,
    })),
    ...(versions.length > 0 && {
      versions: versions.map((v) => ({
        semver: v.semver,
        message: v.message,
        created_at: v.created_at,
        content: v.content,
        variables: v.variables,
      })),
    }),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Génère l'export au format Markdown avec gestion des fences
 */
export function generateMarkdown(
  prompt: ExportablePrompt,
  variables: ExportableVariable[],
  versions: ExportableVersion[]
): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`# ${prompt.title}`);
  lines.push("");
  lines.push(`**Version:** ${prompt.version}`);
  if (prompt.tags.length > 0) {
    lines.push(`**Tags:** ${prompt.tags.join(", ")}`);
  }
  lines.push(`**Visibilité:** ${prompt.visibility}`);
  lines.push(`**Créé le:** ${formatDate(prompt.created_at)}`);
  lines.push(`**Modifié le:** ${formatDate(prompt.updated_at)}`);
  lines.push("");

  // Description
  if (prompt.description) {
    lines.push("## Description");
    lines.push("");
    lines.push(prompt.description);
    lines.push("");
  }

  // Content avec échappement des fences
  lines.push("## Contenu");
  lines.push("");
  const { fence, content } = escapeMarkdownFences(prompt.content);
  lines.push(fence);
  lines.push(content);
  lines.push(fence);
  lines.push("");

  // Variables
  if (variables.length > 0) {
    lines.push("## Variables");
    lines.push("");
    lines.push("| Nom | Type | Requis | Défaut | Description |");
    lines.push("|-----|------|--------|--------|-------------|");
    for (const v of variables) {
      const req = v.required ? "✅" : "-";
      const def = v.defaultValue || "-";
      const help = v.help || "-";
      lines.push(`| ${v.name} | ${v.type} | ${req} | ${def} | ${help} |`);
    }
    lines.push("");
  }

  // Version history
  if (versions.length > 0) {
    lines.push("## Historique des versions");
    lines.push("");
    for (const v of versions) {
      const msg = v.message || "Pas de message";
      lines.push(`- **${v.semver}** (${formatDate(v.created_at)}): ${msg}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Génère l'export au format TOON (Token-Oriented Object Notation)
 * Format compact optimisé pour les LLM
 * @see https://openapi.fr/blog/quest-ce-que-le-format-toon-token-oriented-object-notation
 */
export function generateTOON(
  prompt: ExportablePrompt,
  variables: ExportableVariable[],
  versions: ExportableVersion[]
): string {
  const lines: string[] = [];

  // Meta section
  lines.push("meta:");
  lines.push(`  title: ${prompt.title}`);
  if (prompt.description) {
    lines.push(`  description: ${prompt.description}`);
  }
  lines.push(`  version: ${prompt.version}`);
  if (prompt.tags.length > 0) {
    lines.push(`  tags[${prompt.tags.length}]: ${prompt.tags.join(",")}`);
  }
  lines.push(`  visibility: ${prompt.visibility}`);
  lines.push(`  created_at: ${prompt.created_at}`);
  lines.push(`  updated_at: ${prompt.updated_at}`);

  // Content - multiline avec indentation
  lines.push("content: |");
  const contentLines = prompt.content.split("\n");
  for (const line of contentLines) {
    lines.push(`  ${line}`);
  }

  // Variables en format tabulaire TOON
  if (variables.length > 0) {
    lines.push(`variables[${variables.length}]{name,type,required,defaultValue,help}:`);
    for (const v of variables) {
      const parts = [
        v.name,
        v.type,
        String(v.required),
        v.defaultValue || "",
        v.help || "",
      ];
      lines.push(`  ${parts.join(",")}`);
    }
  }

  // Versions en format tabulaire TOON
  if (versions.length > 0) {
    lines.push(`versions[${versions.length}]{semver,message,created_at}:`);
    for (const v of versions) {
      const parts = [
        v.semver,
        v.message || "",
        v.created_at,
      ];
      lines.push(`  ${parts.join(",")}`);
    }
  }

  return lines.join("\n");
}

// ============ UTILITIES ============

/**
 * Échappe les fences markdown dans le contenu
 * Retourne une fence plus longue si nécessaire
 */
export function escapeMarkdownFences(content: string): { fence: string; content: string } {
  const fenceMatches = content.match(/`{3,}/g);
  
  if (!fenceMatches) {
    return { fence: "```", content };
  }
  
  const maxTicks = Math.max(...fenceMatches.map((f) => f.length));
  return { 
    fence: "`".repeat(maxTicks + 1), 
    content 
  };
}

/**
 * Formate une date ISO en format lisible
 */
function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

/**
 * Génère le nom de fichier pour l'export
 */
export function getExportFilename(title: string, format: ExportFormat): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  
  const extensions: Record<ExportFormat, string> = {
    json: "json",
    markdown: "md",
    toon: "toon",
  };
  
  return `${sanitized}.${extensions[format]}`;
}

/**
 * Retourne le type MIME pour le format
 */
export function getExportMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    json: "application/json",
    markdown: "text/markdown",
    toon: "text/plain",
  };
  
  return mimeTypes[format];
}

/**
 * Télécharge le contenu en tant que fichier
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
