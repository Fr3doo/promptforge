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
import { appMessages } from './app';
import { systemMessages } from './system';

/**
 * ✅ MIGRATION COMPLÈTE (Phase 5.11)
 * ===================================
 * 
 * Le fichier messages.ts a été supprimé et tous les commentaires obsolètes ont été nettoyés.
 * Architecture finale des modules de messages :
 * - common.ts : Messages génériques, validation, network, database
 * - prompts.ts : Messages des prompts, CRUD, partage
 * - variables.ts : Messages des variables
 * - versions.ts : Messages des versions
 * - auth.ts : Messages d'authentification
 * - ui.ts : Messages UI (composants réutilisables)
 * - app.ts : Messages App (pages de l'application)
 * - system.ts : Messages système (success, info, loading, actions, analysis)
 * 
 * Aucune référence à l'ancien messages.ts ne subsiste.
 */

// Assemblage final des modules de messages spécialisés
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
  
  /**
   * ERRORS - Migration complète (Phase 5.10 ✅)
   * ============================================
   * 
   * Structure finale :
   * - ✅ commonMessages.errors : Erreurs génériques, validation, network, database
   * - ✅ variablesMessages.errors.variables : Erreurs de variables
   * - ✅ authMessages.errors.auth : Erreurs d'authentification
   * - ✅ promptsMessages.prompts.errors : Erreurs prompts (CRUD, partage)
   */
  errors: {
    ...commonMessages.errors,
    auth: authMessages.errors.auth,
    variables: variablesMessages.errors.variables,
    save: promptsMessages.prompts.errors.save,
    update: promptsMessages.prompts.errors.update,
    delete: promptsMessages.prompts.errors.delete,
    duplicate: promptsMessages.prompts.errors.duplicate,
    share: promptsMessages.prompts.errors.share,
  },
  
  /**
   * TOOLTIPS - Migration complète (Phase 5.10 ✅)
   * ==============================================
   * 
   * Structure finale :
   * - ✅ promptsMessages.tooltips.prompts : Tooltips des prompts (base + sharing + tags)
   * - ✅ variablesMessages.tooltips.variables : Tooltips des variables
   * - ✅ versionsMessages.tooltips.versions : Tooltips des versions
   * - ✅ commonMessages.tooltips.search : Tooltips de recherche
   * - ✅ uiMessages.tooltips.analyzer : Tooltips de l'analyseur
   */
  tooltips: {
    prompts: promptsMessages.tooltips.prompts,
    variables: variablesMessages.tooltips.variables,
    versions: versionsMessages.tooltips.versions,
    search: commonMessages.tooltips.search,
    analyzer: uiMessages.tooltips.analyzer,
  },
  
  /**
   * HELP - Migration complète (Phase 5.10 ✅)
   * ==========================================
   * 
   * Structure finale :
   * - ✅ promptsMessages.help.prompts : Aide inline des prompts (base + sharing)
   * - ✅ variablesMessages.help.variables : Aide inline des variables
   * - ✅ versionsMessages.help.versions : Aide inline des versions
   */
  help: {
    prompts: promptsMessages.help.prompts,
    variables: variablesMessages.help.variables,
    versions: versionsMessages.help.versions,
  },
  
  // Messages UI (composants réutilisables)
  ui: uiMessages.ui,
  analyzer: uiMessages.analyzer,
  
  // Messages App (pages de l'application)
  navigation: appMessages.navigation,
  marketing: appMessages.marketing,
  dashboard: appMessages.dashboard,
  settings: appMessages.settings,
  editor: {
    ...appMessages.editor,
    variablesButton: variablesMessages.editor.variablesButton,
  },
  
  // Messages système (success, info, loading, actions, copy, system, analysis)
  success: {
    ...systemMessages.success,
    signedOut: authMessages.success.signedOut,
  },
  info: systemMessages.info,
  loading: systemMessages.loading,
  actions: systemMessages.actions,
  copy: systemMessages.copy,
  system: systemMessages.system,
  analysis: systemMessages.analysis,
  
  // Messages de versioning et d'authentification
  versions: versionsMessages.versions,
  auth: authMessages.auth,
} as const;

export type MessageKey = typeof messages;
