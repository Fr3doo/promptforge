-- Améliorer la fonction get_user_id_by_email pour normaliser l'email (insensible à la casse et aux espaces)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  found_user_id UUID;
BEGIN
  -- Normaliser l'email : trim + lowercase pour recherche insensible à la casse
  SELECT id INTO found_user_id
  FROM public.profiles
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email))
  LIMIT 1;
  
  RETURN found_user_id;
END;
$function$;