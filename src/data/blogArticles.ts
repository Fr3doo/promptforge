export interface BlogArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
}

export const blogArticles: BlogArticle[] = [
  {
    id: "comment-concevoir-prompt-performant",
    title: "Comment concevoir un prompt performant",
    description: "Découvrez les principes fondamentaux pour créer des prompts IA efficaces qui produisent des résultats précis et cohérents.",
    content: `
# Comment concevoir un prompt performant

## Introduction

La qualité d'un prompt détermine directement la qualité de la réponse de l'IA. Un prompt bien conçu peut faire la différence entre une réponse générique et une solution précise et actionnable.

## 1. Soyez spécifique et précis

Un prompt vague donnera des résultats vagues. Plutôt que "Écris un article", préférez "Rédige un article de 500 mots sur les avantages du prompt engineering pour les équipes marketing, avec des exemples concrets".

## 2. Définissez le contexte

Fournissez le contexte nécessaire pour que l'IA comprenne le cadre de votre demande :
- Qui est l'audience cible ?
- Quel est le niveau de technicité attendu ?
- Quel est l'objectif final ?

## 3. Utilisez des exemples

Les exemples concrets aident l'IA à comprendre le format et le style souhaités. C'est la base du "few-shot prompting".

## 4. Structurez votre prompt

Organisez votre prompt en sections claires :
- **Rôle** : "Tu es un expert en marketing digital"
- **Contexte** : "Pour une PME en B2B"
- **Tâche** : "Crée un plan de contenu mensuel"
- **Format** : "Sous forme de tableau avec colonnes : date, sujet, canal"

## 5. Itérez et affinez

Le premier prompt n'est jamais parfait. Testez, analysez les résultats, et raffinez progressivement.

## Conclusion

La conception de prompts performants est une compétence qui se développe avec la pratique. Utilisez PromptForge pour versionner vos prompts et identifier ceux qui fonctionnent le mieux.
    `,
    author: "Équipe PromptForge",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Guide",
    keywords: ["prompt engineering", "conception prompt", "optimisation IA", "bonnes pratiques"]
  },
  {
    id: "10-erreurs-prompt-a-eviter",
    title: "10 erreurs de prompt à éviter",
    description: "Les erreurs courantes qui réduisent l'efficacité de vos prompts et comment les corriger.",
    content: `
# 10 erreurs de prompt à éviter

## 1. Être trop vague

❌ Mauvais : "Aide-moi avec le marketing"
✅ Bon : "Crée un calendrier de contenu Instagram pour une marque de cosmétiques bio, 3 posts/semaine pendant un mois"

## 2. Ne pas définir le format de sortie

L'IA ne sait pas toujours comment présenter l'information. Spécifiez : liste, tableau, paragraphe, JSON, etc.

## 3. Oublier le contexte

L'IA ne connaît pas votre projet ou votre entreprise. Fournissez le contexte nécessaire.

## 4. Combiner trop de tâches

Un prompt, une tâche. Si vous avez besoin de plusieurs choses, décomposez en plusieurs prompts ou utilisez le prompt chaining.

## 5. Utiliser un jargon ambigu

Soyez clair dans vos termes. Ce qui est évident pour vous peut être interprété différemment par l'IA.

## 6. Ne pas tester et itérer

Le premier essai n'est jamais parfait. Testez différentes variations et conservez celles qui fonctionnent.

## 7. Ignorer les variables

Si vous réutilisez un prompt avec des valeurs différentes, utilisez des variables (ex: {{nom_produit}}, {{audience_cible}}).

## 8. Ne pas versionner vos prompts

Gardez une trace de vos évolutions. C'est essentiel pour comprendre ce qui fonctionne.

## 9. Négliger les instructions de ton et style

Spécifiez le ton souhaité : professionnel, décontracté, technique, vulgarisé, etc.

## 10. Oublier les contraintes

Longueur, format, restrictions, points à éviter - spécifiez tout ce qui est important.

## Conclusion

Ces erreurs sont faciles à éviter une fois qu'on les connaît. PromptForge vous aide à créer des prompts structurés et réutilisables pour éviter ces pièges.
    `,
    author: "Équipe PromptForge",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Guide",
    keywords: ["erreurs prompt", "optimisation", "bonnes pratiques", "prompt engineering"]
  },
  {
    id: "guide-variables-prompts",
    title: "Guide complet des variables dans les prompts",
    description: "Apprenez à créer des prompts réutilisables et modulaires grâce aux variables.",
    content: `
# Guide complet des variables dans les prompts

## Pourquoi utiliser des variables ?

Les variables transforment vos prompts en templates réutilisables, vous permettant de créer une fois et d'utiliser de nombreuses fois avec différentes valeurs.

## Syntaxe de base

Dans PromptForge, utilisez la syntaxe \`{{nom_variable}}\` pour définir une variable.

Exemple :
\`\`\`
Rédige une description produit pour {{nom_produit}}, 
destinée à {{audience_cible}}, en mettant en avant {{caracteristique_principale}}.
\`\`\`

## Types de variables courantes

### 1. Variables de contenu
- \`{{sujet}}\`
- \`{{theme}}\`
- \`{{produit}}\`

### 2. Variables d'audience
- \`{{audience_cible}}\`
- \`{{niveau_expertise}}\`
- \`{{secteur_activite}}\`

### 3. Variables de format
- \`{{longueur}}\`
- \`{{format_sortie}}\`
- \`{{ton}}\`

### 4. Variables de contexte
- \`{{contexte_entreprise}}\`
- \`{{objectif}}\`
- \`{{contraintes}}\`

## Bonnes pratiques

1. **Nommage clair** : Utilisez des noms descriptifs en snake_case
2. **Documentation** : Décrivez chaque variable et ses valeurs possibles
3. **Valeurs par défaut** : Prévoyez des valeurs par défaut quand c'est pertinent
4. **Validation** : Vérifiez que toutes les variables sont remplies avant exécution

## Exemple complet

\`\`\`
Rôle : Tu es un {{role_expert}}

Contexte : {{contexte_projet}}

Tâche : Crée un {{type_livrable}} sur le thème "{{theme}}"
destiné à {{audience}}.

Format : {{format_sortie}}

Contraintes :
- Longueur : {{longueur}}
- Ton : {{ton}}
- Points clés à aborder : {{points_cles}}
\`\`\`

## Gestion dans PromptForge

PromptForge détecte automatiquement vos variables et vous permet de :
- Définir des types (texte, nombre, liste)
- Spécifier des valeurs par défaut
- Valider les entrées
- Gérer plusieurs jeux de valeurs

## Conclusion

Les variables sont essentielles pour créer des prompts professionnels et maintenables. Elles permettent de capitaliser sur vos meilleurs prompts et de les réutiliser efficacement.
    `,
    author: "Équipe PromptForge",
    date: "2024-01-05",
    readTime: "8 min",
    category: "Tutoriel",
    keywords: ["variables", "templates", "réutilisabilité", "prompt engineering"]
  }
];
