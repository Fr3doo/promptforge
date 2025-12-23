-- Step 1: Harden user_roles table (defense in depth)
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- Add explicit "deny anon" policy with WITH CHECK
DROP POLICY IF EXISTS "Deny anonymous access to user_roles" ON public.user_roles;

CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Step 2: Revoke ALL privileges from anon on all tables
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.prompt_shares FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.prompt_usage FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.prompts FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.user_roles FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.variable_sets FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.variables FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.versions FROM anon;

-- Step 3: Revoke ALL privileges from public role (inherited by all)
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.prompt_shares FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.prompt_usage FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.prompts FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.user_roles FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.variable_sets FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.variables FROM public;
REVOKE ALL PRIVILEGES ON TABLE public.versions FROM public;

-- Step 4: Revoke privileges on sequences from anon and public
DO $$
DECLARE s record;
BEGIN
  FOR s IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM anon', s.sequence_schema, s.sequence_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM public', s.sequence_schema, s.sequence_name);
  END LOOP;
END$$;