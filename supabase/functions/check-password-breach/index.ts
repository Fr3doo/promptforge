import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Edge Function: check-password-breach
 * 
 * Vérifie si un mot de passe est compromis via l'API HaveIBeenPwned
 * Utilise le protocole k-anonymity : seuls les 5 premiers caractères du hash SHA-1
 * sont envoyés, préservant la confidentialité du mot de passe.
 * 
 * @security
 * - Le mot de passe n'est JAMAIS loggé
 * - Le mot de passe n'est JAMAIS transmis à HIBP (seulement 5 chars du hash)
 * - Fonction publique (verify_jwt = false) car appelée avant signup
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckPasswordRequest {
  password: string;
}

interface CheckPasswordResponse {
  isBreached: boolean;
  breachCount?: number;
}

/**
 * Calcule le hash SHA-1 d'une chaîne
 * Utilisé pour le protocole k-anonymity de HIBP
 */
async function sha1Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Vérifie si un mot de passe est compromis via HIBP k-anonymity
 * 
 * 1. Calcule SHA-1(password)
 * 2. Envoie les 5 premiers caractères à HIBP
 * 3. Compare le suffixe avec les résultats retournés
 */
async function checkPasswordBreach(password: string): Promise<CheckPasswordResponse> {
  // Calcul du hash SHA-1
  const hash = await sha1Hash(password);
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  console.log(`[check-password-breach] Checking hash prefix: ${prefix}...`);

  // Appel à l'API HIBP avec k-anonymity
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      'User-Agent': 'PromptForge-PasswordCheck',
      'Add-Padding': 'true', // Protection contre le timing attack
    },
  });

  if (!response.ok) {
    console.error(`[check-password-breach] HIBP API error: ${response.status}`);
    throw new Error(`HIBP API error: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split('\n');

  // Recherche du suffixe dans les résultats
  for (const line of lines) {
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix.trim() === suffix) {
      const breachCount = parseInt(count.trim(), 10);
      console.log(`[check-password-breach] Password found in ${breachCount} breaches`);
      return { isBreached: true, breachCount };
    }
  }

  console.log('[check-password-breach] Password not found in breaches');
  return { isBreached: false };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json() as CheckPasswordRequest;

    // Validation de l'entrée (sans logger le mot de passe !)
    if (!password || typeof password !== 'string') {
      console.warn('[check-password-breach] Invalid request: missing password');
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (password.length < 6) {
      console.warn('[check-password-breach] Password too short');
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérification via HIBP
    const result = await checkPasswordBreach(password);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[check-password-breach] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Failed to check password', details: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
