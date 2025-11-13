import { common } from "./common";
import { prompts } from "./prompts";
import { variables } from "./variables";
import { auth } from "./auth";
import { ui } from "./ui";
import { app } from "./app";
import { contextual } from "./tooltips-help";

/**
 * Centralized message constants for the application
 * Structured by domain for better maintainability
 * 
 * Architecture:
 * - common: Generic labels, placeholders, buttons, system errors
 * - prompts: CRUD, sharing, visibility, conflicts, versions
 * - variables: Configuration, validation, input
 * - auth: Login, signup, logout
 * - ui: Navigation, ErrorFallback, UI components
 * - app: Dashboard, Settings, Editor, Analyzer, Versions, Analysis
 * - contextual: Tooltips, inline help
 * 
 * Usage: import { messages } from "@/constants/messages";
 */
export const messages = {
  // Common messages
  ...common,
  
  // Domain-specific messages
  prompts: prompts,
  promptList: prompts.promptList,
  promptActions: prompts.promptActions,
  dialogs: prompts.dialogs,
  conflict: prompts.conflict,
  shareBanner: prompts.shareBanner,
  sharedWith: prompts.sharedWith,
  
  variables: variables,
  
  auth: {
    ...auth,
    logout: auth.logoutButton,
  },
  
  ui: ui,
  navigation: ui.navigation,
  
  // Application pages
  ...app,
  
  // Contextual messages
  tooltips: contextual.tooltips,
  help: contextual.help,
} as const;

export type MessageKey = keyof typeof messages;
