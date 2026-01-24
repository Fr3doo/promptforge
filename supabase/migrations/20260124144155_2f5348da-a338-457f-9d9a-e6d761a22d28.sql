-- Correction des politiques RLS sur variables et variable_sets
-- Aligner sur le pattern sécurisé de la table versions

-- ============================================
-- PHASE 1: Corriger la policy sur variables
-- ============================================

-- Supprimer l'ancienne policy trop permissive
DROP POLICY IF EXISTS "Variables inherit prompt permissions for select" ON public.variables;

-- Créer la nouvelle policy alignée sur versions
CREATE POLICY "Variables inherit prompt permissions for select"
ON public.variables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.prompts
    WHERE prompts.id = variables.prompt_id
    AND (
      -- Propriétaire du prompt
      prompts.owner_id = auth.uid()
      -- OU prompt publié ET partagé publiquement
      OR (
        prompts.visibility = 'SHARED'::visibility
        AND prompts.status = 'PUBLISHED'::prompt_status
      )
      -- OU partage explicite via prompt_shares
      OR EXISTS (
        SELECT 1 FROM public.prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id
        AND prompt_shares.shared_with_user_id = auth.uid()
      )
    )
  )
);

-- ============================================
-- PHASE 2: Corriger la policy sur variable_sets
-- ============================================

-- Supprimer l'ancienne policy trop permissive
DROP POLICY IF EXISTS "Variable sets inherit prompt permissions for select" ON public.variable_sets;

-- Créer la nouvelle policy alignée sur versions
CREATE POLICY "Variable sets inherit prompt permissions for select"
ON public.variable_sets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.prompts
    WHERE prompts.id = variable_sets.prompt_id
    AND (
      -- Propriétaire du prompt
      prompts.owner_id = auth.uid()
      -- OU prompt publié ET partagé publiquement
      OR (
        prompts.visibility = 'SHARED'::visibility
        AND prompts.status = 'PUBLISHED'::prompt_status
      )
      -- OU partage explicite via prompt_shares
      OR EXISTS (
        SELECT 1 FROM public.prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id
        AND prompt_shares.shared_with_user_id = auth.uid()
      )
    )
  )
);