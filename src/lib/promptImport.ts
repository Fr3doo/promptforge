/**
 * Pure functions for prompt import parsing
 * SOLID: Single responsibility - only parsing logic, no side effects
 * 
 * Mirrors promptExport.ts structure for consistency (KISS/DRY)
 */
// Variable detection regex (matches {{variable_name}})
const VARIABLE_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;

// ============ TYPES ============

export type ImportFormat = "json" | "markdown" | "paste";

export interface ImportablePrompt {
  title: string;
  description: string | null;
  content: string;
  version?: string;
  tags?: string[];
  visibility?: "PRIVATE" | "SHARED";
}

export interface ImportableVariable {
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  options?: string[] | null;
  help?: string | null;
}

export interface ImportResult {
  prompt: ImportablePrompt;
  variables: ImportableVariable[];
  format: ImportFormat;
}

export interface ParseError {
  code: "INVALID_JSON" | "MISSING_REQUIRED_FIELD" | "INVALID_FORMAT" | "EMPTY_CONTENT";
  message: string;
  field?: string;
}

export type ParseResult = 
  | { success: true; data: ImportResult }
  | { success: false; error: ParseError };

// ============ FORMAT DETECTION ============

/**
 * Detects the format of the input content
 */
export function detectFormat(content: string): ImportFormat {
  const trimmed = content.trim();
  
  // Check for JSON (starts with { or [)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // Not valid JSON, continue to other checks
    }
  }
  
  // Check for Markdown (starts with # heading)
  if (/^#\s+.+/m.test(trimmed)) {
    return "markdown";
  }
  
  // Default to paste (plain text)
  return "paste";
}

// ============ VARIABLE DETECTION ============

/**
 * Extracts variable names from content using {{variable}} syntax
 * Uses the same pattern as the rest of the app (DRY)
 */
export function detectVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_REGEX);
  if (!matches) return [];
  
  // Extract unique variable names from capture groups
  const names = new Set<string>();
  for (const match of matches) {
    const name = match[1]?.trim();
    if (name) {
      names.add(name);
    }
  }
  
  return Array.from(names);
}

/**
 * Converts detected variable names to ImportableVariable objects
 */
export function variableNamesToImportable(names: string[]): ImportableVariable[] {
  return names.map((name, index) => ({
    name,
    type: "STRING",
    required: false,
    defaultValue: null,
    options: null,
    help: null,
    order_index: index,
  }));
}

// ============ JSON PARSING ============

interface JSONPromptData {
  meta?: {
    title?: string;
    description?: string | null;
    version?: string;
    tags?: string[];
    visibility?: string;
  };
  title?: string;
  description?: string | null;
  content?: string;
  version?: string;
  tags?: string[];
  visibility?: string;
  variables?: Array<{
    name: string;
    type?: string;
    required?: boolean;
    defaultValue?: string | null;
    options?: string[] | null;
    help?: string | null;
  }>;
}

/**
 * Parses JSON format (exported from PromptForge or compatible)
 */
export function parseJSON(content: string): ParseResult {
  let data: JSONPromptData;
  
  try {
    data = JSON.parse(content.trim());
  } catch {
    return {
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Le contenu n'est pas un JSON valide",
      },
    };
  }
  
  // Support both flat and meta-wrapped formats
  const meta = data.meta || data;
  const title = meta.title || data.title;
  const promptContent = data.content;
  
  if (!title) {
    return {
      success: false,
      error: {
        code: "MISSING_REQUIRED_FIELD",
        message: "Le champ 'title' est requis",
        field: "title",
      },
    };
  }
  
  if (!promptContent) {
    return {
      success: false,
      error: {
        code: "MISSING_REQUIRED_FIELD",
        message: "Le champ 'content' est requis",
        field: "content",
      },
    };
  }
  
  // Parse variables from JSON or detect from content
  let variables: ImportableVariable[] = [];
  
  if (data.variables && Array.isArray(data.variables)) {
    variables = data.variables.map((v) => ({
      name: v.name,
      type: v.type || "STRING",
      required: v.required ?? false,
      defaultValue: v.defaultValue ?? null,
      options: v.options ?? null,
      help: v.help ?? null,
    }));
  } else {
    // Auto-detect variables from content
    const detectedNames = detectVariables(promptContent);
    variables = variableNamesToImportable(detectedNames);
  }
  
  return {
    success: true,
    data: {
      prompt: {
        title,
        description: meta.description ?? data.description ?? null,
        content: promptContent,
        version: meta.version ?? data.version ?? "1.0.0",
        tags: meta.tags ?? data.tags ?? [],
        visibility: (meta.visibility ?? data.visibility) === "SHARED" ? "SHARED" : "PRIVATE",
      },
      variables,
      format: "json",
    },
  };
}

// ============ MARKDOWN PARSING ============

/**
 * Parses Markdown format (exported from PromptForge or compatible)
 */
export function parseMarkdown(content: string): ParseResult {
  const lines = content.trim().split("\n");
  
  // Extract title from first # heading
  const titleMatch = lines[0]?.match(/^#\s+(.+)$/);
  if (!titleMatch) {
    return {
      success: false,
      error: {
        code: "INVALID_FORMAT",
        message: "Le Markdown doit commencer par un titre (# Titre)",
      },
    };
  }
  
  const title = titleMatch[1].trim();
  let description: string | null = null;
  let promptContent = "";
  let version = "1.0.0";
  const tags: string[] = [];
  
  // Parse metadata from **Key:** value lines
  let inDescriptionSection = false;
  let inContentSection = false;
  let inCodeBlock = false;
  const contentLines: string[] = [];
  const descriptionLines: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for section headers
    if (line.startsWith("## Description")) {
      inDescriptionSection = true;
      inContentSection = false;
      continue;
    }
    
    if (line.startsWith("## Contenu") || line.startsWith("## Content")) {
      inDescriptionSection = false;
      inContentSection = true;
      continue;
    }
    
    if (line.startsWith("## Variables") || line.startsWith("## Historique") || line.startsWith("## Version")) {
      inDescriptionSection = false;
      inContentSection = false;
      continue;
    }
    
    // Parse metadata lines
    if (!inDescriptionSection && !inContentSection) {
      const versionMatch = line.match(/^\*\*Version:\*\*\s*(.+)$/);
      if (versionMatch) {
        version = versionMatch[1].trim();
        continue;
      }
      
      const tagsMatch = line.match(/^\*\*Tags:\*\*\s*(.+)$/);
      if (tagsMatch) {
        tags.push(...tagsMatch[1].split(",").map((t) => t.trim()).filter(Boolean));
        continue;
      }
    }
    
    // Collect description
    if (inDescriptionSection) {
      descriptionLines.push(line);
      continue;
    }
    
    // Collect content (handle code blocks)
    if (inContentSection) {
      if (line.match(/^`{3,}/)) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && contentLines.length > 0) {
          // End of code block, we have the content
          continue;
        }
        continue;
      }
      
      if (inCodeBlock) {
        contentLines.push(line);
      }
    }
  }
  
  // Build description
  description = descriptionLines.join("\n").trim() || null;
  
  // Build content
  promptContent = contentLines.join("\n").trim();
  
  // If no explicit content section, use everything after metadata as content
  if (!promptContent) {
    // Fallback: use description as content if no content section found
    if (description) {
      promptContent = description;
      description = null;
    } else {
      return {
        success: false,
        error: {
          code: "MISSING_REQUIRED_FIELD",
          message: "Aucun contenu trouvé dans le Markdown",
          field: "content",
        },
      };
    }
  }
  
  // Detect variables from content
  const detectedNames = detectVariables(promptContent);
  const variables = variableNamesToImportable(detectedNames);
  
  return {
    success: true,
    data: {
      prompt: {
        title,
        description,
        content: promptContent,
        version,
        tags,
        visibility: "PRIVATE",
      },
      variables,
      format: "markdown",
    },
  };
}

// ============ PASTE PARSING ============

/**
 * Parses pasted plain text
 * Creates a prompt with auto-generated title from first line
 */
export function parsePaste(content: string): ParseResult {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return {
      success: false,
      error: {
        code: "EMPTY_CONTENT",
        message: "Le contenu ne peut pas être vide",
      },
    };
  }
  
  // Generate title from first line (truncated)
  const firstLine = trimmed.split("\n")[0].slice(0, 50).trim();
  const title = firstLine || "Prompt importé";
  
  // Use full content as prompt content
  const promptContent = trimmed;
  
  // Detect variables
  const detectedNames = detectVariables(promptContent);
  const variables = variableNamesToImportable(detectedNames);
  
  return {
    success: true,
    data: {
      prompt: {
        title: title.length > 50 ? `${title.slice(0, 47)}...` : title,
        description: null,
        content: promptContent,
        version: "1.0.0",
        tags: [],
        visibility: "PRIVATE",
      },
      variables,
      format: "paste",
    },
  };
}

// ============ MAIN PARSE FUNCTION ============

/**
 * Main entry point for parsing content
 * Auto-detects format and parses accordingly
 */
export function parseImportContent(content: string): ParseResult {
  if (!content || !content.trim()) {
    return {
      success: false,
      error: {
        code: "EMPTY_CONTENT",
        message: "Le contenu ne peut pas être vide",
      },
    };
  }
  
  const format = detectFormat(content);
  
  switch (format) {
    case "json":
      return parseJSON(content);
    case "markdown":
      return parseMarkdown(content);
    case "paste":
      return parsePaste(content);
    default:
      return parsePaste(content);
  }
}

// ============ FILE UTILITIES ============

/**
 * Reads a file and returns its content
 */
export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsText(file);
  });
}

/**
 * Validates that a file has an accepted extension
 */
export function isAcceptedFileType(file: File): boolean {
  const acceptedExtensions = [".json", ".md", ".markdown", ".txt"];
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return acceptedExtensions.includes(extension);
}

/**
 * Gets the accepted file types for the file input
 */
export const ACCEPTED_FILE_TYPES = ".json,.md,.markdown,.txt";
