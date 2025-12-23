-- Corriger la policy pour utiliser le rôle 'anon' au lieu de 'public'
DROP POLICY IF EXISTS "Deny anonymous access to prompt_usage" ON public.prompt_usage;

CREATE POLICY "Deny anonymous access to prompt_usage"
ON public.prompt_usage
FOR ALL
TO anon
USING (false);