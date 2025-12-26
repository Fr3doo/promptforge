-- ============================================================================
-- MIGRATION: Ajouter des policies RESTRICTIVE pour forcer l'authentification
-- Pattern : "Require auth" - empêche tout accès SELECT sans auth.uid() valide
-- ============================================================================

-- 1. PROFILES - Require auth pour SELECT (s'ajoute aux policies PERMISSIVE existantes)
DROP POLICY IF EXISTS "Require auth for profiles select" ON public.profiles;
CREATE POLICY "Require auth for profiles select"
  ON public.profiles
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 2. PROMPTS - Require auth pour SELECT
DROP POLICY IF EXISTS "Require auth for prompts select" ON public.prompts;
CREATE POLICY "Require auth for prompts select"
  ON public.prompts
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 3. PROMPT_SHARES - Require auth pour SELECT
DROP POLICY IF EXISTS "Require auth for prompt_shares select" ON public.prompt_shares;
CREATE POLICY "Require auth for prompt_shares select"
  ON public.prompt_shares
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- VUES: Confirmer security_invoker et security_barrier
-- ============================================================================
ALTER VIEW public.public_profiles 
  SET (security_invoker = true, security_barrier = true);

ALTER VIEW public.prompts_with_share_count 
  SET (security_invoker = true, security_barrier = true);

-- ============================================================================
-- REVOKE/GRANT explicites sur les vues (défense en profondeur)
-- ============================================================================
REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
REVOKE ALL ON public.prompts_with_share_count FROM PUBLIC, anon;

GRANT SELECT ON public.public_profiles TO authenticated, service_role;
GRANT SELECT ON public.prompts_with_share_count TO authenticated, service_role;