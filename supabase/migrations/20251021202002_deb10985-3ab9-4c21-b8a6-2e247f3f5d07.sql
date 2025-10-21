-- Migration: Ajout de contraintes d'intégrité sur la table variables
-- Objectif: Renforcer l'intégrité des données et prévenir les doublons

-- 1. Ajouter une contrainte d'unicité sur (prompt_id, name)
-- Empêche la création de variables avec le même nom pour un même prompt
ALTER TABLE public.variables 
ADD CONSTRAINT unique_variable_name_per_prompt 
UNIQUE (prompt_id, name);

-- 2. Ajouter une contrainte de clé étrangère vers prompts avec cascade
-- Assure que les variables sont automatiquement supprimées si le prompt est supprimé
ALTER TABLE public.variables
DROP CONSTRAINT IF EXISTS variables_prompt_id_fkey;

ALTER TABLE public.variables
ADD CONSTRAINT variables_prompt_id_fkey
FOREIGN KEY (prompt_id) 
REFERENCES public.prompts(id)
ON DELETE CASCADE;

-- Note: Cette migration garantit:
-- - Pas de doublons de noms de variables pour un même prompt
-- - Suppression automatique des variables orphelines
-- - Intégrité référentielle stricte