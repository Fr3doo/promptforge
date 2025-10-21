import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  logInfo,
  logWarn,
  logError,
  logDebug,
  captureException,
  configureLogger,
  resetLoggerConfig,
  getLoggerConfig,
} from "../logger";

describe("Logger", () => {
  // Sauvegarder les méthodes console originales
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    // Mock des méthodes console
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Réinitialiser la configuration
    resetLoggerConfig();
    
    // Activer la console pour les tests
    configureLogger({ useConsole: true, useExternalService: false });
  });

  afterEach(() => {
    // Restaurer les méthodes console
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe("logInfo", () => {
    it("journalise un message d'information", async () => {
      await logInfo("Test message");

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] Test message")
      );
    });

    it("journalise avec contexte", async () => {
      await logInfo("User action", { userId: "123", action: "login" });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO] User action")
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"userId":"123"')
      );
    });
  });

  describe("logWarn", () => {
    it("journalise un avertissement", async () => {
      await logWarn("Warning message");

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Warning message")
      );
    });

    it("journalise avec contexte", async () => {
      await logWarn("Rate limit warning", { remaining: 10 });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("[WARN] Rate limit warning")
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('"remaining":10')
      );
    });
  });

  describe("logError", () => {
    it("journalise une erreur", async () => {
      await logError("Error message");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Error message")
      );
    });

    it("journalise avec contexte", async () => {
      await logError("Database error", { table: "prompts", operation: "insert" });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Database error")
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"table":"prompts"')
      );
    });
  });

  describe("logDebug", () => {
    it("journalise un message de debug", async () => {
      await logDebug("Debug message");

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG] Debug message")
      );
    });

    it("n'affiche pas les messages debug si niveau minimum est info", async () => {
      configureLogger({ minLevel: "info" });
      await logDebug("Debug message");

      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe("captureException", () => {
    it("capture une exception avec message", async () => {
      const error = new Error("Test error");
      await captureException(error, "Operation failed");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Operation failed")
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"error":"Test error"')
      );
    });

    it("capture une exception sans message personnalisé", async () => {
      const error = new Error("Test error");
      await captureException(error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR] Unhandled exception")
      );
    });

    it("capture une exception avec contexte", async () => {
      const error = new Error("Test error");
      await captureException(error, "Failed", { operation: "save" });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"save"')
      );
    });

    it("gère les erreurs non-Error", async () => {
      await captureException("String error", "Failed");

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"error":"String error"')
      );
    });

    it("inclut la stack trace", async () => {
      const error = new Error("Test error");
      await captureException(error);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"stack"')
      );
    });
  });

  describe("Configuration", () => {
    it("permet de désactiver le logger", async () => {
      configureLogger({ enabled: false });
      await logInfo("Test");

      expect(console.info).not.toHaveBeenCalled();
    });

    it("permet de désactiver la console", async () => {
      configureLogger({ useConsole: false });
      await logInfo("Test");

      expect(console.info).not.toHaveBeenCalled();
    });

    it("permet de changer le niveau minimum", async () => {
      configureLogger({ minLevel: "error" });
      
      await logInfo("Info");
      await logWarn("Warn");
      await logError("Error");

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it("réinitialise la configuration", () => {
      configureLogger({ enabled: false, minLevel: "error" });
      resetLoggerConfig();

      const config = getLoggerConfig();
      expect(config.enabled).toBe(true);
    });

    it("retourne la configuration actuelle", () => {
      configureLogger({ minLevel: "warn" });
      const config = getLoggerConfig();

      expect(config.minLevel).toBe("warn");
    });
  });

  describe("Niveaux de log hiérarchiques", () => {
    it("respecte la hiérarchie des niveaux", async () => {
      configureLogger({ minLevel: "warn" });

      await logDebug("Debug");
      await logInfo("Info");
      await logWarn("Warn");
      await logError("Error");

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("Format des messages", () => {
    it("inclut un timestamp ISO", async () => {
      await logInfo("Test");

      const call = (console.info as any).mock.calls[0][0];
      expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it("inclut le niveau de log", async () => {
      await logInfo("Test");
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });

    it("formate correctement le contexte JSON", async () => {
      await logInfo("Test", { key: "value", nested: { data: 123 } });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"key":"value"')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"nested":{"data":123}')
      );
    });
  });

  describe("Service externe", () => {
    beforeEach(() => {
      // Mock de fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response)
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("n'envoie pas au service externe si désactivé", async () => {
      configureLogger({ 
        useExternalService: false,
        externalServiceUrl: "https://example.com/logs"
      });
      
      await logInfo("Test");

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("envoie au service externe si activé et URL configurée", async () => {
      configureLogger({ 
        useExternalService: true,
        externalServiceUrl: "https://example.com/logs"
      });
      
      await logInfo("Test", { key: "value" });

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/logs",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("gère les erreurs du service externe gracieusement", async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
      
      configureLogger({ 
        useExternalService: true,
        externalServiceUrl: "https://example.com/logs"
      });
      
      // Ne devrait pas lancer d'erreur
      await expect(logInfo("Test")).resolves.not.toThrow();
      
      // Devrait utiliser console.error comme fallback
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send log to external service"),
        expect.any(Error)
      );
    });
  });
});
