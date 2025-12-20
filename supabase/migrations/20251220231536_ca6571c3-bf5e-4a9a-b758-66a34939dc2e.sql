-- ============================================================
-- 1) Policies RLS additionnelles sur profiles (relation de partage)
--    Idempotence : supprime si déjà présentes
-- ============================================================
DROP POLICY IF EXISTS "Owners can view profiles of users they shared with" ON public.profiles;
DROP POLICY IF EXISTS "Shared users can view profile of who shared with them" ON public.profiles;

-- Policy : le propriétaire d'un prompt peut voir le profil des destinataires
CREATE POLICY "Owners can view profiles of users they shared with"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompt_shares ps
    WHERE ps.shared_with_user_id = profiles.id
      AND ps.shared_by = auth.uid()
  )
);

-- Policy : le destinataire d'un partage peut voir le profil du partageur
CREATE POLICY "Shared users can view profile of who shared with them"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompt_shares ps
    WHERE ps.shared_by = profiles.id
      AND ps.shared_with_user_id = auth.uid()
  )
);

-- ============================================================
-- 2) Indexes pour la performance des EXISTS dans les policies
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_prompt_shares_shared_by_with
  ON public.prompt_shares (shared_by, shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_prompt_shares_shared_with_by
  ON public.prompt_shares (shared_with_user_id, shared_by);

-- ============================================================
-- 3) Sécuriser public_profiles avec SECURITY INVOKER (KISS)
-- ============================================================
-- Recréer la vue pour pouvoir modifier ses options
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  pseudo,
  name,
  image,
  created_at
FROM public.profiles;

-- Le fix principal : la vue utilise le contexte RLS de l'appelant
ALTER VIEW public.public_profiles
  SET (security_invoker = true, security_barrier = true);

-- Permissions : uniquement authenticated, pas anon
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;

COMMENT ON VIEW public.public_profiles IS
  'Vue publique des profils (sans email). security_invoker=true => RLS évaluée selon l''utilisateur appelant.';