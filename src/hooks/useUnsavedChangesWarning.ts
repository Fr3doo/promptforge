import { useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

const DEFAULT_MESSAGE = "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?";

/**
 * Hook pour avertir l'utilisateur avant de quitter la page avec des modifications non enregistrées
 * Gère à la fois la fermeture du navigateur et la navigation interne (React Router)
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  message = DEFAULT_MESSAGE,
}: UseUnsavedChangesWarningOptions) {
  
  // Bloquer la navigation interne React Router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

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

  return {
    blocker,
    hasUnsavedChanges,
  };
}
