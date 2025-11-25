import { useEffect, useState, useCallback } from "react";
import { messages } from "@/constants/messages";

/**
 * Hook pour gérer la progression de l'analyse de prompt
 * Fournit un compteur de temps écoulé et des messages dynamiques
 * selon la durée de l'analyse en cours
 */
export function useAnalysisProgress() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const id = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [isActive]);

  const start = useCallback(() => {
    setElapsedSeconds(0);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const getProgressMessage = useCallback((): string => {
    const { progress } = messages.analysis;
    
    if (elapsedSeconds < 5) return progress.preparing;
    if (elapsedSeconds < 15) return progress.analyzing;
    if (elapsedSeconds < 30) return progress.deepAnalysis;
    if (elapsedSeconds < 45) return progress.complexPrompt;
    return progress.almostDone;
  }, [elapsedSeconds]);

  return {
    elapsedSeconds,
    isActive,
    start,
    stop,
    getProgressMessage,
  };
}
