-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "Users can view own and shared profiles" ON public.profiles;

-- Créer la nouvelle politique restrictive
-- Permet uniquement de voir :
-- 1. Son propre profil
-- 2. Les profils des utilisateurs avec qui on a un partage direct
CREATE POLICY "Users can view own and directly shared profiles"
ON public.profiles
FOR SELECT
USING (
  -- Propre profil
  (auth.uid() = id)
  OR
  -- Profil d'un utilisateur avec qui j'ai partagé un prompt
  (EXISTS (
    SELECT 1 FROM prompt_shares
    WHERE prompt_shares.shared_with_user_id = profiles.id
      AND prompt_shares.shared_by = auth.uid()
  ))
  OR
  -- Profil d'un utilisateur qui a partagé un prompt avec moi
  (EXISTS (
    SELECT 1 FROM prompt_shares
    WHERE prompt_shares.shared_by = profiles.id
      AND prompt_shares.shared_with_user_id = auth.uid()
  ))
);