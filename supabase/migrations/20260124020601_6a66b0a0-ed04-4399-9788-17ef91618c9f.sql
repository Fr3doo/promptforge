-- ============================================
-- Table de quotas d'analyse AI par utilisateur
-- ============================================
CREATE TABLE public.analysis_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Compteurs minute (fenêtre glissante)
  minute_count integer NOT NULL DEFAULT 0,
  minute_reset_at timestamptz NOT NULL DEFAULT (now() + interval '1 minute'),
  
  -- Compteurs jour (reset à minuit UTC)
  daily_count integer NOT NULL DEFAULT 0,
  daily_reset_at timestamptz NOT NULL DEFAULT (date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day'),
  
  -- Métadonnées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les lookups par user_id (performance)
CREATE INDEX idx_analysis_quotas_user_id ON public.analysis_quotas(user_id);

-- Index pour le cleanup des entrées expirées
CREATE INDEX idx_analysis_quotas_daily_reset ON public.analysis_quotas(daily_reset_at);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.analysis_quotas ENABLE ROW LEVEL SECURITY;

-- Deny anonymous access
CREATE POLICY "Deny anonymous access to analysis_quotas"
  ON public.analysis_quotas FOR ALL
  TO anon
  USING (false);

-- Users can view and update their own quotas
CREATE POLICY "Users can manage their own quotas"
  ON public.analysis_quotas FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Trigger pour updated_at
-- ============================================
CREATE TRIGGER update_analysis_quotas_updated_at
  BEFORE UPDATE ON public.analysis_quotas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Commentaires
-- ============================================
COMMENT ON TABLE public.analysis_quotas IS 'Quotas d''analyse AI par utilisateur (persistant, remplace le rate limiting in-memory)';
COMMENT ON COLUMN public.analysis_quotas.minute_count IS 'Nombre de requêtes dans la fenêtre minute actuelle';
COMMENT ON COLUMN public.analysis_quotas.minute_reset_at IS 'Timestamp de reset de la fenêtre minute';
COMMENT ON COLUMN public.analysis_quotas.daily_count IS 'Nombre de requêtes dans la journée actuelle';
COMMENT ON COLUMN public.analysis_quotas.daily_reset_at IS 'Timestamp de reset journalier (minuit UTC)';