import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { promptContent } = await req.json();

    if (!promptContent || typeof promptContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Le contenu du prompt est requis' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    const systemPrompt = `Tu es un expert en ingénierie de prompts. 
Ton rôle est d'analyser des prompts et d'en extraire :
- Les sections réutilisables (contexte, rôle, instructions, format de sortie, contraintes)
- Les variables paramétrables à transformer en {{variable}}
- Les métadonnées structurées (rôle, objectifs, étapes, critères)

Tu dois identifier intelligemment :
- Les parties fixes vs. variables
- Les patterns répétitifs qui peuvent devenir des variables
- La structure logique du prompt
- Les informations clés pour les métadonnées`;

    const userPrompt = `Analyse ce prompt et structure-le :

${promptContent}

Extrait :
1. Les sections principales (contexte, rôle, instructions, etc.)
2. Les variables à paramétrer (remplace les valeurs spécifiques par {{nom_variable}})
3. Les métadonnées (rôle, objectifs principaux, étapes clés, critères de qualité)`;

    console.log('Appel Lovable AI pour analyse du prompt...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "structure_prompt",
              description: "Structure un prompt avec ses sections, variables et métadonnées",
              parameters: {
                type: "object",
                properties: {
                  sections: {
                    type: "object",
                    properties: {
                      contexte: { type: "string", description: "Contexte général du prompt" },
                      role: { type: "string", description: "Rôle assigné à l'IA" },
                      instructions: { type: "string", description: "Instructions principales" },
                      format: { type: "string", description: "Format de sortie attendu" },
                      contraintes: { type: "string", description: "Contraintes et limitations" }
                    },
                    description: "Sections structurées du prompt"
                  },
                  variables: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nom de la variable" },
                        description: { type: "string", description: "Description de la variable" },
                        type: { type: "string", enum: ["STRING", "NUMBER", "ENUM", "DATE", "MULTISTRING"] },
                        default_value: { type: "string", description: "Valeur par défaut" },
                        options: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Options possibles pour ENUM"
                        }
                      },
                      required: ["name", "description", "type"]
                    },
                    description: "Variables détectées dans le prompt"
                  },
                  prompt_template: {
                    type: "string",
                    description: "Prompt restructuré avec les variables {{nom}}"
                  },
                  metadata: {
                    type: "object",
                    properties: {
                      role: { type: "string", description: "Rôle principal de l'IA" },
                      objectifs: {
                        type: "array",
                        items: { type: "string" },
                        description: "Objectifs principaux du prompt"
                      },
                      etapes: {
                        type: "array",
                        items: { type: "string" },
                        description: "Étapes clés d'exécution"
                      },
                      criteres: {
                        type: "array",
                        items: { type: "string" },
                        description: "Critères de qualité attendus"
                      },
                      categories: {
                        type: "array",
                        items: { type: "string" },
                        description: "Catégories/tags suggérés"
                      }
                    },
                    required: ["role", "objectifs"]
                  }
                },
                required: ["sections", "variables", "prompt_template", "metadata"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "structure_prompt" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de taux dépassée, réessayez plus tard" }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants, ajoutez des crédits à votre workspace" }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Erreur Lovable AI:', response.status, errorText);
      throw new Error(`Erreur Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    console.log('Réponse Lovable AI reçue');

    // Extraire les arguments du tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('Aucun résultat structuré reçu de l\'IA');
    }

    const structuredData = JSON.parse(toolCall.function.arguments);

    // Générer le JSON et Markdown
    const jsonOutput = {
      version: "1.0",
      created_at: new Date().toISOString(),
      original_prompt: promptContent,
      ...structuredData
    };

    const markdownOutput = generateMarkdown(structuredData, promptContent);

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        exports: {
          json: jsonOutput,
          markdown: markdownOutput
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur dans analyze-prompt:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateMarkdown(data: any, originalPrompt: string): string {
  let md = `# Prompt Structuré\n\n`;
  
  // Métadonnées
  md += `## 📋 Métadonnées\n\n`;
  md += `**Rôle:** ${data.metadata.role}\n\n`;
  
  if (data.metadata.objectifs?.length > 0) {
    md += `**Objectifs:**\n`;
    data.metadata.objectifs.forEach((obj: string) => {
      md += `- ${obj}\n`;
    });
    md += `\n`;
  }
  
  if (data.metadata.etapes?.length > 0) {
    md += `**Étapes:**\n`;
    data.metadata.etapes.forEach((step: string, i: number) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += `\n`;
  }
  
  if (data.metadata.criteres?.length > 0) {
    md += `**Critères de qualité:**\n`;
    data.metadata.criteres.forEach((crit: string) => {
      md += `- ${crit}\n`;
    });
    md += `\n`;
  }
  
  if (data.metadata.categories?.length > 0) {
    md += `**Tags:** ${data.metadata.categories.join(', ')}\n\n`;
  }
  
  // Sections
  md += `## 📝 Sections\n\n`;
  Object.entries(data.sections).forEach(([key, value]) => {
    if (value) {
      md += `### ${key.charAt(0).toUpperCase() + key.slice(1)}\n\n${value}\n\n`;
    }
  });
  
  // Variables
  if (data.variables?.length > 0) {
    md += `## 🎨 Variables\n\n`;
    data.variables.forEach((variable: any) => {
      md += `### {{${variable.name}}}\n\n`;
      md += `- **Type:** ${variable.type}\n`;
      md += `- **Description:** ${variable.description}\n`;
      if (variable.default_value) {
        md += `- **Valeur par défaut:** ${variable.default_value}\n`;
      }
      if (variable.options?.length > 0) {
        md += `- **Options:** ${variable.options.join(', ')}\n`;
      }
      md += `\n`;
    });
  }
  
  // Template
  md += `## 🔧 Template\n\n\`\`\`\n${data.prompt_template}\n\`\`\`\n\n`;
  
  // Prompt original
  md += `## 📄 Prompt original\n\n\`\`\`\n${originalPrompt}\n\`\`\`\n`;
  
  return md;
}
