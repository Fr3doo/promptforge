-- Sécurisation de la vue prompts_with_share_count
-- Bloque tout accès "par défaut"
REVOKE ALL ON TABLE public.prompts_with_share_count FROM PUBLIC;

-- Bloque explicitement les anonymes
REVOKE ALL ON TABLE public.prompts_with_share_count FROM anon;

-- Autorise explicitement les utilisateurs connectés
GRANT SELECT ON TABLE public.prompts_with_share_count TO authenticated;

-- Permet au service_role d'accéder (pour les edge functions)
GRANT SELECT ON TABLE public.prompts_with_share_count TO service_role;

-- Documentation
COMMENT ON VIEW public.prompts_with_share_count IS
  'Vue prompts + compteur de partages. security_invoker=true. Accès restreint aux utilisateurs authentifiés.';