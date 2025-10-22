-- Créer une vue enrichie pour les prompts avec compteur de partages
CREATE OR REPLACE VIEW public.prompts_with_share_count AS
SELECT 
  p.*,
  COUNT(ps.id)::integer as share_count
FROM prompts p
LEFT JOIN prompt_shares ps ON ps.prompt_id = p.id
GROUP BY p.id;