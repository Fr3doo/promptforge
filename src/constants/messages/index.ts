/**
 * Messages - Main Entry Point
 * Assembles all domain-specific message modules
 * 
 * IMPORTANT: Always import from this file, never from sub-modules directly
 * Usage: import { messages } from "@/constants/messages";
 */

import { commonMessages } from './common';
import { promptsMessages } from './prompts';
import { variablesMessages } from './variables';
import { versionsMessages } from './versions';
import { authMessages } from './auth';
import { uiMessages } from './ui';
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
  
  // Messages from variables.ts
  variables: variablesMessages.variables,
  
  // Fusion manuelle des erreurs (common + auth + reste à migrer)
  errors: {
    ...commonMessages.errors,           // generic, validation, network, database
    auth: authMessages.errors.auth,     // auth errors (signOutFailed)
    ...oldMessages.errors,               // analysis, save, update, delete, etc. (from old file)
  },
  
  // Fusion manuelle des tooltips (prompts + variables + versions + reste à migrer)
  tooltips: {
    prompts: promptsMessages.tooltips.prompts,
    variables: variablesMessages.tooltips.variables,
    versions: versionsMessages.tooltips.versions,
    ...oldMessages.tooltips,
  },
  
  // Fusion manuelle des help (prompts + variables + reste à migrer)
  help: {
    prompts: promptsMessages.help.prompts,
    variables: variablesMessages.help.variables,
    ...oldMessages.help,
  },
  
  // Messages UI (composants réutilisables)
  ui: uiMessages.ui,
  analyzer: uiMessages.analyzer,
  
  // Le reste vient encore de l'ancien messages.ts (à migrer dans les prochaines étapes)
  versions: versionsMessages.versions,
  auth: authMessages.auth,
  success: oldMessages.success,
  info: oldMessages.info,
  loading: oldMessages.loading,
  actions: oldMessages.actions,
  copy: oldMessages.copy,
  system: oldMessages.system,
  analysis: oldMessages.analysis,
  navigation: oldMessages.navigation,     // → Sera migré dans app.ts (étape 8)
  dashboard: oldMessages.dashboard,       // → Sera migré dans app.ts (étape 8)
  settings: oldMessages.settings,         // → Sera migré dans app.ts (étape 8)
  editor: {
    ...oldMessages.editor,
    variablesButton: variablesMessages.editor.variablesButton,
  },
  marketing: oldMessages.marketing,       // → Sera migré dans app.ts (étape 8)
} as const;

export type MessageKey = typeof messages;
