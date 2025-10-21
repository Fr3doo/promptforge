/**
 * Module de journalisation centralisé
 * 
 * Fournit une abstraction unique pour la journalisation avec support
 * de différents transports selon l'environnement (console en dev, service externe en prod).
 * 
 * @module logger
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  useConsole: boolean;
  useExternalService: boolean;
  externalServiceUrl?: string;
}

/**
 * Configuration du logger basée sur l'environnement
 */
const config: LoggerConfig = {
  enabled: true,
  minLevel: import.meta.env.DEV ? "debug" : "info",
  useConsole: import.meta.env.DEV,
  useExternalService: import.meta.env.PROD,
  externalServiceUrl: import.meta.env.VITE_LOGGER_SERVICE_URL,
};

/**
 * Niveaux de log avec priorités
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Détermine si un message doit être loggé selon le niveau minimum configuré
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Formate un message de log avec contexte
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Envoie un log vers la console
 */
function logToConsole(level: LogLevel, message: string, context?: LogContext): void {
  if (!config.useConsole) return;

  const formattedMessage = formatLogMessage(level, message, context);

  switch (level) {
    case "debug":
      console.debug(formattedMessage);
      break;
    case "info":
      console.info(formattedMessage);
      break;
    case "warn":
      console.warn(formattedMessage);
      break;
    case "error":
      console.error(formattedMessage);
      break;
  }
}

/**
 * Envoie un log vers un service externe (implémentation future)
 */
async function logToExternalService(
  level: LogLevel,
  message: string,
  context?: LogContext
): Promise<void> {
  if (!config.useExternalService || !config.externalServiceUrl) return;

  try {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
      environment: import.meta.env.MODE,
    };

    // En production, on pourrait envoyer à un service comme Sentry, LogRocket, etc.
    await fetch(config.externalServiceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Fallback vers console si le service externe échoue
    console.error("Failed to send log to external service:", error);
  }
}

/**
 * Fonction interne de logging
 */
async function log(
  level: LogLevel,
  message: string,
  context?: LogContext
): Promise<void> {
  if (!shouldLog(level)) return;

  logToConsole(level, message, context);
  await logToExternalService(level, message, context);
}

/**
 * Journalise un message d'information
 * 
 * @param message - Message à journaliser
 * @param context - Contexte additionnel (optionnel)
 * 
 * @example
 * ```typescript
 * logInfo("User logged in", { userId: "123", email: "user@example.com" });
 * ```
 */
export async function logInfo(message: string, context?: LogContext): Promise<void> {
  await log("info", message, context);
}

/**
 * Journalise un avertissement
 * 
 * @param message - Message à journaliser
 * @param context - Contexte additionnel (optionnel)
 * 
 * @example
 * ```typescript
 * logWarn("API rate limit approaching", { remaining: 10, limit: 100 });
 * ```
 */
export async function logWarn(message: string, context?: LogContext): Promise<void> {
  await log("warn", message, context);
}

/**
 * Journalise une erreur
 * 
 * @param message - Message d'erreur
 * @param context - Contexte additionnel (optionnel)
 * 
 * @example
 * ```typescript
 * logError("Failed to save prompt", { promptId: "abc", error: err.message });
 * ```
 */
export async function logError(message: string, context?: LogContext): Promise<void> {
  await log("error", message, context);
}

/**
 * Journalise un message de debug (visible uniquement en développement)
 * 
 * @param message - Message de debug
 * @param context - Contexte additionnel (optionnel)
 * 
 * @example
 * ```typescript
 * logDebug("Cache hit", { key: "prompts_user_123", ttl: 300 });
 * ```
 */
export async function logDebug(message: string, context?: LogContext): Promise<void> {
  await log("debug", message, context);
}

/**
 * Capture et journalise une exception avec sa stack trace
 * 
 * @param error - Erreur capturée
 * @param message - Message descriptif (optionnel)
 * @param context - Contexte additionnel (optionnel)
 * 
 * @example
 * ```typescript
 * try {
 *   await savePrompt(data);
 * } catch (error) {
 *   captureException(error, "Failed to save prompt", { promptId: data.id });
 * }
 * ```
 */
export async function captureException(
  error: unknown,
  message?: string,
  context?: LogContext
): Promise<void> {
  const errorMessage = message || "Unhandled exception";
  const errorContext: LogContext = {
    ...context,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  await logError(errorMessage, errorContext);
}

/**
 * Configure le logger (principalement pour les tests)
 * 
 * @param newConfig - Configuration partielle à appliquer
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  Object.assign(config, newConfig);
}

/**
 * Réinitialise la configuration du logger aux valeurs par défaut
 */
export function resetLoggerConfig(): void {
  config.enabled = true;
  config.minLevel = import.meta.env.DEV ? "debug" : "info";
  config.useConsole = import.meta.env.DEV;
  config.useExternalService = import.meta.env.PROD;
}

/**
 * Récupère la configuration actuelle (pour les tests)
 */
export function getLoggerConfig(): Readonly<LoggerConfig> {
  return { ...config };
}
