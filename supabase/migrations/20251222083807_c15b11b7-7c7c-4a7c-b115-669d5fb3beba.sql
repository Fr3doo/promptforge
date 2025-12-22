-- Durcissement de la fonction handle_new_user
-- 1) search_path='' selon recommandation Supabase
-- 2) Fallback non-sensible (jamais d'email exposé)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, pseudo)
  VALUES (
    NEW.id,
    -- Fallback non-sensible : pseudo fourni OU identifiant anonyme
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'pseudo'), ''),
      'user_' || LEFT(NEW.id::text, 8)
    )
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Crée automatiquement un profil lors de l''inscription. SECURITY DEFINER avec search_path vide pour sécurité maximale. Fallback pseudo non-sensible (jamais d''email).';