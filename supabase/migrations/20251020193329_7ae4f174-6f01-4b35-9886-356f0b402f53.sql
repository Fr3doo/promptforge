-- Add status column to prompts table to support draft/published workflow
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prompt_status') THEN
    CREATE TYPE prompt_status AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
END $$;

-- Add status column with default PUBLISHED for existing prompts
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS status prompt_status DEFAULT 'PUBLISHED';

-- Update existing prompts to be PUBLISHED
UPDATE prompts SET status = 'PUBLISHED' WHERE status IS NULL;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);

-- Update RLS policies to handle draft prompts
-- Drop old policy if exists and recreate
DROP POLICY IF EXISTS "Users can view own prompts and shared prompts" ON prompts;

CREATE POLICY "Users can view own prompts and shared prompts" 
ON prompts 
FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR 
  (visibility = 'SHARED' AND status = 'PUBLISHED')
);

-- Comment explaining the change
COMMENT ON COLUMN prompts.status IS 'Status of the prompt: DRAFT for work in progress, PUBLISHED for finalized prompts';