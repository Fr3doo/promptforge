-- Vue sécurisée exposant uniquement les champs non sensibles
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  pseudo,
  name,
  image,
  created_at
FROM public.profiles;

-- Donner accès à la vue aux utilisateurs authentifiés
GRANT SELECT ON public.public_profiles TO authenticated;

-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "Users can view own and directly shared profiles" ON public.profiles;

-- Nouvelle politique : chacun ne voit que son propre profil complet (avec email)
CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);