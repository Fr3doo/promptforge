import { useEffect, useRef } from "react";
import { useUpdatePrompt } from "@/hooks/usePrompts";
import { logDebug, logError } from "@/lib/logger";

interface UseAutoSaveOptions {
  promptId?: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  enabled: boolean;
  interval?: number; // millisecondes, default 30000 (30 secondes)
}

export function useAutoSave({
  promptId,
  title,
  content,
  description,
  tags,
  enabled,
  interval = 30000,
}: UseAutoSaveOptions) {
  const { mutate: updatePrompt } = useUpdatePrompt();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef({ title, content, description, tags });

  // Met à jour les refs à chaque changement
  useEffect(() => {
    dataRef.current = { title, content, description, tags };
  }, [title, content, description, tags]);

  useEffect(() => {
    if (!enabled || !promptId || !title.trim()) {
      return;
    }

    // Nettoyer le timer précédent
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Démarrer l'auto-save
    timerRef.current = setInterval(() => {
      const data = dataRef.current;
      
      // Ne sauvegarder que si on a un titre
      if (data.title.trim()) {
        updatePrompt({
          id: promptId,
          updates: {
            title: data.title,
            content: data.content,
            description: data.description || null,
            tags: data.tags,
          },
        }, {
          onSuccess: () => {
            logDebug("Auto-sauvegarde réussie", { promptId });
          },
          onError: (error) => {
            logError("Erreur auto-sauvegarde", { 
              promptId, 
              error: error instanceof Error ? error.message : String(error) 
            });
          },
        });
      }
    }, interval);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, promptId, interval, updatePrompt]);

  return null;
}
