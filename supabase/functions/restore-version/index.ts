import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schéma de validation pour la requête
const restoreRequestSchema = z.object({
  versionId: z.string().uuid({ message: "versionId doit être un UUID valide" }),
  promptId: z.string().uuid({ message: "promptId doit être un UUID valide" }),
});

// Schéma de validation pour une variable
const variableSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  default_value: z.string().optional().nullable(),
  required: z.boolean().optional(),
  order_index: z.number().optional(),
  pattern: z.string().optional().nullable(),
  options: z.array(z.string()).optional().nullable(),
  help: z.string().optional().nullable(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser le client Supabase avec le token de l'utilisateur
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Autorisation requise");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Parser et valider le body
    const body = await req.json();
    const { versionId, promptId } = restoreRequestSchema.parse(body);

    console.log("[restore-version] Début restauration", { versionId, promptId });

    // Vérifier que l'utilisateur a accès au prompt
    const { data: prompt, error: promptError } = await supabaseClient
      .from('prompts')
      .select('id, owner_id')
      .eq('id', promptId)
      .single();

    if (promptError || !prompt) {
      console.error("[restore-version] Prompt non trouvé", { promptId, error: promptError });
      throw new Error("Prompt non trouvé ou accès refusé");
    }

    // Récupérer la version
    const { data: version, error: versionError } = await supabaseClient
      .from('versions')
      .select('*')
      .eq('id', versionId)
      .eq('prompt_id', promptId)
      .single();

    if (versionError || !version) {
      console.error("[restore-version] Version non trouvée", { versionId, error: versionError });
      throw new Error("Version non trouvée");
    }

    console.log("[restore-version] Version récupérée", { 
      semver: version.semver, 
      contentLength: version.content.length 
    });

    // Valider le format du champ variables
    let validatedVariables: any[] = [];
    if (version.variables) {
      if (!Array.isArray(version.variables)) {
        console.error("[restore-version] Format variables invalide", { 
          type: typeof version.variables 
        });
        throw new Error(
          "Le champ 'variables' de la version doit être un tableau. " +
          `Type reçu: ${typeof version.variables}`
        );
      }

      // Valider chaque variable
      try {
        validatedVariables = version.variables.map((v: any, index: number) => {
          try {
            return variableSchema.parse(v);
          } catch (err) {
            console.error("[restore-version] Variable invalide", { index, variable: v, error: err });
            throw new Error(
              `Variable à l'index ${index} invalide: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        });
      } catch (validationError) {
        throw validationError;
      }

      console.log("[restore-version] Variables validées", { count: validatedVariables.length });
    }

    // Utiliser une transaction PostgreSQL via RPC
    // Créer la fonction RPC si elle n'existe pas déjà
    const transactionQuery = `
      DO $$
      DECLARE
        v_content TEXT := $1;
        v_semver TEXT := $2;
        v_prompt_id UUID := $3;
      BEGIN
        -- Mettre à jour le prompt
        UPDATE prompts 
        SET content = v_content,
            version = v_semver,
            updated_at = NOW()
        WHERE id = v_prompt_id;

        -- Supprimer les anciennes variables
        DELETE FROM variables WHERE prompt_id = v_prompt_id;

        -- Les variables seront insérées séparément car JSONB to records
        -- est plus simple à gérer côté application
      END $$;
    `;

    // Exécuter la mise à jour du prompt
    const { error: updateError } = await supabaseClient
      .from('prompts')
      .update({ 
        content: version.content,
        version: version.semver,
      })
      .eq('id', promptId);

    if (updateError) {
      console.error("[restore-version] Erreur mise à jour prompt", { 
        promptId, 
        error: updateError 
      });
      throw new Error(`Échec de la mise à jour du prompt: ${updateError.message}`);
    }

    console.log("[restore-version] Prompt mis à jour", { semver: version.semver });

    // Supprimer les anciennes variables
    const { error: deleteError } = await supabaseClient
      .from('variables')
      .delete()
      .eq('prompt_id', promptId);

    if (deleteError) {
      console.error("[restore-version] Erreur suppression variables", { 
        promptId, 
        error: deleteError 
      });
      // Tenter de restaurer l'ancien état du prompt
      throw new Error(`Échec de la suppression des variables: ${deleteError.message}`);
    }

    console.log("[restore-version] Variables supprimées");

    // Insérer les nouvelles variables si présentes
    if (validatedVariables.length > 0) {
      const variablesToInsert = validatedVariables.map(v => ({
        ...v,
        prompt_id: promptId,
        // Enlever les champs qui pourraient avoir des id d'une autre version
        id: undefined,
        created_at: undefined,
      }));

      const { error: insertError } = await supabaseClient
        .from('variables')
        .insert(variablesToInsert);

      if (insertError) {
        console.error("[restore-version] Erreur insertion variables", { 
          promptId, 
          count: variablesToInsert.length,
          error: insertError 
        });
        throw new Error(`Échec de l'insertion des variables: ${insertError.message}`);
      }

      console.log("[restore-version] Variables insérées", { count: variablesToInsert.length });
    }

    console.log("[restore-version] Restauration réussie", { 
      versionId, 
      promptId, 
      semver: version.semver 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: {
          id: version.id,
          semver: version.semver,
          content: version.content,
          variablesCount: validatedVariables.length,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("[restore-version] Erreur", { error });
    
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    const statusCode = errorMessage.includes("non trouvé") || errorMessage.includes("accès refusé") 
      ? 404 
      : errorMessage.includes("UUID valide") || errorMessage.includes("invalide")
      ? 400
      : 500;

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: error instanceof z.ZodError ? error.errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode
      }
    );
  }
});
