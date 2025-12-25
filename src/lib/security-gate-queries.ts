/**
 * Security Gate Queries - SQL pour vérification CI/CD
 *
 * Ces requêtes sont destinées à être exécutées directement via psql ou Supabase CLI
 * dans un pipeline CI/CD. Elles NE DOIVENT PAS être exécutées via des tests mockés.
 *
 * Usage recommandé:
 * - Exécuter scripts/security-gate.sql via psql avec une connexion DB directe
 * - Faire échouer le pipeline si des privilèges inattendus sont détectés
 *
 * @see docs/RLS_PATTERNS.md - Pattern 9 pour plus de détails
 */

/**
 * Objets protégés qui ne doivent jamais être accessibles au rôle anon
 */
export const PROTECTED_OBJECTS = {
  tables: [
    "public.profiles",
    "public.prompts",
    "public.prompt_shares",
    "public.prompt_usage",
    "public.variables",
    "public.variable_sets",
    "public.versions",
    "public.user_roles",
  ],
  views: ["public.public_profiles", "public.prompts_with_share_count"],
} as const;

/**
 * Requêtes SQL pour le security gate CI/CD
 *
 * Ces requêtes retournent des résultats exploitables :
 * - Ligne vide = PASS
 * - Ligne avec données = FAIL (privilège inattendu détecté)
 */
export const CI_SECURITY_GATE_QUERIES = {
  /**
   * Vérifie que anon n'a pas SELECT sur les objets protégés
   * FAIL si retourne des lignes
   */
  checkAnonPrivileges: `
-- Check anon SELECT privileges on protected objects
SELECT 
  'TABLE' as object_type,
  schemaname || '.' || tablename as object_name,
  'anon has SELECT' as issue
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles')
  AND has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT')

UNION ALL

SELECT 
  'VIEW' as object_type,
  schemaname || '.' || viewname as object_name,
  'anon has SELECT' as issue
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('public_profiles', 'prompts_with_share_count')
  AND has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT');
`,

  /**
   * Vérifie qu'aucun GRANT PUBLIC n'existe sur les objets protégés
   * FAIL si retourne des lignes (grantee=0 = PUBLIC)
   */
  checkPublicGrants: `
-- Check PUBLIC grants on protected objects
SELECT 
  c.relname as object_name,
  c.relkind as object_type,
  'PUBLIC has privileges' as issue,
  array_agg(a.privilege_type) as privileges
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL aclexplode(c.relacl) a
WHERE n.nspname = 'public'
  AND c.relname IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles', 'public_profiles', 'prompts_with_share_count')
  AND a.grantee = 0  -- 0 = PUBLIC pseudo-role
GROUP BY c.relname, c.relkind;
`,

  /**
   * Vérifie que les vues ont security_invoker=true
   * FAIL si retourne des lignes
   */
  checkViewSecurityInvoker: `
-- Check views have security_invoker=true
SELECT 
  schemaname || '.' || viewname as view_name,
  'security_invoker is not true' as issue
FROM pg_views v
JOIN pg_class c ON c.relname = v.viewname
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = v.schemaname
WHERE v.schemaname = 'public'
  AND v.viewname IN ('public_profiles', 'prompts_with_share_count')
  AND NOT COALESCE((c.reloptions::text[] @> ARRAY['security_invoker=true']), false);
`,

  /**
   * Vérification spécifique de public_profiles (objet le plus sensible)
   * FAIL si anon_select = true OU public_select = true
   */
  checkPublicProfilesAnonSelect: `
-- Specific check for public_profiles view
SELECT 
  'public.public_profiles' as object_name,
  CASE 
    WHEN has_table_privilege('anon', 'public.public_profiles', 'SELECT') THEN 'anon has SELECT'
    ELSE NULL
  END as anon_issue,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      CROSS JOIN LATERAL aclexplode(c.relacl) a
      WHERE n.nspname = 'public' AND c.relname = 'public_profiles' AND a.grantee = 0
    ) THEN 'PUBLIC has grants'
    ELSE NULL
  END as public_issue
WHERE 
  has_table_privilege('anon', 'public.public_profiles', 'SELECT')
  OR EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) a
    WHERE n.nspname = 'public' AND c.relname = 'public_profiles' AND a.grantee = 0
  );
`,

  /**
   * Audit complet de sécurité - résumé
   */
  securityAudit: `
-- Complete security audit summary
WITH audit_results AS (
  -- Check 1: anon privileges
  SELECT 
    'ANON_PRIVILEGE' as check_type,
    schemaname || '.' || tablename as object_name,
    'FAIL' as status
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles')
    AND has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT')
  
  UNION ALL
  
  SELECT 
    'ANON_PRIVILEGE' as check_type,
    schemaname || '.' || viewname as object_name,
    'FAIL' as status
  FROM pg_views
  WHERE schemaname = 'public'
    AND viewname IN ('public_profiles', 'prompts_with_share_count')
    AND has_table_privilege('anon', schemaname || '.' || viewname, 'SELECT')
  
  UNION ALL
  
  -- Check 2: PUBLIC grants
  SELECT 
    'PUBLIC_GRANT' as check_type,
    c.relname as object_name,
    'FAIL' as status
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN LATERAL aclexplode(c.relacl) a
  WHERE n.nspname = 'public'
    AND c.relname IN ('profiles', 'prompts', 'prompt_shares', 'prompt_usage', 'variables', 'variable_sets', 'versions', 'user_roles', 'public_profiles', 'prompts_with_share_count')
    AND a.grantee = 0
  
  UNION ALL
  
  -- Check 3: Views without security_invoker
  SELECT 
    'VIEW_SECURITY_INVOKER' as check_type,
    v.viewname as object_name,
    'FAIL' as status
  FROM pg_views v
  JOIN pg_class c ON c.relname = v.viewname
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = v.schemaname
  WHERE v.schemaname = 'public'
    AND v.viewname IN ('public_profiles', 'prompts_with_share_count')
    AND NOT COALESCE((c.reloptions::text[] @> ARRAY['security_invoker=true']), false)
)
SELECT * FROM audit_results;
`,

  /**
   * Template pour auditer une vue spécifique
   * Remplacer {{VIEW_NAME}} par le nom de la vue
   */
  viewAuditTemplate: `
-- Template: Complete audit for a specific view
-- Replace {{VIEW_NAME}} with actual view name (e.g., 'public_profiles')
SELECT 
  '{{VIEW_NAME}}' as view_name,
  has_table_privilege('anon', 'public.{{VIEW_NAME}}', 'SELECT') as anon_can_select,
  has_table_privilege('authenticated', 'public.{{VIEW_NAME}}', 'SELECT') as auth_can_select,
  EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) a
    WHERE n.nspname = 'public' AND c.relname = '{{VIEW_NAME}}' AND a.grantee = 0
  ) as has_public_grant,
  (
    SELECT COALESCE(c.reloptions::text[] @> ARRAY['security_invoker=true'], false)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = '{{VIEW_NAME}}'
  ) as security_invoker_enabled,
  (
    SELECT COALESCE(c.reloptions::text[] @> ARRAY['security_barrier=true'], false)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = '{{VIEW_NAME}}'
  ) as security_barrier_enabled;
`,
} as const;
