/**
 * Messages - Main Entry Point
 * Assembles all domain-specific message modules
 * 
 * IMPORTANT: Always import from this file, never from sub-modules directly
 * Usage: import { messages } from "@/constants/messages";
 */

import { commonMessages } from './common';
// Import temporaire de l'ancien fichier pour les messages non encore migrés
import { messages as oldMessages } from '../messages';

// Assemblage progressif : common.ts + reste de messages.ts
export const messages = {
  // Messages from common.ts
  labels: commonMessages.labels,
  placeholders: commonMessages.placeholders,
  dialogs: commonMessages.dialogs,
  buttons: commonMessages.buttons,
  permissions: commonMessages.permissions,
  
  // Fusion manuelle des erreurs (common + reste à migrer)
  errors: {
    ...commonMessages.errors,           // generic, validation, network, database
    ...oldMessages.errors,               // analysis, save, update, delete, etc. (from old file)
  },
  
  // Le reste vient encore de l'ancien messages.ts (à migrer dans les prochaines étapes)
  versions: oldMessages.versions,
  shareBanner: oldMessages.shareBanner,
  sharedWith: oldMessages.sharedWith,
  success: oldMessages.success,
  info: oldMessages.info,
  loading: oldMessages.loading,
  actions: oldMessages.actions,
  copy: oldMessages.copy,
  system: oldMessages.system,
  analysis: oldMessages.analysis,
  prompts: oldMessages.prompts,
  auth: oldMessages.auth,
  navigation: oldMessages.navigation,
  dashboard: oldMessages.dashboard,
  settings: oldMessages.settings,
  editor: oldMessages.editor,
  analyzer: oldMessages.analyzer,
  variables: oldMessages.variables,
  promptActions: oldMessages.promptActions,
  promptList: oldMessages.promptList,
  conflict: oldMessages.conflict,
  marketing: oldMessages.marketing,
  ui: oldMessages.ui,
  tooltips: oldMessages.tooltips,
  help: oldMessages.help,
} as const;

export type MessageKey = typeof messages;
