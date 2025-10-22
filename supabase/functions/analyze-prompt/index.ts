import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// === VALIDATION (FAIL-FAST) ===
function validateInput(promptContent: unknown): string {
  if (!promptContent || typeof promptContent !== 'string') {
    throw new Error('Le contenu du prompt est requis et doit être une chaîne');
  }
  
  const trimmed = promptContent.trim();
  if (trimmed.length === 0) {
    throw new Error('Le prompt ne peut pas être vide');
  }
  
  if (trimmed.length > 50000) {
    throw new Error('Le prompt ne peut pas dépasser 50000 caractères');
  }
  
  return trimmed;
}

// Validate AI-generated response structure
function validateAIResponse(structured: any): void {
  // Validate variables array
  if (structured.variables) {
    if (!Array.isArray(structured.variables)) {
      throw new Error('Variables doit être un tableau');
    }
    
    if (structured.variables.length > 50) {
      throw new Error('Nombre maximum de variables dépassé (50)');
    }
    
    // Validate each variable
    structured.variables.forEach((v: any, index: number) => {
      if (!v.name || typeof v.name !== 'string') {
        throw new Error(`Variable ${index}: nom requis`);
      }
      
      if (v.name.length > 100) {
        throw new Error(`Variable ${v.name}: nom trop long (max 100 caractères)`);
      }
      
      // Variable names must be alphanumeric with underscores/hyphens
      if (!/^[a-zA-Z0-9_-]+$/.test(v.name)) {
        throw new Error(`Variable ${v.name}: caractères invalides (seulement a-z, A-Z, 0-9, _, -)`);
      }
      
      if (v.description && v.description.length > 500) {
        throw new Error(`Variable ${v.name}: description trop longue (max 500 caractères)`);
      }
      
      if (v.default_value && v.default_value.length > 1000) {
        throw new Error(`Variable ${v.name}: valeur par défaut trop longue (max 1000 caractères)`);
      }
      
      if (v.options && Array.isArray(v.options)) {
        if (v.options.length > 50) {
          throw new Error(`Variable ${v.name}: trop d'options (max 50)`);
        }
        v.options.forEach((opt: any) => {
          if (typeof opt === 'string' && opt.length > 100) {
            throw new Error(`Variable ${v.name}: option trop longue (max 100 caractères)`);
          }
        });
      }
    });
  }
  
  // Validate metadata
  if (structured.metadata) {
    if (structured.metadata.role && structured.metadata.role.length > 500) {
      throw new Error('Rôle trop long (max 500 caractères)');
    }
    
    if (structured.metadata.objectifs && Array.isArray(structured.metadata.objectifs)) {
      if (structured.metadata.objectifs.length > 20) {
        throw new Error('Trop d\'objectifs (max 20)');
      }
      structured.metadata.objectifs.forEach((obj: any) => {
        if (typeof obj === 'string' && obj.length > 500) {
          throw new Error('Objectif trop long (max 500 caractères)');
        }
      });
    }
    
    if (structured.metadata.etapes && Array.isArray(structured.metadata.etapes)) {
      if (structured.metadata.etapes.length > 50) {
        throw new Error('Trop d\'étapes (max 50)');
      }
      structured.metadata.etapes.forEach((etape: any) => {
        if (typeof etape === 'string' && etape.length > 500) {
          throw new Error('Étape trop longue (max 500 caractères)');
        }
      });
    }
    
    if (structured.metadata.categories && Array.isArray(structured.metadata.categories)) {
      if (structured.metadata.categories.length > 20) {
        throw new Error('Trop de catégories (max 20)');
      }
      structured.metadata.categories.forEach((cat: any) => {
        if (typeof cat === 'string' && cat.length > 50) {
          throw new Error('Catégorie trop longue (max 50 caractères)');
        }
      });
    }
  }
  
  // Validate sections
  if (structured.sections) {
    Object.values(structured.sections).forEach((section: any) => {
      if (typeof section === 'string' && section.length > 10000) {
        throw new Error('Section trop longue (max 10000 caractères)');
      }
    });
  }
  
  // Validate prompt template
  if (structured.prompt_template && structured.prompt_template.length > 100000) {
    throw new Error('Template trop long (max 100000 caractères)');
  }
}

// === MARKDOWN GENERATION (DRY) ===
function buildMarkdownSection(title: string, content: string | string[]): string {
  if (!content || (Array.isArray(content) && content.length === 0)) return '';
  
  let section = `## ${title}\n\n`;
  
  if (Array.isArray(content)) {
    section += content.map(item => `- ${item}`).join('\n') + '\n\n';
  } else {
    section += `${content}\n\n`;
  }
  
  return section;
}

function buildVariableMarkdown(variables: any[]): string {
  if (!variables || variables.length === 0) return '';
  
  let md = `## 🎨 Variables\n\n`;
  
  for (const v of variables) {
    md += `### {{${v.name}}}\n\n`;
    md += `- **Type:** ${v.type}\n`;
    md += `- **Description:** ${v.description}\n`;
    if (v.default_value) md += `- **Défaut:** ${v.default_value}\n`;
    if (v.options?.length) md += `- **Options:** ${v.options.join(', ')}\n`;
    md += `\n`;
  }
  
  return md;
}

function generateMarkdown(data: any, originalPrompt: string): string {
  const sections = [
    '# Prompt Structuré\n\n',
    buildMarkdownSection('📋 Rôle', data.metadata.role),
    buildMarkdownSection('🎯 Objectifs', data.metadata.objectifs),
    data.metadata.etapes?.length ? buildMarkdownSection('📝 Étapes', data.metadata.etapes.map((s: string, i: number) => `${i + 1}. ${s}`)) : '',
    data.metadata.criteres?.length ? buildMarkdownSection('✅ Critères', data.metadata.criteres) : '',
    data.metadata.categories?.length ? `**Tags:** ${data.metadata.categories.join(', ')}\n\n` : '',
    buildVariableMarkdown(data.variables),
    `## 🔧 Template\n\n\`\`\`\n${data.prompt_template}\n\`\`\`\n\n`,
    `## 📄 Original\n\n\`\`\`\n${originalPrompt}\n\`\`\`\n`
  ];
  
  return sections.filter(Boolean).join('');
}

// === AI PROMPTS (CONFIGURATION) ===
const SYSTEM_PROMPT = `Tu es un expert en ingénierie de prompts. Analyse et structure les prompts en extrayant sections, variables et métadonnées.

IMPORTANT : Pour les objectifs, sois concis et précis (maximum ~400 caractères par objectif). Privilégie la clarté et l'essentiel plutôt que l'exhaustivité.`;

const buildUserPrompt = (content: string) => `Analyse ce prompt :

${content}

Extrait : sections (contexte, rôle, instructions), variables {{nom}}, métadonnées (rôle, objectifs concis, étapes, critères).`;

// === LOVABLE AI TOOL SCHEMA (CONFIGURATION) ===
const STRUCTURE_TOOL = {
  type: "function",
  function: {
    name: "structure_prompt",
    description: "Structure un prompt avec sections, variables et métadonnées",
    parameters: {
      type: "object",
      properties: {
        sections: {
          type: "object",
          properties: {
            contexte: { type: "string" },
            role: { type: "string" },
            instructions: { type: "string" },
            format: { type: "string" },
            contraintes: { type: "string" }
          }
        },
        variables: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              type: { type: "string", enum: ["STRING", "NUMBER", "ENUM", "DATE", "MULTISTRING"] },
              default_value: { type: "string" },
              options: { type: "array", items: { type: "string" } }
            },
            required: ["name", "description", "type"]
          }
        },
        prompt_template: { type: "string" },
        metadata: {
          type: "object",
          properties: {
            role: { type: "string" },
            objectifs: { type: "array", items: { type: "string" } },
            etapes: { type: "array", items: { type: "string" } },
            criteres: { type: "array", items: { type: "string" } },
            categories: { type: "array", items: { type: "string" } }
          },
          required: ["role", "objectifs"]
        }
      },
      required: ["sections", "variables", "prompt_template", "metadata"],
      additionalProperties: false
    }
  }
};

// === ERROR HANDLING (FAIL-FAST) ===
function handleAIError(status: number): Response {
  const errors: Record<number, string> = {
    429: "Limite de taux dépassée, réessayez plus tard",
    402: "Crédits insuffisants, ajoutez des crédits"
  };
  
  const message = errors[status] || `Erreur AI Gateway: ${status}`;
  
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// === MAIN HANDLER ===
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validation (fail-fast)
    const { promptContent } = await req.json();
    const validated = validateInput(promptContent);
    
    // 2. Config check
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    // 3. AI call
    console.log('Appel Lovable AI...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(validated) }
        ],
        tools: [STRUCTURE_TOOL],
        tool_choice: { type: "function", function: { name: "structure_prompt" } }
      }),
    });

    // 4. Error handling (fail-fast)
    if (!response.ok) {
      return handleAIError(response.status);
    }

    // 5. Parse response
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('Aucun résultat structuré reçu');
    }

    const structured = JSON.parse(toolCall.function.arguments);
    
    // Validate AI response structure
    validateAIResponse(structured);

    // 6. Generate exports (DRY - une seule structure)
    const result = {
      ...structured,
      exports: {
        json: {
          version: "1.0",
          created_at: new Date().toISOString(),
          original: validated,
          ...structured
        },
        markdown: generateMarkdown(structured, validated)
      }
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
      { 
        status: error instanceof Error && error.message.includes('requis') ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
