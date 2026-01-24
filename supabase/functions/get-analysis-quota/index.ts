import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Limites de quota d'analyse - identiques à analyze-prompt
 */
const QUOTA_LIMITS = {
  MAX_PER_MINUTE: 10,
  MAX_PER_DAY: 50,
} as const;

/**
 * Edge Function pour récupérer les quotas d'analyse restants
 * 
 * Retourne les compteurs actuels et limites pour affichage UI proactif
 * Permet aux utilisateurs de voir leurs quotas AVANT d'être bloqués
 * 
 * @returns {AnalysisQuota} Quotas restants et limites
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Vérification de l'authentification (pattern identique à analyze-prompt)
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7).trim() 
    : authHeader.trim();

  // Strict JWT validation to reject invalid values
  if (!jwt || jwt === "" || jwt === "undefined" || jwt === "null") {
    console.warn("[get-analysis-quota] Missing or invalid Authorization header");
    return new Response(
      JSON.stringify({ error: "Non authentifié" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    }
  );

  // Valider le JWT et récupérer l'utilisateur (avec le token comme paramètre)
  console.log(`[get-analysis-quota] JWT received: ${jwt.substring(0, 20)}...${jwt.slice(-10)} (length: ${jwt.length})`);
  
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
  
  if (authError || !user) {
    console.warn("[get-analysis-quota] Invalid JWT:", {
      errorMessage: authError?.message,
      errorCode: (authError as { code?: string })?.code,
      hasUser: !!user,
      jwtLength: jwt.length,
      jwtPreview: `${jwt.substring(0, 10)}...`
    });
    return new Response(
      JSON.stringify({ error: "Session invalide" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const userId = user.id;
  const now = new Date();

  try {
    // Récupérer les quotas actuels de l'utilisateur
    const { data: quota, error: quotaError } = await supabaseClient
      .from("analysis_quotas")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Si aucune entrée (nouvel utilisateur) ou erreur PGRST116 → limites complètes
    if (quotaError?.code === "PGRST116" || !quota) {
      console.log(`[get-analysis-quota] No quota found for user ${userId}, returning full limits`);
      return new Response(
        JSON.stringify({
          minuteRemaining: QUOTA_LIMITS.MAX_PER_MINUTE,
          dailyRemaining: QUOTA_LIMITS.MAX_PER_DAY,
          minuteLimit: QUOTA_LIMITS.MAX_PER_MINUTE,
          dailyLimit: QUOTA_LIMITS.MAX_PER_DAY,
          minuteResetsAt: null,
          dailyResetsAt: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (quotaError) {
      console.error("[get-analysis-quota] Database error:", quotaError);
      // Fail-open : retourner les limites max en cas d'erreur DB
      return new Response(
        JSON.stringify({
          minuteRemaining: QUOTA_LIMITS.MAX_PER_MINUTE,
          dailyRemaining: QUOTA_LIMITS.MAX_PER_DAY,
          minuteLimit: QUOTA_LIMITS.MAX_PER_MINUTE,
          dailyLimit: QUOTA_LIMITS.MAX_PER_DAY,
          minuteResetsAt: null,
          dailyResetsAt: null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculer les quotas restants (avec reset si fenêtre expirée)
    const minuteResetAt = new Date(quota.minute_reset_at);
    const dailyResetAt = new Date(quota.daily_reset_at);

    // Si la fenêtre est expirée, considérer le compteur comme 0
    const minuteUsed = now >= minuteResetAt ? 0 : quota.minute_count;
    const dailyUsed = now >= dailyResetAt ? 0 : quota.daily_count;

    const response = {
      minuteRemaining: Math.max(0, QUOTA_LIMITS.MAX_PER_MINUTE - minuteUsed),
      dailyRemaining: Math.max(0, QUOTA_LIMITS.MAX_PER_DAY - dailyUsed),
      minuteLimit: QUOTA_LIMITS.MAX_PER_MINUTE,
      dailyLimit: QUOTA_LIMITS.MAX_PER_DAY,
      minuteResetsAt: now < minuteResetAt ? quota.minute_reset_at : null,
      dailyResetsAt: now < dailyResetAt ? quota.daily_reset_at : null,
    };

    console.log(`[get-analysis-quota] User ${userId}: ${response.dailyRemaining}/${QUOTA_LIMITS.MAX_PER_DAY} daily, ${response.minuteRemaining}/${QUOTA_LIMITS.MAX_PER_MINUTE} minute`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[get-analysis-quota] Unexpected error:", error);
    // Fail-open en cas d'erreur inattendue
    return new Response(
      JSON.stringify({
        minuteRemaining: QUOTA_LIMITS.MAX_PER_MINUTE,
        dailyRemaining: QUOTA_LIMITS.MAX_PER_DAY,
        minuteLimit: QUOTA_LIMITS.MAX_PER_MINUTE,
        dailyLimit: QUOTA_LIMITS.MAX_PER_DAY,
        minuteResetsAt: null,
        dailyResetsAt: null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
