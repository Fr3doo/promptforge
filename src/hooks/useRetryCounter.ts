import { useRef, useCallback } from "react";
import { RETRY_CONFIG } from "@/lib/network";

/**
 * Hook pour gérer les tentatives de retry manuels avec limite.
 * 
 * Respecte la Loi de Murphy : toujours limiter les opérations
 * qui pourraient échouer indéfiniment.
 * 
 * @remarks
 * Ce hook est utilisé pour les retry manuels (bouton "Réessayer"),
 * pas pour les retry automatiques de TanStack Query.
 * 
 * @returns Objet avec fonctions de gestion du compteur
 * 
 * @example
 * ```typescript
 * const { canRetry, incrementAndRetry, reset } = useRetryCounter();
 * 
 * const handleSave = async () => {
 *   reset(); // Nouvelle tentative utilisateur
 *   try {
 *     await save();
 *   } catch (error) {
 *     if (canRetry()) {
 *       incrementAndRetry(() => handleSave());
 *     }
 *   }
 * };
 * ```
 */
export function useRetryCounter() {
  const attemptCountRef = useRef(0);

  /**
   * Vérifie si une nouvelle tentative est autorisée
   * @returns true si le nombre de tentatives < MAX_ATTEMPTS
   */
  const canRetry = useCallback((): boolean => {
    return attemptCountRef.current < RETRY_CONFIG.MAX_ATTEMPTS;
  }, []);

  /**
   * Incrémente le compteur et exécute la fonction de retry si autorisé
   * @param retryFn - Fonction à exécuter pour le retry
   * @returns true si le retry a été exécuté, false si limite atteinte
   */
  const incrementAndRetry = useCallback((retryFn: () => void): boolean => {
    if (attemptCountRef.current < RETRY_CONFIG.MAX_ATTEMPTS) {
      attemptCountRef.current++;
      retryFn();
      return true;
    }
    return false;
  }, []);

  /**
   * Réinitialise le compteur de tentatives
   * À appeler au début d'une nouvelle action utilisateur
   */
  const reset = useCallback(() => {
    attemptCountRef.current = 0;
  }, []);

  /**
   * Retourne le nombre de tentatives effectuées
   */
  const getAttempts = useCallback((): number => {
    return attemptCountRef.current;
  }, []);

  return {
    canRetry,
    incrementAndRetry,
    reset,
    getAttempts,
  };
}
