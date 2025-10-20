import { useEffect, useRef } from "react";
import { useUpdatePrompt } from "@/hooks/usePrompts";

interface UseAutoSaveOptions {
  promptId?: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  visibility: "PRIVATE" | "SHARED";
  enabled: boolean;
  interval?: number; // millisecondes, default 30000 (30 secondes)
}

export function useAutoSave({
  promptId,
  title,
  content,
  description,
  tags,
  visibility,
  enabled,
  interval = 30000,
}: UseAutoSaveOptions) {
  const { mutate: updatePrompt } = useUpdatePrompt();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef({ title, content, description, tags, visibility });

  // Met à jour les refs à chaque changement
  useEffect(() => {
    dataRef.current = { title, content, description, tags, visibility };
  }, [title, content, description, tags, visibility]);

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
            visibility: data.visibility,
            status: "DRAFT", // Marquer comme brouillon lors de l'auto-save
          },
        }, {
          onSuccess: () => {
            console.log("Auto-sauvegarde réussie");
          },
          onError: (error) => {
            console.error("Erreur auto-sauvegarde:", error);
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
