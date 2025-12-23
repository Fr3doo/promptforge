-- Durcissement : Révoquer SELECT sur profiles pour anon
-- Aligne les GRANT avec l'intention (anon n'a aucun accès)
-- La policy RLS est le filet de sécurité, pas le mécanisme principal

REVOKE SELECT ON public.profiles FROM anon;

COMMENT ON TABLE public.profiles IS 
  'Profils utilisateurs. SELECT révoqué pour anon (défense en profondeur). Accès contrôlé par RLS : propre profil + relations de partage.';