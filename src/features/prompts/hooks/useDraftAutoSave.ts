import { useEffect, useRef } from "react";
import { logDebug } from "@/lib/logger";
import { TIMING, STORAGE_KEYS } from "@/constants/application-config";

interface DraftData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface UseDraftAutoSaveOptions {
  title: string;
  description: string;
  content: string;
  tags: string[];
  enabled: boolean; // Actif uniquement en mode création
}

export function useDraftAutoSave({
  title,
  description,
  content,
  tags,
  enabled,
}: UseDraftAutoSaveOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef({ title, description, content, tags });

  // Mettre à jour les refs à chaque changement
  useEffect(() => {
    dataRef.current = { title, description, content, tags };
  }, [title, description, content, tags]);

  // Auto-sauvegarde périodique
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Nettoyer le timer précédent
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Démarrer l'auto-save
    timerRef.current = setInterval(() => {
      const data = dataRef.current;
      
      // Sauvegarder seulement si au moins un champ est rempli
      if (data.title.trim() || data.content.trim() || data.description.trim() || data.tags.length > 0) {
        saveDraft(data);
      }
    }, TIMING.AUTOSAVE_INTERVAL);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled]);

  return null;
}

/**
 * Sauvegarde le brouillon dans localStorage
 */
export function saveDraft(data: Omit<DraftData, "timestamp">): void {
  try {
    const draftData: DraftData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.DRAFT_NEW_PROMPT, JSON.stringify(draftData));
    logDebug("Brouillon sauvegardé localement", { timestamp: draftData.timestamp });
  } catch (error) {
    // Silencieux en cas d'erreur (quota localStorage dépassé, etc.)
    console.warn("Impossible de sauvegarder le brouillon:", error);
  }
}

/**
 * Charge le brouillon depuis localStorage
 */
export function loadDraft(): DraftData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_NEW_PROMPT);
    if (!stored) return null;

    const data = JSON.parse(stored) as DraftData;
    logDebug("Brouillon chargé depuis localStorage", { timestamp: data.timestamp });
    return data;
  } catch (error) {
    console.warn("Impossible de charger le brouillon:", error);
    return null;
  }
}

/**
 * Supprime le brouillon de localStorage
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT_NEW_PROMPT);
    logDebug("Brouillon supprimé de localStorage");
  } catch (error) {
    console.warn("Impossible de supprimer le brouillon:", error);
  }
}

/**
 * Vérifie si un brouillon existe
 */
export function hasDraft(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRAFT_NEW_PROMPT) !== null;
  } catch {
    return false;
  }
}
