-- Create enum for sharing permissions
CREATE TYPE public.sharing_permission AS ENUM ('READ', 'WRITE');

-- Create table for prompt sharing
CREATE TABLE public.prompt_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL,
  permission public.sharing_permission NOT NULL DEFAULT 'READ',
  shared_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(prompt_id, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.prompt_shares ENABLE ROW LEVEL SECURITY;

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to prompt_shares"
ON public.prompt_shares
FOR ALL
TO anon
USING (false);

-- Users can view shares they created or received
CREATE POLICY "Users can view their shares"
ON public.prompt_shares
FOR SELECT
TO authenticated
USING (
  auth.uid() = shared_with_user_id OR 
  auth.uid() = shared_by
);

-- Prompt owners can create shares
CREATE POLICY "Owners can create shares"
ON public.prompt_shares
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_id AND prompts.owner_id = auth.uid()
  )
);

-- Owners can delete shares
CREATE POLICY "Owners can delete shares"
ON public.prompt_shares
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_id AND prompts.owner_id = auth.uid()
  )
);

-- Owners can update shares
CREATE POLICY "Owners can update shares"
ON public.prompt_shares
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = prompt_id AND prompts.owner_id = auth.uid()
  )
);

-- Update prompts RLS policy for SELECT to include shared prompts
DROP POLICY IF EXISTS "Users can view own prompts and shared prompts" ON public.prompts;

CREATE POLICY "Users can view own and shared prompts"
ON public.prompts
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id OR
  (visibility = 'SHARED'::visibility AND status = 'PUBLISHED'::prompt_status) OR
  EXISTS (
    SELECT 1 FROM public.prompt_shares
    WHERE prompt_shares.prompt_id = prompts.id 
    AND prompt_shares.shared_with_user_id = auth.uid()
  )
);

-- Update prompts RLS policy for UPDATE to allow users with WRITE permission
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;

CREATE POLICY "Users can update own prompts or shared with write permission"
ON public.prompts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 FROM public.prompt_shares
    WHERE prompt_shares.prompt_id = prompts.id 
    AND prompt_shares.shared_with_user_id = auth.uid()
    AND prompt_shares.permission = 'WRITE'
  )
);

-- Variables should be editable by users with WRITE permission
DROP POLICY IF EXISTS "Users can manage variables for their prompts" ON public.variables;

CREATE POLICY "Users can manage variables for owned or write-shared prompts"
ON public.variables
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompts
    WHERE prompts.id = variables.prompt_id 
    AND (
      prompts.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.prompt_shares
        WHERE prompt_shares.prompt_id = prompts.id 
        AND prompt_shares.shared_with_user_id = auth.uid()
        AND prompt_shares.permission = 'WRITE'
      )
    )
  )
);