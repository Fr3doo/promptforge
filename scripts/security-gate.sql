-- ============================================================================
-- SECURITY GATE - Script SQL pour CI/CD
-- ============================================================================
--
-- Ce script vérifie les privilèges de sécurité de la base de données.
-- Il doit être exécuté directement via psql ou Supabase CLI dans le pipeline CI.
--
-- Usage:
--   psql $DATABASE_URL -f scripts/security-gate.sql
--   # ou avec Supabase CLI:
--   supabase db execute --file scripts/security-gate.sql
--
-- Le script échoue (via \set ON_ERROR_STOP) si des privilèges inattendus
-- sont détectés sur les objets protégés.
--
-- @see docs/RLS_PATTERNS.md - Pattern 9 pour plus de détails
-- ============================================================================

\set ON_ERROR_STOP on

-- ============================================================================
-- CHECK 1: Vérifier que anon n'a pas SELECT sur les tables protégées
-- ============================================================================
DO $$
DECLARE
  violation_count INTEGER;
  violations TEXT;
BEGIN
  SELECT COUNT(*), string_agg(object_name, ', ')
  INTO violation_count, violations
  FROM (
    SELECT schemaname || '.' || tablename as object_name
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles')
      AND has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT')
  ) t;
  
  IF violation_count > 0 THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: anon has SELECT on protected tables: %', violations;
  END IF;
  
  RAISE NOTICE 'CHECK 1 PASSED: anon has no SELECT on protected tables';
END $$;

-- ============================================================================
-- CHECK 2: Vérifier que anon n'a pas SELECT sur les vues protégées
-- ============================================================================
DO $$
DECLARE
  violation_count INTEGER;
  violations TEXT;
BEGIN
  SELECT COUNT(*), string_agg(object_name, ', ')
  INTO violation_count, violations
  FROM (
    SELECT schemaname || '.' || viewname as object_name
    FROM pg_views
    WHERE schemaname = 'public'
      AND viewname IN ('public_profiles', 'prompts_with_share_count')
      AND has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT')
  ) t;
  
  IF violation_count > 0 THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: anon has SELECT on protected views: %', violations;
  END IF;
  
  RAISE NOTICE 'CHECK 2 PASSED: anon has no SELECT on protected views';
END $$;

-- ============================================================================
-- CHECK 3: Vérifier qu'aucun GRANT PUBLIC n'existe sur les objets protégés
-- ============================================================================
DO $$
DECLARE
  violation_count INTEGER;
  violations TEXT;
BEGIN
  SELECT COUNT(*), string_agg(c.relname, ', ')
  INTO violation_count, violations
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN LATERAL aclexplode(c.relacl) a
  WHERE n.nspname = 'public'
    AND c.relname IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles', 'public_profiles', 'prompts_with_share_count')
    AND a.grantee = 0;  -- 0 = PUBLIC pseudo-role
  
  IF violation_count > 0 THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: PUBLIC has grants on protected objects: %', violations;
  END IF;
  
  RAISE NOTICE 'CHECK 3 PASSED: no PUBLIC grants on protected objects';
END $$;

-- ============================================================================
-- CHECK 4: Vérifier que les vues ont security_invoker=true
-- ============================================================================
DO $$
DECLARE
  violation_count INTEGER;
  violations TEXT;
BEGIN
  SELECT COUNT(*), string_agg(v.viewname, ', ')
  INTO violation_count, violations
  FROM pg_views v
  JOIN pg_class c ON c.relname = v.viewname
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = v.schemaname
  WHERE v.schemaname = 'public'
    AND v.viewname IN ('public_profiles', 'prompts_with_share_count')
    AND NOT COALESCE((c.reloptions::text[] @> ARRAY['security_invoker=true']), false);
  
  IF violation_count > 0 THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: views without security_invoker=true: %', violations;
  END IF;
  
  RAISE NOTICE 'CHECK 4 PASSED: all protected views have security_invoker=true';
END $$;

-- ============================================================================
-- CHECK 5: Vérification spécifique public_profiles (double-check)
-- ============================================================================
DO $$
DECLARE
  anon_has_select BOOLEAN;
  public_has_grant BOOLEAN;
BEGIN
  -- Check anon SELECT
  SELECT has_table_privilege('anon', 'public.public_profiles', 'SELECT')
  INTO anon_has_select;
  
  -- Check PUBLIC grants
  SELECT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) a
    WHERE n.nspname = 'public' AND c.relname = 'public_profiles' AND a.grantee = 0
  )
  INTO public_has_grant;
  
  IF anon_has_select THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: anon can SELECT on public_profiles';
  END IF;
  
  IF public_has_grant THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: PUBLIC has grants on public_profiles';
  END IF;
  
  RAISE NOTICE 'CHECK 5 PASSED: public_profiles is properly secured';
END $$;

-- ============================================================================
-- CHECK 6: Vérifier que les tables ont des policies RESTRICTIVE require-auth
-- ============================================================================
DO $$
DECLARE
  missing_count INTEGER;
  missing_tables TEXT;
BEGIN
  -- Vérifier que profiles, prompts, prompt_shares ont chacun une policy RESTRICTIVE pour SELECT
  WITH required_tables AS (
    SELECT unnest(ARRAY['profiles', 'prompts', 'prompt_shares']) AS tablename
  ),
  tables_with_restrictive AS (
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'prompts', 'prompt_shares')
      AND permissive = 'RESTRICTIVE'
      AND cmd = 'SELECT'
      AND qual::text LIKE '%auth.uid()%'
  )
  SELECT COUNT(*), string_agg(r.tablename, ', ')
  INTO missing_count, missing_tables
  FROM required_tables r
  LEFT JOIN tables_with_restrictive t ON r.tablename = t.tablename
  WHERE t.tablename IS NULL;
  
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: % table(s) missing RESTRICTIVE require-auth policy: %', missing_count, missing_tables;
  END IF;
  
  RAISE NOTICE 'CHECK 6 PASSED: all protected tables have RESTRICTIVE require-auth policies';
END $$;

-- ============================================================================
-- CHECK 7: prompts_with_share_count (regression guard)
--   Objectif: empêcher qu'une recréation de la vue retire security_invoker
-- ============================================================================
DO $$
DECLARE
  v_reg regclass;
  anon_can_select boolean;
  public_can_select boolean;
  invoker_ok boolean;
  barrier_ok boolean;
  anon_bypassrls boolean;
  auth_bypassrls boolean;
BEGIN
  v_reg := to_regclass('public.prompts_with_share_count');
  IF v_reg IS NULL THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: view public.prompts_with_share_count is missing';
  END IF;

  -- reloptions peut être NULL => on coalesce proprement
  SELECT
    (coalesce(c.reloptions, ARRAY[]::text[]) @> ARRAY['security_invoker=true']),
    (coalesce(c.reloptions, ARRAY[]::text[]) @> ARRAY['security_barrier=true'])
  INTO invoker_ok, barrier_ok
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'prompts_with_share_count';

  SELECT
    has_table_privilege('anon',   v_reg, 'SELECT'),
    has_table_privilege('public', v_reg, 'SELECT')
  INTO anon_can_select, public_can_select;

  IF anon_can_select THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: anon can SELECT on public.prompts_with_share_count';
  END IF;

  IF public_can_select THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: PUBLIC can SELECT on public.prompts_with_share_count';
  END IF;

  IF NOT invoker_ok THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: prompts_with_share_count missing security_invoker=true';
  END IF;

  -- Fail-fast si les rôles client ont BYPASSRLS (régression sécurité majeure)
  SELECT rolbypassrls INTO anon_bypassrls FROM pg_roles WHERE rolname = 'anon';
  SELECT rolbypassrls INTO auth_bypassrls FROM pg_roles WHERE rolname = 'authenticated';

  IF coalesce(anon_bypassrls, false) THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: role anon has BYPASSRLS=true';
  END IF;

  IF coalesce(auth_bypassrls, false) THEN
    RAISE EXCEPTION 'SECURITY GATE FAILED: role authenticated has BYPASSRLS=true';
  END IF;

  -- Note: security_barrier est optionnel (trade-off perf). On log, mais non bloquant.
  RAISE NOTICE 'CHECK 7 PASSED: prompts_with_share_count secured (security_invoker=%, security_barrier=%)',
    invoker_ok, barrier_ok;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SECURITY GATE: ALL CHECKS PASSED';
  RAISE NOTICE '============================================';
END $$;
