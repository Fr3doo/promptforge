export type FeatureStatus = "available" | "partial" | "coming-soon" | "informational";

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
  featureStatus?: FeatureStatus;
}

export const faqData: FAQItem[] = [
  {
    question: "Puis-je importer mes prompts existants ?",
    answer: "Oui, PromptForge permet d'importer vos prompts au format JSON ou Markdown. Vous pouvez également copier-coller directement vos prompts depuis n'importe quelle source. L'outil détectera automatiquement les variables si vous utilisez la syntaxe {{variable}}.",
    category: "Import/Export",
    featureStatus: "coming-soon"
  },
  {
    question: "Quel type de modèles d'IA est pris en charge ?",
    answer: "PromptForge est compatible avec tous les modèles d'IA basés sur du texte : ChatGPT (GPT-3.5, GPT-4, GPT-5), Claude (Anthropic), Gemini (Google), Llama, Mistral, et tous les autres modèles accessibles via API. Les prompts sont agnostiques du modèle utilisé.",
    category: "Compatibilité",
    featureStatus: "informational"
  },
  {
    question: "Qu'est-ce qu'un prompt engineering ?",
    answer: "Le prompt engineering est l'art de formuler des instructions précises pour les modèles d'IA. Cela inclut la définition du contexte, du rôle, des contraintes, et du format de sortie souhaité. Un bon prompt peut significativement améliorer la qualité et la pertinence des réponses de l'IA.",
    category: "Concepts",
    featureStatus: "informational"
  },
  {
    question: "Quelle est la différence entre un prompt et un template ?",
    answer: "Un prompt est une instruction complète envoyée à l'IA. Un template est un prompt réutilisable contenant des variables ({{variable}}) qui seront remplacées par des valeurs spécifiques à chaque utilisation. PromptForge excelle dans la gestion de templates structurés.",
    category: "Concepts",
    featureStatus: "informational"
  },
  {
    question: "Pourquoi structurer ses prompts ?",
    answer: "La structuration des prompts améliore la cohérence des résultats, facilite la réutilisation, permet le versioning, et simplifie la collaboration. Un prompt bien structuré avec rôle, contexte, objectifs et format de sortie produit des résultats plus prévisibles et de meilleure qualité.",
    category: "Bonnes pratiques",
    featureStatus: "informational"
  },
  {
    question: "Qu'est-ce que le versioning sémantique (SemVer) ?",
    answer: "SemVer est un système de numérotation des versions au format MAJOR.MINOR.PATCH. MAJOR change pour des modifications incompatibles, MINOR pour des ajouts rétrocompatibles, et PATCH pour des corrections. Cela permet de suivre l'évolution de vos prompts de manière standardisée.",
    category: "Concepts",
    featureStatus: "informational"
  },
  {
    question: "Comment fonctionne le versioning SemVer ?",
    answer: "PromptForge utilise le versioning sémantique (SemVer) : MAJOR.MINOR.PATCH. Chaque modification de votre prompt crée une nouvelle version avec un historique complet et un diff visuel. Vous pouvez revenir à n'importe quelle version précédente à tout moment.",
    category: "Versioning",
    featureStatus: "available"
  },
  {
    question: "Mes prompts sont-ils privés et sécurisés ?",
    answer: "Oui, tous vos prompts sont privés par défaut et stockés de manière sécurisée. Vous seul avez accès à vos prompts, sauf si vous choisissez de les partager explicitement avec votre équipe. Les données sont chiffrées et hébergées sur des serveurs sécurisés.",
    category: "Sécurité",
    featureStatus: "available"
  },
  {
    question: "Puis-je collaborer avec mon équipe ?",
    answer: "Oui, PromptForge permet de partager vos prompts avec votre équipe, de gérer les permissions, et de suivre qui a modifié quoi grâce à l'historique des versions. Chaque membre peut contribuer tout en maintenant la traçabilité complète.",
    category: "Collaboration",
    featureStatus: "partial"
  },
  {
    question: "Comment fonctionnent les variables dans les prompts ?",
    answer: "Les variables utilisent la syntaxe {{nom_variable}}. PromptForge les détecte automatiquement et vous permet de définir leur type, valeur par défaut, et description. Lors de l'utilisation du prompt, vous remplissez les variables avec les valeurs spécifiques à votre contexte.",
    category: "Variables",
    featureStatus: "available"
  },
  {
    question: "Puis-je exporter mes prompts pour les utiliser ailleurs ?",
    answer: "Absolument. Vous pouvez exporter vos prompts au format JSON (pour intégration API) ou Markdown (pour documentation). L'export inclut le contenu, les métadonnées, les variables, et l'historique des versions si vous le souhaitez.",
    category: "Import/Export",
    featureStatus: "available"
  },
  {
    question: "Y a-t-il une limite au nombre de prompts que je peux créer ?",
    answer: "Le plan gratuit permet de créer jusqu'à 50 prompts. Les plans payants offrent des limites beaucoup plus élevées (500+ prompts) et incluent des fonctionnalités avancées comme l'analyse de performance et les suggestions d'optimisation.",
    category: "Tarification",
    featureStatus: "coming-soon"
  },
  {
    question: "Comment l'analyseur de prompts fonctionne-t-il ?",
    answer: "L'analyseur de prompts utilise l'IA pour examiner votre prompt et extraire automatiquement les sections réutilisables, détecter les variables, identifier le rôle, les objectifs, et les étapes. Il génère ensuite une version structurée et optimisée de votre prompt.",
    category: "Fonctionnalités",
    featureStatus: "available"
  },
  {
    question: "Puis-je tester mes prompts directement dans l'application ?",
    answer: "Oui, vous pouvez tester vos prompts directement dans PromptForge en vous connectant à votre API OpenAI, Anthropic, ou tout autre fournisseur. Cela vous permet de valider et comparer différentes versions avant de les déployer en production.",
    category: "Fonctionnalités",
    featureStatus: "coming-soon"
  },
  {
    question: "Comment puis-je organiser mes prompts ?",
    answer: "PromptForge offre plusieurs moyens d'organisation : tags personnalisables, favoris, recherche full-text, filtres par catégorie, et tri par date de création ou de modification. Vous pouvez créer votre propre système de classification.",
    category: "Organisation",
    featureStatus: "available"
  },
  {
    question: "Les prompts peuvent-ils être utilisés dans des workflows automatisés ?",
    answer: "Oui, via l'API REST de PromptForge, vous pouvez récupérer vos prompts et les intégrer dans vos pipelines CI/CD, scripts, ou applications. L'export JSON est également compatible avec la plupart des outils d'automatisation.",
    category: "Intégration",
    featureStatus: "coming-soon"
  }
];
