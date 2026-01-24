import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Configuration du système de récupération de session
 */
const SESSION_RECOVERY_CONFIG = {
  /** Nombre d'erreurs 401 consécutives avant d'afficher l'alerte */
  ERROR_THRESHOLD: 3,
  /** Délai en ms pour reset le compteur d'erreurs */
  RESET_DELAY_MS: 30_000,
  /** Clé localStorage pour tracker les erreurs cross-tabs */
  STORAGE_KEY: "session_recovery_errors",
} as const;

/**
 * Hook de détection et récupération de sessions corrompues
 * 
 * Une session est considérée corrompue si :
 * - L'utilisateur est authentifié (user !== null)
 * - Mais les appels API retournent 401 répétés
 * 
 * Ce hook :
 * 1. Écoute les erreurs 401 via window event
 * 2. Après N erreurs consécutives, propose de nettoyer la session
 * 3. Réinitialise le compteur après un délai sans erreur
 * 
 * @example
 * ```tsx
 * // Dans App.tsx ou un provider racine
 * function App() {
 *   useSessionRecovery();
 *   return <Routes />;
 * }
 * ```
 */
export function useSessionRecovery() {
  const { user, loading } = useAuth();
  const errorCountRef = useRef(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownToastRef = useRef(false);

  /**
   * Nettoie le stockage local des données Supabase corrompues
   */
  const cleanupCorruptedSession = useCallback(() => {
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        key => key.startsWith('sb-') || key.includes('supabase')
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();
      
      console.log("[SessionRecovery] Cleaned up", keysToRemove.length, "storage keys");
      
      // Reload pour forcer une nouvelle authentification
      window.location.href = "/auth";
    } catch (error) {
      console.error("[SessionRecovery] Cleanup failed:", error);
      // Fallback: redirection simple
      window.location.href = "/auth";
    }
  }, []);

  /**
   * Gère un événement d'erreur 401
   */
  const handleAuthError = useCallback(() => {
    // Ignorer si pas d'utilisateur authentifié (erreur attendue)
    if (!user || loading) return;

    errorCountRef.current += 1;
    
    console.log(
      `[SessionRecovery] Auth error detected (${errorCountRef.current}/${SESSION_RECOVERY_CONFIG.ERROR_THRESHOLD})`
    );

    // Reset le timer à chaque erreur
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = setTimeout(() => {
      errorCountRef.current = 0;
      hasShownToastRef.current = false;
    }, SESSION_RECOVERY_CONFIG.RESET_DELAY_MS);

    // Afficher le toast de récupération après le seuil
    if (
      errorCountRef.current >= SESSION_RECOVERY_CONFIG.ERROR_THRESHOLD &&
      !hasShownToastRef.current
    ) {
      hasShownToastRef.current = true;
      
      toast.error("Session expirée ou corrompue", {
        description: "Cliquez pour vous reconnecter",
        duration: 10000,
        action: {
          label: "Reconnecter",
          onClick: cleanupCorruptedSession,
        },
      });
    }
  }, [user, loading, cleanupCorruptedSession]);

  useEffect(() => {
    // Écouter les événements d'erreur 401 personnalisés
    const handleEvent = (event: CustomEvent) => {
      if (event.detail?.status === 401) {
        handleAuthError();
      }
    };

    window.addEventListener("auth-error" as keyof WindowEventMap, handleEvent as EventListener);

    return () => {
      window.removeEventListener("auth-error" as keyof WindowEventMap, handleEvent as EventListener);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [handleAuthError]);

  return {
    /** Force le nettoyage de la session (pour usage externe) */
    forceCleanup: cleanupCorruptedSession,
  };
}

/**
 * Utilitaire pour dispatcher un événement d'erreur d'auth
 * À appeler depuis les repositories/hooks qui détectent des 401
 */
export function dispatchAuthError(status: number) {
  if (status === 401) {
    window.dispatchEvent(
      new CustomEvent("auth-error", { detail: { status } })
    );
  }
}
