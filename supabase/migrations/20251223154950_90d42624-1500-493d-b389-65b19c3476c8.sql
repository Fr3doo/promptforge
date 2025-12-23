-- =====================================================
-- FORCE RLS: Défense en profondeur sur tables sensibles
-- =====================================================
-- Contexte: FORCE RLS empêche le table owner de bypass RLS
-- Note: Les rôles avec BYPASSRLS (postgres, service_role) bypass toujours

-- Étape 1: Tables haute sensibilité
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_shares FORCE ROW LEVEL SECURITY;

-- Étape 2: Tables dépendantes (moyenne sensibilité)
ALTER TABLE public.variables FORCE ROW LEVEL SECURITY;
ALTER TABLE public.versions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variable_sets FORCE ROW LEVEL SECURITY;

-- Note: prompt_usage non inclus (table de logs, faible sensibilité)
-- Note: user_roles déjà configuré avec FORCE RLS

-- Rollback si nécessaire:
-- ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.prompts NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.prompt_shares NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.variables NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.versions NO FORCE ROW LEVEL SECURITY;
-- ALTER TABLE public.variable_sets NO FORCE ROW LEVEL SECURITY;