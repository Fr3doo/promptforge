import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { createExampleTemplates } from "@/lib/exampleTemplates";
import { getSafeErrorMessage } from "@/lib/errorHandler";

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
              const { data: prompts } = await supabase
                .from('prompts')
                .select('id')
                .eq('owner_id', session.user.id)
                .limit(1);
              
              if (!prompts || prompts.length === 0) {
                await createExampleTemplates(session.user.id, supabase);
              }
            } catch (error) {
              console.error('Error creating example templates:', getSafeErrorMessage(error));
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
