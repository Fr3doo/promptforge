import { logError } from "@/lib/logger";

export const exampleTemplates = [
  {
    title: "Bug Triage Assistant",
    description: "Aide à analyser et prioriser les bugs reportés",
    content: `# Analyse de Bug

## Produit concerné
{{product}}

## Niveau de sévérité
{{severity}}

## Logs
\`\`\`
{{logs}}
\`\`\`

## Instructions
Analyse ce bug en suivant ces étapes:
1. Identifie la cause probable
2. Propose un niveau de priorité (P0-P4)
3. Suggère une équipe assignée
4. Estime la complexité de résolution`,
    tags: ["dev", "bug", "triage"],
    visibility: "SHARED" as const,
    variables: [
      { name: "product", type: "STRING", required: true, default_value: "", help: "Nom du produit ou service", order_index: 0 },
      { name: "severity", type: "ENUM", required: true, default_value: "medium", help: "Niveau: low, medium, high, critical", order_index: 1 },
      { name: "logs", type: "MULTISTRING", required: false, default_value: "", help: "Logs d'erreur complets", order_index: 2 },
    ],
    variableSets: [
      { name: "Example 1: Critical Auth Bug", values: { product: "Authentication Service", severity: "critical", logs: "Error: JWT token validation failed at line 42\nStack trace: ..." } },
      { name: "Example 2: UI Glitch", values: { product: "Web Dashboard", severity: "low", logs: "Warning: Button alignment off by 2px in Chrome" } },
    ],
  },
  {
    title: "Spec → Tests Gherkin",
    description: "Convertit une spécification fonctionnelle en scénarios de test Gherkin",
    content: `# Génération de Tests Gherkin

## Feature
{{featureName}}

## Règles métier
{{rules}}

## Instructions
Génère des scénarios de test Gherkin (Given/When/Then) couvrant:
- Le happy path
- Les cas d'erreur principaux
- Les cas limites

Format attendu:
\`\`\`gherkin
Feature: {{featureName}}

Scenario: [Nom du scénario]
  Given [contexte]
  When [action]
  Then [résultat attendu]
\`\`\``,
    tags: ["testing", "qa", "gherkin"],
    visibility: "SHARED" as const,
    variables: [
      { name: "featureName", type: "STRING", required: true, default_value: "", help: "Nom de la fonctionnalité", order_index: 0 },
      { name: "rules", type: "MULTISTRING", required: true, default_value: "", help: "Liste des règles métier", order_index: 1 },
    ],
    variableSets: [
      { name: "Example: User Login", values: { featureName: "User Authentication", rules: "- Users must provide email and password\n- Password must be 8+ chars\n- Max 3 failed attempts" } },
      { name: "Example: Payment Flow", values: { featureName: "Checkout Payment", rules: "- Accept credit cards\n- Validate CVV\n- Send confirmation email" } },
    ],
  },
  {
    title: "Résumé E-mail Professionnel",
    description: "Résume et reformule des emails selon le ton et la longueur souhaités",
    content: `# Résumé d'Email

## Ton souhaité
{{tone}}

## Longueur maximale
{{length}} mots

## Audience
{{audience}}

## Email original
{{emailContent}}

## Instructions
Résume cet email en respectant:
1. Le ton demandé ({{tone}})
2. La limite de {{length}} mots
3. L'adaptation à l'audience ({{audience}})
4. Conservation des points clés et actions requises`,
    tags: ["email", "communication", "summary"],
    visibility: "SHARED" as const,
    variables: [
      { name: "tone", type: "ENUM", required: true, default_value: "professional", help: "Ton: casual, professional, formal", order_index: 0 },
      { name: "length", type: "NUMBER", required: true, default_value: "100", help: "Nombre de mots maximum", order_index: 1 },
      { name: "audience", type: "STRING", required: true, default_value: "équipe interne", help: "Type d'audience cible", order_index: 2 },
      { name: "emailContent", type: "MULTISTRING", required: true, default_value: "", help: "Contenu complet de l'email", order_index: 3 },
    ],
    variableSets: [
      { name: "Example: Team Update", values: { tone: "professional", length: "150", audience: "équipe technique", emailContent: "Bonjour à tous,\n\nJe voulais faire un point sur le projet..." } },
      { name: "Example: Client Response", values: { tone: "formal", length: "100", audience: "client externe", emailContent: "Dear Sir/Madam,\n\nRegarding your inquiry about..." } },
    ],
  },
];

export async function createExampleTemplates(userId: string, supabase: any) {
  for (const template of exampleTemplates) {
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .insert({
        owner_id: userId,
        title: template.title,
        description: template.description,
        content: template.content,
        tags: template.tags,
        visibility: template.visibility,
      })
      .select()
      .single();

    if (promptError) {
      logError("Error creating template", { 
        template: template.title,
        error: promptError.message 
      });
      continue;
    }

    // Insert variables
    if (template.variables.length > 0) {
      const varsToInsert = template.variables.map((v) => ({
        prompt_id: prompt.id,
        ...v,
      }));

      await supabase.from("variables").insert(varsToInsert);
    }

    // Insert variable sets
    if (template.variableSets.length > 0) {
      const setsToInsert = template.variableSets.map((set) => ({
        prompt_id: prompt.id,
        name: set.name,
        values: set.values,
      }));

      await supabase.from("variable_sets").insert(setsToInsert);
    }
  }
}
