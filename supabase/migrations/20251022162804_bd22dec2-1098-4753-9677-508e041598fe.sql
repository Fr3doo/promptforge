-- Mettre à jour la politique UPDATE pour permettre au propriétaire du prompt de modifier les partages
DROP POLICY IF EXISTS "Only share creator can update shares" ON prompt_shares;

CREATE POLICY "Owner or share creator can update shares"
ON prompt_shares FOR UPDATE
USING (
  auth.uid() = shared_by OR
  EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_shares.prompt_id 
    AND prompts.owner_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = shared_by OR
  EXISTS (
    SELECT 1 FROM prompts 
    WHERE prompts.id = prompt_shares.prompt_id 
    AND prompts.owner_id = auth.uid()
  )
);