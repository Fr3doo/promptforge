-- Supprimer la vue existante et la recréer avec SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

-- Créer la vue avec security_barrier pour empêcher les fuites via fonctions
CREATE VIEW public.public_profiles 
WITH (security_barrier = true)
AS
SELECT 
  id,
  pseudo,
  name,
  image,
  created_at
FROM public.profiles;

-- Donner accès à la vue aux utilisateurs authentifiés
GRANT SELECT ON public.public_profiles TO authenticated;