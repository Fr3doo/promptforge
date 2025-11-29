import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";
import { TemplateInitializationService } from "@/services/TemplateInitializationService";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { logError } from "@/lib/logger";

/**
 * Hook responsable de l'initialisation des données pour un nouvel utilisateur.
 * Séparé de l'AuthContext pour respecter le principe de responsabilité unique.
 * 
 * Responsabilités :
 * - Détecter les nouveaux utilisateurs
 * - Créer les templates d'exemple
 * - Gérer les erreurs de création gracieusement
 */
export function useNewUserBootstrap() {
  const { user, loading } = useAuth();
  const promptRepository = usePromptRepository();
  const variableRepository = useVariableRepository();
  
  // Éviter les initialisations multiples
  const hasInitialized = useRef(false);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    // Attendre que l'auth soit chargée
    if (loading) return;
    
    // Pas d'utilisateur = rien à faire
    if (!user) {
      hasInitialized.current = false;
      previousUserId.current = null;
      return;
    }
    
    // Même utilisateur déjà initialisé = skip
    if (hasInitialized.current && previousUserId.current === user.id) {
      return;
    }

    const initializeUser = async () => {
      hasInitialized.current = true;
      previousUserId.current = user.id;
      
      try {
        const templateService = new TemplateInitializationService(
          promptRepository,
          variableRepository,
          new SupabaseVariableSetRepository()
        );
        
        await templateService.createTemplatesForNewUser(user.id);
      } catch (error) {
        logError('Error creating example templates', {
          userId: user.id,
          error: getSafeErrorMessage(error),
        });
      }
    };

    // setTimeout(0) pour éviter le deadlock Supabase (cf. doc)
    setTimeout(initializeUser, 0);
  }, [user, loading, promptRepository, variableRepository]);
}
