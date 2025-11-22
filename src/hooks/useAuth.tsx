import { useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useAuthRepository } from "@/contexts/AuthRepositoryContext";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";
import { useVariableRepository } from "@/contexts/VariableRepositoryContext";
import { SupabaseVariableSetRepository } from "@/repositories/VariableSetRepository";
import { TemplateInitializationService } from "@/services/TemplateInitializationService";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { logError } from "@/lib/logger";

export function useAuth() {
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
