-- Create analysis_history table for tracking analysis usage over time
CREATE TABLE public.analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  prompt_length integer NOT NULL,
  success boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index for queries by user and date
CREATE INDEX idx_analysis_history_user_date 
  ON analysis_history(user_id, analyzed_at DESC);

-- Enable RLS
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view their own analysis history"
  ON analysis_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert their own analysis history"
  ON analysis_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Revoke anonymous access
REVOKE ALL ON analysis_history FROM anon;