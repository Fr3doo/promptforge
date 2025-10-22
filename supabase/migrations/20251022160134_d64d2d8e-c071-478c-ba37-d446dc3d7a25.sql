-- Phase 2.1: Corriger la politique RLS de suppression pour autoriser le propriétaire
DROP POLICY IF EXISTS "Only share creator can delete shares" ON prompt_shares;

CREATE POLICY "Owner or share creator can delete shares" 
ON prompt_shares FOR DELETE
USING (
  auth.uid() = shared_by OR
  EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_shares.prompt_id 
    AND prompts.owner_id = auth.uid()
  )
);

-- Phase 2.2: Ajouter une contrainte CASCADE pour nettoyer les partages si un utilisateur est supprimé
ALTER TABLE prompt_shares
DROP CONSTRAINT IF EXISTS prompt_shares_shared_with_user_id_fkey;

ALTER TABLE prompt_shares
ADD CONSTRAINT prompt_shares_shared_with_user_id_fkey
FOREIGN KEY (shared_with_user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;