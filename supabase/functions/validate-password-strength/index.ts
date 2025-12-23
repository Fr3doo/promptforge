import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Edge Function: validate-password-strength
 * 
 * Valide la force d'un mot de passe côté serveur avec scoring par regex.
 * Responsabilité unique : calculer un score de complexité et retourner des feedbacks.
 * 
 * Score (0-6) :
 * - +1 : longueur ≥ 8
 * - +1 : longueur ≥ 12
 * - +1 : au moins 1 majuscule
 * - +1 : au moins 1 minuscule
 * - +1 : au moins 1 chiffre
 * - +1 : au moins 1 caractère spécial
 * - -2 : contient un pattern commun (password, 123456, etc.)
 * 
 * @security
 * - Le mot de passe n'est JAMAIS loggé
 * - Fonction publique (verify_jwt = false) car appelée avant signup
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidatePasswordRequest {
  password: string;
}

interface ValidatePasswordResponse {
  isValid: boolean;
  score: number;
  maxScore: number;
  feedback: string[];
}

// Patterns communs à éviter (en lowercase pour comparaison)
const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', 'azerty', 
  'admin', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'login', 'passw0rd',
  '12345678', '123456789', '1234567890',
  'abc123', 'iloveyou', 'sunshine', 'princess'
];

// Score minimum requis
const MIN_SCORE = 4;

/**
 * Calcule le score de force du mot de passe
 * KISS : règles simples avec regex, pas de bibliothèque complexe
 */
function calculatePasswordStrength(password: string): ValidatePasswordResponse {
  let score = 0;
  const feedback: string[] = [];
  const maxScore = 6;

  // Longueur ≥ 8
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('addLength');
  }

  // Longueur ≥ 12 (bonus)
  if (password.length >= 12) {
    score += 1;
  } else if (password.length >= 8) {
    feedback.push('addMoreLength');
  }

  // Au moins 1 majuscule
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('addUppercase');
  }

  // Au moins 1 minuscule
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('addLowercase');
  }

  // Au moins 1 chiffre
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('addNumber');
  }

  // Au moins 1 caractère spécial
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    score += 1;
  } else {
    feedback.push('addSpecial');
  }

  // Pénalité : patterns communs (-2)
  const lowerPassword = password.toLowerCase();
  const hasCommonPattern = COMMON_PATTERNS.some(pattern => 
    lowerPassword.includes(pattern)
  );
  if (hasCommonPattern) {
    score = Math.max(0, score - 2);
    feedback.unshift('avoidCommon'); // En premier car critique
  }

  console.log(`[validate-password-strength] Score: ${score}/${maxScore}, Valid: ${score >= MIN_SCORE}`);

  return {
    isValid: score >= MIN_SCORE,
    score,
    maxScore,
    feedback: score >= MIN_SCORE ? [] : feedback, // Pas de feedback si valide
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json() as ValidatePasswordRequest;

    // Validation de l'entrée (sans logger le mot de passe !)
    if (!password || typeof password !== 'string') {
      console.warn('[validate-password-strength] Invalid request: missing password');
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calcul du score de force
    const result = calculatePasswordStrength(password);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[validate-password-strength] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to validate password strength', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
