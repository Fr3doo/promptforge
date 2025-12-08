-- Sécuriser la fonction update_updated_at_column
-- Ajoute SECURITY INVOKER explicite et SET search_path = '' pour empêcher les attaques de manipulation de chemin
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;