-- Step 1: Revoke unnecessary GRANT on prompt_shares from anon/public
-- The RLS policy already blocks anon with USING(false), but removing the GRANT
-- applies least-privilege principle and prevents future regressions
REVOKE SELECT ON TABLE public.prompt_shares FROM anon;
REVOKE ALL ON TABLE public.prompt_shares FROM public;

-- Step 2: Add security_barrier to prompts_with_share_count view
-- This prevents query optimization from potentially bypassing security conditions
ALTER VIEW public.prompts_with_share_count 
  SET (security_barrier = true);