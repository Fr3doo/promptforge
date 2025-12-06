import { useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Prompt = Tables<"prompts">;

export interface OptimisticLockError extends Error {
  type: "CONFLICT" | "STALE_DATA";
  serverUpdatedAt?: string;
  clientUpdatedAt?: string;
}

/**
 * Hook pour gérer le verrouillage optimiste des prompts
 * Vérifie que les données n'ont pas été modifiées par un autre utilisateur
 * avant de permettre une mise à jour ou une création de version
 */
export function useOptimisticLocking() {
  /**
   * Vérifie si un prompt a été modifié depuis la dernière lecture
   * @param clientPrompt - Le prompt tel que connu côté client
   * @param serverPrompt - Le prompt tel qu'il existe côté serveur
   * @throws OptimisticLockError si les données sont obsolètes
   */
  const checkForConflicts = useCallback((
    clientPrompt: Prompt,
    serverPrompt: Prompt
  ): void => {
    if (!clientPrompt.updated_at || !serverPrompt.updated_at) {
      return;
    }

    const clientDate = new Date(clientPrompt.updated_at);
    const serverDate = new Date(serverPrompt.updated_at);

    if (serverDate > clientDate) {
      const error = new Error(
        "Ce prompt a été modifié par un autre utilisateur. Veuillez recharger la page pour voir les dernières modifications."
      ) as OptimisticLockError;
      
      error.type = "CONFLICT";
      error.serverUpdatedAt = serverPrompt.updated_at;
      error.clientUpdatedAt = clientPrompt.updated_at;
      
      throw error;
    }
  }, []);

  /**
   * Vérifie qu'une version avec le même numéro n'existe pas déjà
   * @param promptId - ID du prompt
   * @param semver - Numéro de version à vérifier
   * @returns true si la version existe déjà
   */
  const checkVersionExists = useCallback(async (
    promptId: string,
    semver: string
  ): Promise<boolean> => {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase
      .from("versions")
      .select("id")
      .eq("prompt_id", promptId)
      .eq("semver", semver)
      .maybeSingle();

    if (error) {
      console.error("Erreur vérification version:", error);
      return false;
    }

    return !!data;
  }, []);

  /**
   * Vérifie si le prompt a été modifié sur le serveur
   * @param promptId - ID du prompt
   * @param clientUpdatedAt - Date de dernière modification côté client
   * @returns Object avec hasConflict et optionnellement serverUpdatedAt
   */
  const checkForServerUpdates = useCallback(async (
    promptId: string,
    clientUpdatedAt: string
  ): Promise<{ hasConflict: boolean; serverUpdatedAt?: string }> => {
    const { SupabasePromptQueryRepository } = await import("@/repositories/PromptQueryRepository");
    const repository = new SupabasePromptQueryRepository();
    
    try {
      const serverPrompt = await repository.fetchById(promptId);
      
      if (!serverPrompt || !clientUpdatedAt) {
        return { hasConflict: false };
      }

      const clientDate = new Date(clientUpdatedAt);
      const serverDate = new Date(serverPrompt.updated_at);

      if (serverDate > clientDate) {
        return { 
          hasConflict: true, 
          serverUpdatedAt: serverPrompt.updated_at 
        };
      }

      return { hasConflict: false };
    } catch (error) {
      console.error("Erreur lors de la vérification des mises à jour:", error);
      return { hasConflict: false };
    }
  }, []);

  return {
    checkForConflicts,
    checkVersionExists,
    checkForServerUpdates,
  };
}
