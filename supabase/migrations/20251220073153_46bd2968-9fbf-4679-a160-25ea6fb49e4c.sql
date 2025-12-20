-- Étape 1 : Modifier get_user_id_by_email pour utiliser auth.users
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  found_user_id UUID;
BEGIN
  -- Recherche dans auth.users (source de vérité) au lieu de profiles
  SELECT id INTO found_user_id
  FROM auth.users
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(user_email))
  LIMIT 1;
  
  RETURN found_user_id;
END;
$function$;

-- Étape 2 : Modifier handle_new_user pour ne plus insérer l'email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, pseudo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Étape 3 : Supprimer la colonne email de profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;