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
 * Import temporaire de l'ancien fichier messages.ts pour les messages non encore migrés.
 * 
 * MESSAGES RESTANTS DANS oldMessages (~150 lignes) :
 * - tooltips.prompts.visibility.* : Tooltips de visibilité (private, privateShared, public)
 * - tooltips.prompts.actions.save : Tooltip du bouton save
 * - success.prompts.share.* : Messages de succès du partage (7 messages)
 * - success.signedOut : Message de déconnexion réussie
 * - errors.analysis.* : Erreurs d'analyse
 * - conflict.* : Messages de conflit de version
 * - dashboard.* : Labels du dashboard (sections, stats)
 * - marketing.* : Messages marketing (hero.description, workflow.beforeAfter, tagline)
 * - navigation.* : Labels de navigation
 * - ui.* : Messages UI génériques
 * 
 * PROCHAINE ÉTAPE : Migrer ces messages vers les modules appropriés AVANT Phase 4.5
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
   *   - errors.analysis.* : Erreurs d'analyse de prompt (À MIGRER)
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
    // ⏳ Phase 4.1 ANNULÉE : oldMessages.errors encore utilisé (analysis.*)
    ...oldMessages.errors,
  },
  
  /**
   * TOOLTIPS - Migration complète (Phase 3 - Step 10.4 PARTIELLEMENT COMPLÉTÉ)
   * ===========================================================================
   * 
   * Structure actuelle :
   * - ✅ promptsMessages.tooltips.prompts : Tooltips des prompts (base)
   *   - ✅ tooltips.prompts.sharing : Tooltips du partage (Step 10.4)
   *   - ✅ tooltips.prompts.tags : Tooltips des tags (Step 10.4)
   * - ✅ variablesMessages.tooltips.variables : Tooltips des variables
   * - ✅ versionsMessages.tooltips.versions : Tooltips des versions
   * - ✅ commonMessages.tooltips.search : Tooltips de recherche (Step 10.2)
   * - ✅ uiMessages.tooltips.analyzer : Tooltips de l'analyseur (Step 10.9)
   * - ⏳ oldMessages.tooltips : Fallback temporaire (visibility.*, actions.save - À MIGRER)
   * 
   * NOTE : Reste à migrer tooltips.prompts.visibility.* et tooltips.prompts.actions.save
   */
  tooltips: {
    prompts: {
      ...promptsMessages.tooltips.prompts,
      ...oldMessages.tooltips.prompts, // ⏳ Fallback pour visibility.* et actions.save
    },
    variables: variablesMessages.tooltips.variables, // ✅ Migrés
    versions: versionsMessages.tooltips.versions,    // ✅ Migrés
    search: commonMessages.tooltips.search,          // ✅ Migrés (Step 10.2)
    analyzer: uiMessages.tooltips.analyzer,          // ✅ Migrés (Step 10.9)
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
   * 
   * NOTE : Phase 3 complète, tous les messages help sont migrés.
   */
  help: {
    prompts: promptsMessages.help.prompts,       // ✅ Migrés
    variables: variablesMessages.help.variables, // ✅ Migrés
    versions: versionsMessages.help.versions,    // ✅ Migrés (Step 10.8)
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
    ...oldMessages.success, // ⏳ Fallback pour signedOut et prompts.share.*
  },
  info: systemMessages.info,
  loading: systemMessages.loading,
  actions: systemMessages.actions,
  copy: systemMessages.copy,
  system: systemMessages.system,
  analysis: systemMessages.analysis,
  
  // Le reste vient encore de l'ancien messages.ts
  versions: versionsMessages.versions,
  auth: authMessages.auth,
  
  // ⏳ Messages NON MIGRÉS (à migrer dans Phase 4.5 pré-migration)
  conflict: oldMessages.conflict,
  dashboard: oldMessages.dashboard,
  marketing: oldMessages.marketing,
  navigation: oldMessages.navigation,
  ui: oldMessages.ui,
} as const;

export type MessageKey = typeof messages;
