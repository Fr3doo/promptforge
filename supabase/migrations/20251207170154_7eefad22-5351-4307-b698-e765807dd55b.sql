-- Drop and recreate the view with security_invoker = true
-- This ensures the view respects RLS policies on the underlying prompts table

DROP VIEW IF EXISTS public.prompts_with_share_count;

CREATE VIEW public.prompts_with_share_count 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.owner_id,
  p.title,
  p.description,
  p.content,
  p.tags,
  p.visibility,
  p.version,
  p.is_favorite,
  p.created_at,
  p.updated_at,
  p.status,
  p.public_permission,
  COUNT(ps.id)::integer AS share_count
FROM prompts p
LEFT JOIN prompt_shares ps ON ps.prompt_id = p.id
GROUP BY p.id;