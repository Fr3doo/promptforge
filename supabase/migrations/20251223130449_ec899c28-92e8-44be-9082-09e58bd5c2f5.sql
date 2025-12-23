-- Policy INSERT pour permettre la création de profil
-- Même si le trigger handle_new_user gère actuellement la création,
-- cette policy assure la compatibilité avec un éventuel flow client-side
-- et complète le schéma RLS de manière cohérente.

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS
  'Permet aux utilisateurs authentifiés de créer leur propre profil. '
  'Actuellement, la création est gérée par le trigger handle_new_user (SECURITY DEFINER), '
  'mais cette policy assure la compatibilité avec un flow client-side futur. '
  'Ajouté pour défense en profondeur et pattern Supabase standard. '
  'Vérifié 2025-12-23.';