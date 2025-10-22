-- Ajouter un champ pseudo à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pseudo text;

-- Rendre le pseudo unique pour éviter les doublons
ALTER TABLE public.profiles ADD CONSTRAINT unique_pseudo UNIQUE (pseudo);

-- Mettre à jour la fonction handle_new_user pour enregistrer le pseudo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, pseudo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', NEW.email)
  );
  RETURN NEW;
END;
$function$;