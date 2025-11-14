/**
 * Messages - Main Entry Point
 * Assembles all domain-specific message modules
 * 
 * IMPORTANT: Always import from this file, never from sub-modules directly
 * Usage: import { messages } from "@/constants/messages";
 */

import { commonMessages } from './common';
import { promptsMessages } from './prompts';
// Import temporaire de l'ancien fichier pour les messages non encore migrés
import { messages as oldMessages } from '../messages';

// Assemblage progressif : common.ts + prompts.ts + reste de messages.ts
export const messages = {
  // Messages from common.ts
  labels: commonMessages.labels,
  placeholders: commonMessages.placeholders,
  dialogs: commonMessages.dialogs,
  buttons: commonMessages.buttons,
  permissions: commonMessages.permissions,
  
  // Messages from prompts.ts
  prompts: promptsMessages.prompts,
  promptActions: promptsMessages.promptActions,
  promptList: promptsMessages.promptList,
  shareBanner: promptsMessages.shareBanner,
  sharedWith: promptsMessages.sharedWith,
  conflict: promptsMessages.conflict,
  
  // Fusion manuelle des erreurs (common + reste à migrer)
  errors: {
    ...commonMessages.errors,           // generic, validation, network, database
    ...oldMessages.errors,               // analysis, save, update, delete, etc. (from old file)
  },
  
  // Fusion manuelle des tooltips (prompts + reste à migrer)
  tooltips: {
    prompts: promptsMessages.tooltips.prompts,
    ...oldMessages.tooltips,
  },
  
  // Fusion manuelle des help (prompts + reste à migrer)
  help: {
    prompts: promptsMessages.help.prompts,
    ...oldMessages.help,
  },
  
  // Le reste vient encore de l'ancien messages.ts (à migrer dans les prochaines étapes)
  versions: oldMessages.versions,
  success: oldMessages.success,
  info: oldMessages.info,
  loading: oldMessages.loading,
  actions: oldMessages.actions,
  copy: oldMessages.copy,
  system: oldMessages.system,
  analysis: oldMessages.analysis,
  auth: oldMessages.auth,
  navigation: oldMessages.navigation,
  dashboard: oldMessages.dashboard,
  settings: oldMessages.settings,
  editor: oldMessages.editor,
  analyzer: oldMessages.analyzer,
  variables: oldMessages.variables,
  marketing: oldMessages.marketing,
  ui: oldMessages.ui,
} as const;

export type MessageKey = typeof messages;
