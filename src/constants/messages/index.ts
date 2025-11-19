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
   * ERRORS - Fusion progressive (PARTIELLEMENT MIGRÉ - Phase 1, 2, 3)
   * ==================================================
   * 
   * Structure actuelle :
   * - ✅ commonMessages.errors : Erreurs génériques, validation, network (Step 10.1), database
   * - ✅ variablesMessages.errors.variables : Erreurs de variables (Step 10.6)
   * - ✅ authMessages.errors.auth : Erreurs d'authentification (signOutFailed)
   * - ✅ promptsMessages.prompts.errors : Erreurs prompts (Step 10.3 - Phase 3)
   *   - errors.save.* : Erreurs de sauvegarde de prompt
   *   - errors.update.* : Erreurs de mise à jour de prompt
   *   - errors.delete.* : Erreurs de suppression de prompt
   *   - errors.duplicate.* : Erreurs de duplication de prompt
   *   - errors.share.* : Erreurs de partage
   * - ⏳ oldMessages.errors : Erreurs NON MIGRÉES (fallback uniquement)
   *   - errors.analysis.* : Erreurs d'analyse de prompt (déjà dans system.ts)
   *   - errors.version.* : Erreurs de versions (déjà dans versions.ts)
   * 
   * NOTE : L'ordre de fusion garantit la priorité des nouveaux messages
   */
  errors: {
    ...commonMessages.errors,                      // ✅ Migrés (network, database, generic)
    auth: authMessages.errors.auth,                // ✅ Migrés
    variables: variablesMessages.errors.variables, // ✅ Migrés
    // Prompts errors (legacy compatibility - Step 10.3)
    save: promptsMessages.prompts.errors.save,
    update: promptsMessages.prompts.errors.update,
    delete: promptsMessages.prompts.errors.delete,
    duplicate: promptsMessages.prompts.errors.duplicate,
    share: promptsMessages.prompts.errors.share,
    // ✅ Phase 4.1 : oldMessages.errors supprimé (100% migré vers modules)
  },
  
  /**
   * TOOLTIPS - Migration complète (Phase 3 - Step 10.4 COMPLÉTÉ ✅)
   * ================================================================
   * 
   * Structure actuelle :
   * - ✅ promptsMessages.tooltips.prompts : Tooltips des prompts (base)
   *   - ✅ tooltips.prompts.sharing : Tooltips du partage (Step 10.4)
   *   - ✅ tooltips.prompts.tags : Tooltips des tags (Step 10.4)
   * - ✅ variablesMessages.tooltips.variables : Tooltips des variables
   * - ✅ versionsMessages.tooltips.versions : Tooltips des versions
   * - ✅ commonMessages.tooltips.search : Tooltips de recherche (Step 10.2)
   * - ✅ uiMessages.tooltips.analyzer : Tooltips de l'analyseur (Step 10.9)
   * - ⏳ oldMessages.tooltips : Fallback temporaire (duplication, à nettoyer Phase 4)
   * 
   * NOTE : Phase 3 complète, tous les tooltips sont migrés. Phase 4 supprimera oldMessages.
   */
  tooltips: {
    prompts: promptsMessages.tooltips.prompts,       // ✅ Migrés
    variables: variablesMessages.tooltips.variables, // ✅ Migrés
    versions: versionsMessages.tooltips.versions,    // ✅ Migrés
    search: commonMessages.tooltips.search,          // ✅ Migrés (Step 10.2)
    analyzer: uiMessages.tooltips.analyzer,          // ✅ Migrés (Step 10.9)
    // ✅ Phase 4.2 : oldMessages.tooltips supprimé (100% migré vers modules)
  },
  
  /**
   * HELP - Migration complète (Phase 3 - Step 10.5 COMPLÉTÉ ✅)
   * ============================================================
   * 
   * Structure actuelle :
   * - ✅ promptsMessages.help.prompts : Aide inline des prompts (base)
   *   - ✅ help.prompts.sharing : Aide du partage (Step 10.5)
   * - ✅ variablesMessages.help.variables : Aide inline des variables
   * - ✅ versionsMessages.help.versions : Aide inline des versions (Step 10.8)
   * - ⏳ oldMessages.help : Fallback temporaire (duplication, à nettoyer Phase 4)
   * 
   * NOTE : Phase 3 complète, tous les messages help sont migrés. Phase 4 supprimera oldMessages.
   */
  help: {
    prompts: promptsMessages.help.prompts,       // ✅ Migrés
    variables: variablesMessages.help.variables, // ✅ Migrés
    versions: versionsMessages.help.versions,    // ✅ Migrés (Step 10.8)
    ...oldMessages.help,                         // ⏳ autres (À MIGRER)
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
