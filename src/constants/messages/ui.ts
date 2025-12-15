/**
 * UI Components Messages Module
 * 
 * Responsibilities:
 * - UI component labels and messages (ErrorFallback, Analyzer)
 * - Generic tooltips (sharing, tags, search, analysis)
 * - Error boundary messages
 * 
 * Note: Navigation, marketing, dashboard, settings messages 
 * will be migrated to app.ts in Step 8
 */

export const uiMessages = {
  // ErrorFallback component messages
  ui: {
    errorFallback: {
      title: "Une erreur est survenue",
      subtitle: "L'application a rencontré un problème inattendu",
      technicalError: "Erreur technique",
      unknownError: "Une erreur inconnue s'est produite",
      apologyMessage: "Nous nous excusons pour ce désagrément. Vous pouvez essayer de :",
      instructions: {
        retry: "Réessayer l'opération qui a échoué",
        goHome: "Retourner à la page d'accueil",
        refresh: "Rafraîchir la page complètement",
        viewDetails: "Consulter les détails techniques ci-dessous",
      },
      buttons: {
        retry: "Réessayer",
        goHome: "Accueil",
        reportError: "Signaler l'erreur",
        showDetails: "Afficher les détails techniques",
        hideDetails: "Masquer les détails techniques",
      },
      debug: {
        errorMessage: "Message d'erreur",
        stackTrace: "Stack trace",
        componentStack: "Component stack",
      },
    },
  },

  // Prompt Analyzer component messages
  analyzer: {
    title: "Analyseur de Prompts IA",
    subtitle: "Extraction automatique des sections, variables et métadonnées",
    analyzing: "Analyse...",
    analyze: "Analyser",
    results: "Résultats",
    structuredPrompt: "Prompt structuré",
    newAnalysis: "Nouvelle analyse",
    saving: "Sauvegarde...",
    save: "Sauvegarder",
    tabs: {
      structured: "Structuré",
      variables: "Variables",
      metadata: "Métadonnées",
      export: "Export",
    },
    noVariables: "Aucune variable détectée",
  },

  // Tooltips (Migrated from Step 10.9)
  tooltips: {
    analyzer: {
      start: "Analyser ce prompt",
      export: "Exporter l'analyse",
      clear: "Effacer l'analyse",
    },
  },

  // Breadcrumb navigation
  breadcrumb: {
    home: "Accueil",
    prompts: "Mes Prompts",
    resources: "Ressources",
    faq: "FAQ",
    methods: "Méthodes de Prompting",
    newPrompt: "Nouveau prompt",
    untitled: "Sans titre",
  },
} as const;
