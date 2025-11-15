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
 * MIGRATION STATUS - TEMPORARY IMPORT
 * ====================================
 * 
 * Import temporaire de l'ancien fichier messages.ts pour les sections non encore migrées.
 * 
 * SECTIONS ENCORE UTILISÉES DE oldMessages (~450 lignes) :
 * - errors.* (~150 lignes) : Messages d'erreur spécifiques (save, update, delete, duplicate, etc.)
 * - tooltips.* (~200 lignes) : Tooltips non migrés (analyzer, share, etc.)
 * - help.* (~100 lignes) : Messages d'aide inline non migrés
 * 
 * MIGRATION FUTURE (Étape 10) :
 * Ces sections seront progressivement migrées vers :
 * - errors.save/update/delete → prompts.ts ou hook dédié
 * - errors.versions → versions.ts
 * - tooltips.analyzer → ui.ts
 * - tooltips.share → prompts.ts
 * - help.versions → versions.ts
 * 
 * TODO: Une fois la migration complète, supprimer cet import et le fichier messages.ts
 */
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
  
  /**
   * ERRORS - Fusion progressive (PARTIELLEMENT MIGRÉ)
   * ==================================================
   * 
   * Structure actuelle :
   * - ✅ commonMessages.errors : Erreurs génériques (generic, validation, network, database)
   * - ✅ authMessages.errors.auth : Erreurs d'authentification (signOutFailed)
   * - ⏳ oldMessages.errors : Erreurs spécifiques NON MIGRÉES (~150 lignes)
   *   - errors.analysis.* : Erreurs d'analyse de prompt
   *   - errors.save.* : Erreurs de sauvegarde de prompt
   *   - errors.update.* : Erreurs de mise à jour de prompt
   *   - errors.delete.* : Erreurs de suppression de prompt
   *   - errors.duplicate.* : Erreurs de duplication de prompt
   *   - errors.variables.* : Erreurs de variables
   *   - errors.versions.* : Erreurs de versions
   * 
   * TODO (Étape 10) :
   * - Migrer errors.save/update/delete/duplicate → prompts.ts ou usePromptMessages
   * - Migrer errors.versions → versions.ts
   * - Migrer errors.variables → variables.ts (si manquant)
   */
  errors: {
    ...commonMessages.errors,           // ✅ generic, validation, network, database
    auth: authMessages.errors.auth,     // ✅ auth errors (signOutFailed)
    ...oldMessages.errors,               // ⏳ analysis, save, update, delete, etc. (À MIGRER)
  },
  
  /**
   * TOOLTIPS - Fusion progressive (PARTIELLEMENT MIGRÉ)
   * ====================================================
   * 
   * Structure actuelle :
   * - ✅ promptsMessages.tooltips.prompts : Tooltips des prompts
   * - ✅ variablesMessages.tooltips.variables : Tooltips des variables
   * - ✅ versionsMessages.tooltips.versions : Tooltips des versions
   * - ⏳ oldMessages.tooltips : Tooltips NON MIGRÉS (~200 lignes)
   *   - tooltips.analyzer.* : Tooltips de l'analyseur
   *   - tooltips.share.* : Tooltips du partage
   *   - tooltips.* : Autres tooltips génériques
   * 
   * TODO (Étape 10) :
   * - Migrer tooltips.analyzer → ui.ts
   * - Migrer tooltips.share → prompts.ts
   */
  tooltips: {
    prompts: promptsMessages.tooltips.prompts,     // ✅ Migrés
    variables: variablesMessages.tooltips.variables, // ✅ Migrés
    versions: versionsMessages.tooltips.versions,   // ✅ Migrés
    ...oldMessages.tooltips,                        // ⏳ analyzer, share, etc. (À MIGRER)
  },
  
  /**
   * HELP - Fusion progressive (PARTIELLEMENT MIGRÉ)
   * ================================================
   * 
   * Structure actuelle :
   * - ✅ promptsMessages.help.prompts : Aide inline des prompts
   * - ✅ variablesMessages.help.variables : Aide inline des variables
   * - ⏳ oldMessages.help : Messages d'aide NON MIGRÉS (~100 lignes)
   *   - help.versions.* : Aide inline des versions
   *   - help.* : Autres messages d'aide
   * 
   * TODO (Étape 10) :
   * - Migrer help.versions → versions.ts
   */
  help: {
    prompts: promptsMessages.help.prompts,       // ✅ Migrés
    variables: variablesMessages.help.variables, // ✅ Migrés
    ...oldMessages.help,                         // ⏳ versions, etc. (À MIGRER)
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
  success: systemMessages.success,
  info: systemMessages.info,
  loading: systemMessages.loading,
  actions: systemMessages.actions,
  copy: systemMessages.copy,
  system: systemMessages.system,
  analysis: systemMessages.analysis,
  
  // Le reste vient encore de l'ancien messages.ts
  versions: versionsMessages.versions,
  auth: authMessages.auth,
} as const;

export type MessageKey = typeof messages;
