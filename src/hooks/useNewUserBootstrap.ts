import { useEffect, useRef, useMemo } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { TemplateInitializationService } from "@/services/TemplateInitializationService";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { logError } from "@/lib/logger";

/**
 * Hook qui s'occupe d'initialiser les données pour un nouvel utilisateur
 * 
 * Responsabilités :
 * - Créer les templates d'exemple lors de la première connexion
 * - Éviter les créations multiples avec un ref guard
 * - Gérer les erreurs de manière silencieuse (non-bloquant)
 * 
 * Note : Séparé de AuthContext pour respecter le principe de responsabilité unique (SRP)
 * et éviter de mélanger logique d'authentification et logique métier
 */
export function useNewUserBootstrap() {
  const { user, loading } = useAuthContext();
  const promptRepository = usePromptRepository();
  const variableRepository = useVariableRepository();
  const hasInitialized = useRef(false);

  const templateService = useMemo(
    () =>
      new TemplateInitializationService(
        promptRepository,
        variableRepository,
        new SupabaseVariableSetRepository()
      ),
    [promptRepository, variableRepository]
  );

  useEffect(() => {
    // Attendre que l'auth soit chargée
    if (loading || !user || hasInitialized.current) return;

    const initializeUser = async () => {
      hasInitialized.current = true;

      try {
        await templateService.createTemplatesForNewUser(user.id);
      } catch (error) {
        logError("Error creating example templates", {
          userId: user.id,
          error: getSafeErrorMessage(error),
        });
      }
    };

    // Utiliser setTimeout(0) pour éviter le deadlock Supabase
    // (ne jamais appeler d'autres fonctions Supabase dans le callback onAuthStateChange)
    setTimeout(initializeUser, 0);
  }, [user, loading, templateService]);
}
