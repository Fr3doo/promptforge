-- ============================================
-- DURCISSEMENT RLS COMPLET : public → authenticated
-- Migre 18 policies sur 7 tables
-- ============================================

-- 1. TABLE: prompt_shares (2 policies)
-- ============================================
DROP POLICY IF EXISTS "Owner or share creator can delete shares" ON public.prompt_shares;
CREATE POLICY "Owner or share creator can delete shares"
ON public.prompt_shares FOR DELETE TO authenticated
USING ((auth.uid() = shared_by) OR (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = prompt_shares.prompt_id AND prompts.owner_id = auth.uid()
)));

DROP POLICY IF EXISTS "Owner or share creator can update shares" ON public.prompt_shares;
CREATE POLICY "Owner or share creator can update shares"
ON public.prompt_shares FOR UPDATE TO authenticated
USING ((auth.uid() = shared_by) OR (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = prompt_shares.prompt_id AND prompts.owner_id = auth.uid()
)))
WITH CHECK ((auth.uid() = shared_by) OR (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = prompt_shares.prompt_id AND prompts.owner_id = auth.uid()
)));

-- 2. TABLE: prompt_usage (4 policies - le deny reste sur anon)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own usage" ON public.prompt_usage;
CREATE POLICY "Users can view their own usage"
ON public.prompt_usage FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON public.prompt_usage;
CREATE POLICY "Users can insert their own usage"
ON public.prompt_usage FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON public.prompt_usage;
CREATE POLICY "Users can update their own usage"
ON public.prompt_usage FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own usage" ON public.prompt_usage;
CREATE POLICY "Users can delete their own usage"
ON public.prompt_usage FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3. TABLE: prompts (2 policies)
-- ============================================
DROP POLICY IF EXISTS "Users can create their own prompts" ON public.prompts;
CREATE POLICY "Users can create their own prompts"
ON public.prompts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own prompts" ON public.prompts;
CREATE POLICY "Users can delete their own prompts"
ON public.prompts FOR DELETE TO authenticated
USING (auth.uid() = owner_id);

-- 4. TABLE: user_roles (2 policies)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- 5. TABLE: variable_sets (2 policies)
-- ============================================
DROP POLICY IF EXISTS "Variable sets inherit prompt permissions for select" ON public.variable_sets;
CREATE POLICY "Variable sets inherit prompt permissions for select"
ON public.variable_sets FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = variable_sets.prompt_id 
    AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED'::visibility)
));

DROP POLICY IF EXISTS "Users can manage variable sets for their prompts" ON public.variable_sets;
CREATE POLICY "Users can manage variable sets for their prompts"
ON public.variable_sets FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = variable_sets.prompt_id AND prompts.owner_id = auth.uid()
));

-- 6. TABLE: variables (1 policy)
-- ============================================
DROP POLICY IF EXISTS "Variables inherit prompt permissions for select" ON public.variables;
CREATE POLICY "Variables inherit prompt permissions for select"
ON public.variables FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = variables.prompt_id 
    AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED'::visibility)
));

-- 7. TABLE: versions (4 policies)
-- ============================================
DROP POLICY IF EXISTS "Users can view versions of accessible prompts" ON public.versions;
CREATE POLICY "Users can view versions of accessible prompts"
ON public.versions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = versions.prompt_id 
    AND (prompts.owner_id = auth.uid() 
      OR (prompts.visibility = 'SHARED'::visibility AND prompts.status = 'PUBLISHED'::prompt_status)
      OR EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_shares.prompt_id = prompts.id AND prompt_shares.shared_with_user_id = auth.uid()))
));

DROP POLICY IF EXISTS "Users can create versions with write permission" ON public.versions;
CREATE POLICY "Users can create versions with write permission"
ON public.versions FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = versions.prompt_id 
    AND (prompts.owner_id = auth.uid() 
      OR (prompts.visibility = 'SHARED'::visibility AND prompts.status = 'PUBLISHED'::prompt_status AND prompts.public_permission = 'WRITE'::sharing_permission)
      OR EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_shares.prompt_id = prompts.id AND prompt_shares.shared_with_user_id = auth.uid() AND prompt_shares.permission = 'WRITE'::sharing_permission))
));

DROP POLICY IF EXISTS "Users can update versions with write permission" ON public.versions;
CREATE POLICY "Users can update versions with write permission"
ON public.versions FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = versions.prompt_id 
    AND (prompts.owner_id = auth.uid() 
      OR (prompts.visibility = 'SHARED'::visibility AND prompts.status = 'PUBLISHED'::prompt_status AND prompts.public_permission = 'WRITE'::sharing_permission)
      OR EXISTS (SELECT 1 FROM prompt_shares WHERE prompt_shares.prompt_id = prompts.id AND prompt_shares.shared_with_user_id = auth.uid() AND prompt_shares.permission = 'WRITE'::sharing_permission))
));

DROP POLICY IF EXISTS "Only owners can delete versions" ON public.versions;
CREATE POLICY "Only owners can delete versions"
ON public.versions FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM prompts 
  WHERE prompts.id = versions.prompt_id AND prompts.owner_id = auth.uid()
));