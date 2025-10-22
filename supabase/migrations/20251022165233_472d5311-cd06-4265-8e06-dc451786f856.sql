-- Supprimer l'ancienne politique restrictive sur profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Créer une nouvelle politique permettant la lecture des profils dans le contexte de partage
CREATE POLICY "Users can view own and shared profiles"
ON profiles FOR SELECT
USING (
  -- Voir son propre profil
  auth.uid() = id
  OR
  -- Voir les profils des utilisateurs avec qui on partage (dans les deux sens)
  EXISTS (
    SELECT 1 FROM prompt_shares
    WHERE (
      -- Je partage avec eux
      (prompt_shares.shared_with_user_id = profiles.id AND prompt_shares.shared_by = auth.uid())
      OR
      -- Ils partagent avec moi
      (prompt_shares.shared_with_user_id = auth.uid() AND prompt_shares.shared_by = profiles.id)
    )
  )
  OR
  -- Voir les profils des propriétaires de prompts partagés avec moi
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.owner_id = profiles.id
    AND (
      prompts.visibility = 'SHARED'
      OR EXISTS (
        SELECT 1 FROM prompt_shares ps
        WHERE ps.prompt_id = prompts.id
        AND ps.shared_with_user_id = auth.uid()
      )
    )
  )
);