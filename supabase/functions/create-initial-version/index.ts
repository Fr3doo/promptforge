import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VersionVariable {
  name: string;
  type: string;
  required: boolean;
  default_value: string;
  help: string;
  pattern: string;
  options: string[];
  order_index: number;
}

interface CreateVersionRequest {
  prompt_id: string;
  content: string;
  semver: string;
  message: string;
  variables: VersionVariable[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Non authentifié' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: CreateVersionRequest = await req.json();
    const { prompt_id, content, semver, message, variables } = body;

    console.log('Creating initial version:', { 
      prompt_id, 
      semver, 
      variablesCount: variables.length 
    });

    // Verify user owns the prompt
    const { data: prompt, error: promptError } = await supabaseClient
      .from('prompts')
      .select('owner_id, version')
      .eq('id', prompt_id)
      .single();

    if (promptError || !prompt) {
      console.error('Prompt not found:', promptError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Prompt non trouvé' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (prompt.owner_id !== user.id) {
      console.error('User does not own prompt:', { 
        userId: user.id, 
        ownerId: prompt.owner_id 
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Non autorisé' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if version already exists
    const { data: existingVersion } = await supabaseClient
      .from('versions')
      .select('id')
      .eq('prompt_id', prompt_id)
      .eq('semver', semver)
      .maybeSingle();

    if (existingVersion) {
      console.log('Version already exists, skipping creation');
      return new Response(
        JSON.stringify({ 
          success: true, 
          version: existingVersion,
          skipped: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create version with transaction-like behavior
    const { data: newVersion, error: versionError } = await supabaseClient
      .from('versions')
      .insert({
        prompt_id,
        content,
        semver,
        message,
        variables: variables || [],
      })
      .select()
      .single();

    if (versionError) {
      console.error('Failed to create version:', versionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Échec de création de la version',
          details: versionError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update prompt version if needed
    if (prompt.version !== semver) {
      const { error: updateError } = await supabaseClient
        .from('prompts')
        .update({ version: semver })
        .eq('id', prompt_id);

      if (updateError) {
        console.error('Failed to update prompt version:', updateError);
        // Don't fail the entire operation, version is created
        // Log for later retry
      }
    }

    console.log('Initial version created successfully:', { 
      versionId: newVersion.id, 
      semver 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        version: newVersion 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
