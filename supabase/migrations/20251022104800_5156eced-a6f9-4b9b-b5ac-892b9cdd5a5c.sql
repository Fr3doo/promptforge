-- Amélioration de la sécurité RLS pour prompt_shares
-- Seul le créateur du partage (shared_by) peut modifier ou supprimer un partage

-- Supprimer les anciennes politiques trop permissives
DROP POLICY IF EXISTS "Owners can update shares" ON public.prompt_shares;
DROP POLICY IF EXISTS "Owners can delete shares" ON public.prompt_shares;

-- Créer une politique UPDATE restrictive
CREATE POLICY "Only share creator can update shares"
ON public.prompt_shares
FOR UPDATE
TO authenticated
USING (auth.uid() = shared_by)
WITH CHECK (auth.uid() = shared_by);

-- Créer une politique DELETE restrictive
CREATE POLICY "Only share creator can delete shares"
ON public.prompt_shares
FOR DELETE
TO authenticated
USING (auth.uid() = shared_by);