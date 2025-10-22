import { useEffect, useCallback } from "react";

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

const DEFAULT_MESSAGE = "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?";

/**
 * Hook pour avertir l'utilisateur avant de quitter la page avec des modifications non enregistrées
 * Gère à la fois la fermeture du navigateur et la navigation interne via confirmation
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  message = DEFAULT_MESSAGE,
}: UseUnsavedChangesWarningOptions) {
  
  // Gérer la fermeture du navigateur / refresh
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      // Les navigateurs modernes ignorent le message personnalisé et affichent leur propre message
      e.returnValue = message;
      return message;
    }
  }, [hasUnsavedChanges, message]);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  // Pour la navigation interne : retourner une fonction de confirmation
  const confirmNavigation = useCallback((callback: () => void) => {
    if (hasUnsavedChanges) {
      if (window.confirm(message)) {
        callback();
      }
    } else {
      callback();
    }
  }, [hasUnsavedChanges, message]);

  return {
    hasUnsavedChanges,
    shouldBlockNavigation: hasUnsavedChanges,
    confirmNavigation,
  };
}
