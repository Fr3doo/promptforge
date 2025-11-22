import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { templateInitializationService } from "@/services/TemplateInitializationService";
import { getSafeErrorMessage } from "@/lib/errorHandler";
import { logError } from "@/lib/logger";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create example templates on first signup
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              await templateInitializationService.createExampleTemplatesIfNeeded(
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
