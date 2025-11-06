-- Fix security warnings: Set search_path for validation functions

DROP FUNCTION IF EXISTS public.validate_variable_options() CASCADE;
DROP FUNCTION IF EXISTS public.validate_variables_count() CASCADE;

-- Fonction de validation des options ENUM (avec search_path sécurisé)
CREATE OR REPLACE FUNCTION public.validate_variable_options()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier le nombre d'options (≤ 50)
  IF NEW.options IS NOT NULL AND array_length(NEW.options, 1) > 50 THEN
    RAISE EXCEPTION 'Le nombre d''options ne peut pas dépasser 50 (actuel: %)', 
      array_length(NEW.options, 1)
    USING ERRCODE = '23514';
  END IF;

  -- Vérifier la longueur de chaque option (≤ 100 caractères)
  IF NEW.options IS NOT NULL THEN
    PERFORM 1
    FROM unnest(NEW.options) AS opt
    WHERE char_length(opt) > 100
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Chaque option ne peut pas dépasser 100 caractères'
      USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attacher le trigger pour validation des options
CREATE TRIGGER validate_variable_options_trigger
  BEFORE INSERT OR UPDATE ON public.variables
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_variable_options();

-- Fonction de validation du nombre de variables par prompt (avec search_path sécurisé)
CREATE OR REPLACE FUNCTION public.validate_variables_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Compter les variables existantes pour ce prompt
  SELECT COUNT(*) INTO current_count
  FROM public.variables
  WHERE prompt_id = NEW.prompt_id;

  -- Sur INSERT : vérifier si on dépasse la limite
  IF TG_OP = 'INSERT' AND current_count >= 50 THEN
    RAISE EXCEPTION 'Un prompt ne peut pas avoir plus de 50 variables (actuel: %)', 
      current_count
    USING ERRCODE = '23514';
  END IF;

  -- Sur UPDATE : vérifier si le prompt_id change et dépasse la limite
  IF TG_OP = 'UPDATE' AND NEW.prompt_id <> OLD.prompt_id THEN
    SELECT COUNT(*) INTO current_count
    FROM public.variables
    WHERE prompt_id = NEW.prompt_id;

    IF current_count >= 50 THEN
      RAISE EXCEPTION 'Un prompt ne peut pas avoir plus de 50 variables (actuel: %)', 
        current_count
      USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Attacher le trigger pour validation du nombre de variables
CREATE TRIGGER validate_variables_count_trigger
  BEFORE INSERT OR UPDATE ON public.variables
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_variables_count();