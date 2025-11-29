import { useEffect, useState, useMemo, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";
import { TemplateInitializationService } from "@/services/TemplateInitializationService";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { logError } from "@/lib/logger";
import { AuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  // Tenter d'utiliser le nouveau contexte (peut être undefined si pas de provider)
  const authContext = useContext(AuthContext);
  
  // Si le contexte existe, l'utiliser directement (nouveau système)
  if (authContext !== undefined) {
    return authContext;
  }
  
  // Sinon, fallback vers l'ancien comportement (transition)
  return useAuthLegacy();
}

/**
 * Implémentation legacy - sera supprimée après migration complète
 * @deprecated Utiliser AuthContextProvider à la place
 */
function useAuthLegacy() {
  const authRepository = useAuthRepository();
  const promptRepository = usePromptRepository();
  const variableRepository = useVariableRepository();
  
  const templateService = useMemo(
    () => new TemplateInitializationService(
      promptRepository, 
      variableRepository,
      new SupabaseVariableSetRepository()
    ),
    [promptRepository, variableRepository]
  );
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const subscription = authRepository.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create example templates on first signup
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              await templateService.createTemplatesForNewUser(
                session.user.id
              );
            } catch (error) {
              logError('Error creating example templates', { 
                userId: session.user.id,
                error: getSafeErrorMessage(error) 
              });
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    authRepository.getCurrentSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [authRepository, templateService]);

  return { user, session, loading };
}
