-- Sécuriser la table versions avec des politiques RLS séparées pour lecture/écriture
-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Versions inherit prompt permissions" ON public.versions;

-- Politique SELECT : lecture si propriétaire OU prompt accessible
CREATE POLICY "Users can view versions of accessible prompts"
ON public.versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = versions.prompt_id
    AND (
      prompts.owner_id = auth.uid()
      OR (prompts.visibility = 'SHARED' AND prompts.status = 'PUBLISHED')
      OR EXISTS (
        SELECT 1 FROM prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id
        AND prompt_shares.shared_with_user_id = auth.uid()
      )
    )
  )
);

-- Politique INSERT : création si propriétaire OU permission WRITE
CREATE POLICY "Users can create versions with write permission"
ON public.versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = versions.prompt_id
    AND (
      prompts.owner_id = auth.uid()
      OR (prompts.visibility = 'SHARED' AND prompts.status = 'PUBLISHED' AND prompts.public_permission = 'WRITE')
      OR EXISTS (
        SELECT 1 FROM prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id
        AND prompt_shares.shared_with_user_id = auth.uid()
        AND prompt_shares.permission = 'WRITE'
      )
    )
  )
);

-- Politique UPDATE : modification si propriétaire OU permission WRITE
CREATE POLICY "Users can update versions with write permission"
ON public.versions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = versions.prompt_id
    AND (
      prompts.owner_id = auth.uid()
      OR (prompts.visibility = 'SHARED' AND prompts.status = 'PUBLISHED' AND prompts.public_permission = 'WRITE')
      OR EXISTS (
        SELECT 1 FROM prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id
        AND prompt_shares.shared_with_user_id = auth.uid()
        AND prompt_shares.permission = 'WRITE'
      )
    )
  )
);

-- Politique DELETE : suppression uniquement par le propriétaire
CREATE POLICY "Only owners can delete versions"
ON public.versions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = versions.prompt_id
    AND prompts.owner_id = auth.uid()
  )
);