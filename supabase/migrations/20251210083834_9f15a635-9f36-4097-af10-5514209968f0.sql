-- Recréer la vue avec SECURITY INVOKER (comportement souhaité)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  pseudo,
  name,
  image,
  created_at
FROM public.profiles;

-- Redonner accès à la vue
GRANT SELECT ON public.public_profiles TO authenticated;