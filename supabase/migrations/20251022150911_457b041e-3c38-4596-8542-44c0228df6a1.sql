-- Corriger la vue pour qu'elle hérite des RLS policies de la table prompts
-- en utilisant SECURITY INVOKER au lieu de SECURITY DEFINER (comportement par défaut)
DROP VIEW IF EXISTS public.prompts_with_share_count;

CREATE VIEW public.prompts_with_share_count 
WITH (security_invoker = true)
AS
SELECT 
  p.*,
  COUNT(ps.id)::integer as share_count
FROM prompts p
LEFT JOIN prompt_shares ps ON ps.prompt_id = p.id
GROUP BY p.id;