/**
 * Application pages messages - Dashboard, Settings, Editor, Analyzer, etc.
 */

export const app = {
  // Dashboard
  dashboard: {
    title: "Tableau de bord",
    welcomeMessage: (pseudo: string) => `Bienvenue, ${pseudo} !`,
    stats: {
      totalPrompts: "Total de prompts",
      sharedPrompts: "Prompts partagés",
      favoritePrompts: "Favoris",
      recentActivity: "Activité récente",
    },
    quickActions: {
      title: "Actions rapides",
      createPrompt: "Créer un prompt",
      viewPrompts: "Voir tous les prompts",
      importPrompt: "Importer un prompt",
    },
  },

  // Settings
  settings: {
    title: "Paramètres",
    appearance: {
      title: "Apparence",
      description: "Personnalisez l'apparence de l'application",
      themeTitle: "Thème",
      themeDescription: "Choisissez entre le thème clair ou sombre",
      themeLight: "Clair",
      themeDark: "Sombre",
      themeSystem: "Système",
      interfaceLanguageTitle: "Langue de l'interface",
      changesAppliedAfterReload: "Les modifications seront appliquées après actualisation",
    },
    notifications: {
      title: "Notifications",
      description: "Gérez vos préférences de notifications",
      enableTitle: "Activer les notifications",
      enableDescription: "Recevoir des notifications sur l'activité de votre compte",
      emailNotificationsTitle: "Notifications par email",
      emailNotificationsDescription: "Vous recevrez un e-mail lors de mises à jour importantes",
      appNotificationsTitle: "Notifications dans l'application",
      appNotificationsDescription: "Afficher les notifications directement dans l'interface",
      shareNotificationsTitle: "Notifications de partage",
      shareNotificationsDescription: "Être notifié quand quelqu'un partage un prompt avec vous",
      versionNotificationsTitle: "Notifications de versions",
      versionNotificationsDescription: "Être notifié des nouvelles versions de vos prompts favoris",
      soundTitle: "Sons",
      soundDescription: "Jouer un son lors des notifications",
    },
    data: {
      title: "Données",
      description: "Gérez vos données personnelles",
      autoSaveVersionsTitle: "Sauvegarde automatique des versions",
      autoSaveVersionsDescription: "Créer automatiquement une version à chaque modification majeure",
      versionsToKeepTitle: "Versions à conserver",
      versionsToKeepDescription: "Nombre maximum de versions à garder pour chaque prompt",
      exportTitle: "Exporter mes données",
      exportDescription: "Téléchargez toutes vos données au format JSON",
      exportButton: "Exporter",
      clearHistoryTitle: "Effacer l'historique",
      clearHistoryDescription: "Supprimer l'historique de vos prompts (les prompts eux-mêmes seront conservés)",
      clearHistoryButton: "Effacer",
      deleteAccountTitle: "Supprimer mon compte",
      deleteAccountDescription: "Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible.",
      deleteAccountButton: "Demander la suppression",
    },
    security: {
      title: "Sécurité",
      description: "Gérez vos paramètres de sécurité",
      accountInfoTitle: "Informations du compte",
      accountInfoDescription: "Détails de votre compte utilisateur",
      emailLabel: "Adresse email",
      accountCreatedLabel: "Compte créé le",
      changePasswordTitle: "Changer de mot de passe",
      changePasswordDescription: "Modifier votre mot de passe actuel",
      changePasswordButton: "Changer",
      twoFactorTitle: "Authentification à deux facteurs",
      twoFactorDescription: "Ajouter une couche de sécurité supplémentaire à votre compte",
      twoFactorButton: "Activer",
      sessionsTitle: "Sessions actives",
      sessionsDescription: "Gérer les appareils connectés à votre compte",
      sessionsButton: "Gérer",
      signOutButton: "Se déconnecter",
      signOutDescription: "Déconnectez-vous de votre compte sur cet appareil",
    },
    about: {
      title: "À propos",
      description: "Informations sur l'application",
      appInfoTitle: "Informations de l'application",
      appInfoDescription: "Détails et ressources de PromptForge",
      versionTitle: "Version",
      versionNumber: "1.0.0",
      licenseTitle: "Licence",
      licenseType: "MIT",
      githubTitle: "Code source",
      githubLink: "Voir sur GitHub",
      documentationTitle: "Documentation",
      documentationLink: "Consulter la documentation",
      supportTitle: "Support & Communauté",
      supportDescription: "Besoin d'aide ? Consultez notre FAQ ou rejoignez notre communauté",
      viewFaqButton: "Voir la FAQ",
      joinCommunityButton: "Rejoindre la communauté",
    },
    profile: {
      pseudoLabel: "Pseudo",
      pseudoDescription: "Votre nom d'affichage public",
      savingButton: "Sauvegarde...",
      saveButton: "Sauvegarder",
      pseudoUpdated: "Pseudo mis à jour",
      pseudoUpdatedDescription: "Votre pseudo a été modifié avec succès",
      pseudoUpdateError: "Erreur lors de la mise à jour du pseudo",
    },
  },

  // Editor
  editor: {
    title: "Éditeur de prompt",
    createTitle: "Créer un nouveau prompt",
    editTitle: (title: string) => `Modifier : ${title}`,
    detectVariables: "Détecter les variables",
    preview: "Aperçu",
    previewPlaceholder: "L'aperçu de votre prompt apparaîtra ici...",
    promptContent: "Contenu du prompt",
    variablesButton: "Variables",
    variableConfig: "Configuration des variables",
    variableConfigInstructions: "Configurez les propriétés de vos variables",
    tabs: {
      editor: "Éditeur",
      preview: "Aperçu",
      versions: "Versions",
      variables: "Variables",
      metadata: "Métadonnées",
    },
    metadata: {
      titleLabel: "Titre du prompt",
      descriptionLabel: "Description",
      tagsLabel: "Tags",
      categoryLabel: "Catégorie",
      visibilityLabel: "Visibilité",
    },
    variables: {
      detected: (count: number) => `${count} variable${count > 1 ? 's' : ''} détectée${count > 1 ? 's' : ''}`,
      none: "Aucune variable détectée",
      helpText: "Utilisez {{nom_variable}} dans votre prompt pour créer des variables dynamiques",
    },
    variableValues: "Valeurs des variables",
    actions: {
      save: "Enregistrer",
      saveAndClose: "Enregistrer et fermer",
      cancel: "Annuler",
      delete: "Supprimer",
      duplicate: "Dupliquer",
      share: "Partager",
      export: "Exporter",
    },
    unsavedChanges: {
      title: "Modifications non enregistrées",
      description: "Vous avez des modifications non enregistrées. Souhaitez-vous les sauvegarder ?",
      save: "Sauvegarder",
      discard: "Abandonner",
      cancel: "Annuler",
    },
  },

  // Analyzer
  analyzer: {
    title: "Analyseur de prompt",
    subtitle: "Analysez la qualité et la structure de vos prompts",
    inputLabel: "Collez votre prompt ici",
    analyzeButton: "Analyser",
    analyzingButton: "Analyse en cours...",
    analyzing: "Analyse en cours...",
    analyze: "Analyser",
    structuredPrompt: "Prompt structuré",
    originalPrompt: "Prompt original",
    newAnalysis: "Nouvelle analyse",
    saving: "Sauvegarde en cours...",
    save: "Sauvegarder",
    noVariables: "Aucune variable détectée",
    tabs: {
      original: "Original",
      structured: "Structuré",
      metadata: "Métadonnées",
      variables: "Variables",
      json: "JSON",
      yaml: "YAML",
      markdown: "Markdown",
      export: "Exporter",
    },
    results: {
      title: "Résultats de l'analyse",
      score: "Score",
      complexity: "Complexité",
      clarity: "Clarté",
      specificity: "Spécificité",
      suggestions: "Suggestions d'amélioration",
      metadata: "Métadonnées détectées",
      variables: "Variables détectées",
      structure: "Structure",
      noSuggestions: "Aucune suggestion",
    },
    export: {
      title: "Exporter l'analyse",
      json: "Exporter en JSON",
      yaml: "Exporter en YAML",
      markdown: "Exporter en Markdown",
      pdf: "Exporter en PDF",
      copyJson: "Copier JSON",
      copyYaml: "Copier YAML",
      downloadJson: "Télécharger JSON",
      downloadYaml: "Télécharger YAML",
      downloadMarkdown: "Télécharger Markdown",
      saveAsPrompt: "Sauvegarder comme prompt",
    },
  },

  // Marketing (landing page)
  marketing: {
    tagline: "Votre bibliothèque de prompts IA",
    hero: {
      title: "Créez, gérez et partagez vos prompts IA",
      subtitle: "La plateforme complète pour organiser et optimiser vos interactions avec l'IA",
      ctaPrimary: "Commencer gratuitement",
      ctaSecondary: "En savoir plus",
    },
    features: {
      title: "Fonctionnalités principales",
      editor: {
        title: "Éditeur puissant",
        description: "Créez des prompts avec variables, versioning et aperçu en temps réel",
      },
      sharing: {
        title: "Partage collaboratif",
        description: "Partagez vos prompts avec votre équipe ou la communauté",
      },
      analysis: {
        title: "Analyse IA",
        description: "Obtenez des suggestions pour améliorer la qualité de vos prompts",
      },
      versioning: {
        title: "Gestion de versions",
        description: "Suivez l'évolution de vos prompts avec un historique complet",
      },
    },
    testimonials: {
      title: "Ce que disent nos utilisateurs",
    },
    pricing: {
      title: "Tarifs",
      free: "Gratuit",
      pro: "Pro",
      enterprise: "Entreprise",
    },
  },

  // Help and documentation
  help: {
    title: "Centre d'aide",
    searchPlaceholder: "Rechercher dans la documentation...",
    categories: {
      gettingStarted: "Premiers pas",
      features: "Fonctionnalités",
      troubleshooting: "Résolution de problèmes",
      faq: "Questions fréquentes",
    },
  },

  // Versions notifications
  versions: {
    notifications: {
      created: {
        title: "Version créée",
        description: "La nouvelle version a été créée avec succès",
      },
      deleted: {
        title: "Version supprimée",
        description: "La version a été supprimée avec succès",
      },
      restored: {
        title: "Version restaurée",
        description: (semver: string) => `La version ${semver} a été restaurée avec succès`,
      },
      errors: {
        createFailed: {
          title: "Erreur de création",
          description: "Impossible de créer la version",
        },
        deleteFailed: {
          title: "Erreur de suppression",
          description: "Impossible de supprimer la version",
        },
        restoreFailed: {
          title: "Erreur de restauration",
          description: "Impossible de restaurer la version",
        },
      },
    },
    typeMajor: "Major",
    typeMinor: "Minor",
    typePatch: "Patch",
    typeMajorDescription: "Changements incompatibles",
    typeMinorDescription: "Nouvelles fonctionnalités",
    typePatchDescription: "Corrections mineures",
    currentVersion: "Version actuelle",
    newVersion: "Nouvelle version",
    typeLabel: "Type de version",
    messageLabel: "Message (optionnel)",
  },

  // Analysis notifications
  analysis: {
    notifications: {
      analyzing: {
        title: "Analyse en cours",
        description: "Analyse du prompt en cours...",
      },
      complete: {
        title: "Analyse terminée",
        description: "L'analyse du prompt est terminée avec succès",
      },
      errors: {
        emptyPrompt: {
          title: "Erreur",
          description: "Le contenu du prompt est vide",
        },
        failed: {
          title: "Erreur",
          description: "L'analyse du prompt a échoué",
        },
        timeout: {
          title: "Délai dépassé",
          description: "L'analyse a pris trop de temps. Veuillez réessayer avec un prompt plus court.",
        },
      },
    },
    errors: {
      failed: "Impossible d'analyser",
      timeout: (seconds: number) => 
        `L'analyse a dépassé le délai maximum de ${seconds}s. Le service d'analyse est temporairement lent, réessayez plus tard.`,
      edgeTimeout: (seconds: number) => 
        `Le service d'analyse IA n'a pas répondu dans le délai imparti (${seconds}s). Réessayez avec un prompt plus court ou attendez quelques instants.`,
    },
  },
} as const;
