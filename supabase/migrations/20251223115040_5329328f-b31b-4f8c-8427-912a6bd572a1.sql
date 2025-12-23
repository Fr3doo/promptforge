-- Garde-fou anti-régression : REVOKE explicite pour anon sur public_profiles
-- Même si anon n'a pas actuellement le droit SELECT, ce REVOKE empêche
-- qu'un futur "GRANT ON ALL TABLES" rouvre silencieusement l'accès.
REVOKE SELECT ON public.public_profiles FROM anon;

-- Documentation : authenticated peut SELECT mais les lignes sont filtrées par RLS
-- via security_invoker=true sur la vue
COMMENT ON VIEW public.public_profiles IS 
  'Vue publique des profils utilisateurs (pseudo, name, image, created_at). '
  'Accessible aux utilisateurs authentifiés uniquement (anon REVOKE explicite). '
  'Les lignes sont filtrées par la RLS de profiles : profil propre + relations de partage. '
  'Options: security_invoker=true, security_barrier=true. '
  'Vérifié 2025-12-23 - PostgreSQL 17.6.';