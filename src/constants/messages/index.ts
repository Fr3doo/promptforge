/**
 * Messages - Main Entry Point
 * Assembles all domain-specific message modules
 * 
 * IMPORTANT: Always import from this file, never from sub-modules directly
 * Usage: import { messages } from "@/constants/messages";
 * 
 * TEMPORARY: Re-exporting from old messages.ts until migration is complete
 */

// Temporary re-export from old monolithic file
// Will be replaced step-by-step with modular imports
export { messages } from '../messages';
export type { MessageKey } from '../messages';
