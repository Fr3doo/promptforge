-- Add public_permission column to prompts table
ALTER TABLE public.prompts 
ADD COLUMN public_permission sharing_permission NOT NULL DEFAULT 'READ';

-- Update RLS policy for prompts UPDATE to include public write permission
DROP POLICY IF EXISTS "Users can update own prompts or shared with write permission" ON public.prompts;

CREATE POLICY "Users can update own prompts or shared with write permission"
ON public.prompts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = owner_id 
  OR (visibility = 'SHARED' AND status = 'PUBLISHED' AND public_permission = 'WRITE')
  OR EXISTS (
    SELECT 1 FROM prompt_shares
    WHERE prompt_shares.prompt_id = prompts.id
      AND prompt_shares.shared_with_user_id = auth.uid()
      AND prompt_shares.permission = 'WRITE'
  )
);

-- Update RLS policy for variables to include public write permission
DROP POLICY IF EXISTS "Users can manage variables for owned or write-shared prompts" ON public.variables;

CREATE POLICY "Users can manage variables for owned or write-shared prompts"
ON public.variables
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = variables.prompt_id
      AND (
        prompts.owner_id = auth.uid()
        OR (prompts.visibility = 'SHARED' AND prompts.status = 'PUBLISHED' AND prompts.public_permission = 'WRITE')
        OR EXISTS (
          SELECT 1 FROM prompt_shares
          WHERE prompt_shares.prompt_id = prompts.id
            AND prompt_shares.shared_with_user_id = auth.uid()
            AND prompt_shares.permission = 'WRITE'
        )
      )
  )
);