-- Migration: Add server-side validation constraints for variables table
-- Phase 1: Column CHECK constraints

-- 1. Contrainte sur la longueur du nom (1-100 caractères)
ALTER TABLE public.variables
  ADD CONSTRAINT variables_name_length 
  CHECK (char_length(name) BETWEEN 1 AND 100);

-- 2. Contrainte sur le format du nom (a-zA-Z0-9_)
-- Exclut les tirets pour correspondre au regex frontend strict
ALTER TABLE public.variables
  ADD CONSTRAINT variables_name_format
  CHECK (name ~ '^[a-zA-Z0-9_]+$');

-- 3. Contrainte sur la longueur de default_value (≤ 1000 caractères)
ALTER TABLE public.variables
  ADD CONSTRAINT variables_default_value_length
  CHECK (char_length(COALESCE(default_value, '')) <= 1000);

-- 4. Contrainte sur la longueur de help (≤ 500 caractères)
ALTER TABLE public.variables
  ADD CONSTRAINT variables_help_length
  CHECK (char_length(COALESCE(help, '')) <= 500);

-- 5. Contrainte sur la longueur de pattern (≤ 200 caractères)
ALTER TABLE public.variables
  ADD CONSTRAINT variables_pattern_length
  CHECK (char_length(COALESCE(pattern, '')) <= 200);

-- Phase 2: Triggers for complex validations

-- Fonction de validation des options ENUM
CREATE OR REPLACE FUNCTION public.validate_variable_options()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier le nombre d'options (≤ 50)
  IF NEW.options IS NOT NULL AND array_length(NEW.options, 1) > 50 THEN
    RAISE EXCEPTION 'Le nombre d''options ne peut pas dépasser 50 (actuel: %)', 
      array_length(NEW.options, 1)
    USING ERRCODE = '23514';  -- check_violation
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
$$ LANGUAGE plpgsql;

-- Attacher le trigger pour validation des options
CREATE TRIGGER validate_variable_options_trigger
  BEFORE INSERT OR UPDATE ON public.variables
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_variable_options();

-- Fonction de validation du nombre de variables par prompt
CREATE OR REPLACE FUNCTION public.validate_variables_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Attacher le trigger pour validation du nombre de variables
CREATE TRIGGER validate_variables_count_trigger
  BEFORE INSERT OR UPDATE ON public.variables
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_variables_count();