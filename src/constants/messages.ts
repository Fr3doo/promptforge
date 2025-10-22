/**
 * Centralized message constants for the application
 * Structured for future i18n implementation
 */

export const messages = {
  // Generic labels
  labels: {
    error: "Erreur",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Enregistrer",
    update: "Mettre à jour",
    delete: "Supprimer",
    loading: "Chargement...",
    creating: "Création...",
    email: "Email",
    password: "Mot de passe",
    pseudo: "Pseudo",
    name: "Nom",
    type: "Type",
    defaultValue: "Valeur par défaut",
    helpText: "Texte d'aide",
    content: "Contenu",
    actions: "Actions",
    back: "Retour",
    close: "Fermer",
    openMenu: "Ouvrir le menu",
    copied: "Copié !",
  },

  // Placeholders
  placeholders: {
    promptTitle: "Ex: Résumé d'articles de blog",
    promptDescription: "Décrivez l'objectif et le contexte d'utilisation de ce prompt",
    promptContent: "Saisissez votre prompt ici...",
    editorPrompt: "Écrivez votre prompt ici... Utilisez {{variable}} pour les variables.",
    analyzerPrompt: "Collez votre prompt ici...",
    tagInput: "Ex: marketing, email, SEO",
    emailInput: "utilisateur@exemple.com",
    emailExample: "vous@example.com",
    passwordPlaceholder: "••••••••",
    pseudoPlaceholder: "Votre pseudo",
    versionMessage: "Décrivez les changements...",
    variableName: "Nom de la variable",
    variableDefaultValue: "Valeur par défaut...",
    variableHelp: "Description ou aide pour cette variable...",
    variableInput: (name: string) => `Entrez ${name}...`,
    search: "Rechercher des prompts...",
    searchByTitleDescriptionTags: "Rechercher par titre, description ou tags...",
    defaultConfigDescription: "Définissez les valeurs par défaut...",
  },

  // Dialog and modal titles
  dialogs: {
    deletePrompt: {
      title: "Confirmer la suppression",
      description: (title: string) => 
        `Êtes-vous sûr de vouloir supprimer le prompt "${title}" ?\n\nCette action est irréversible et supprimera également toutes les versions associées.`,
    },
    createVersion: {
      title: "Créer une nouvelle version",
      descriptionWithChanges: "Sauvegardez une version de ce prompt pour suivre son évolution",
      descriptionNoChanges: "Modifiez d'abord votre prompt pour créer une nouvelle version",
    },
    publicShare: {
      titlePrivate: (title: string) => `Partage Public : "${title}"`,
      titleShared: (title: string) => `Modifier le partage public de "${title}"`,
      descriptionPrivate: "Choisissez le niveau d'accès pour les utilisateurs qui verront ce prompt",
      descriptionShared: "Modifier le niveau d'accès public ou rendre le prompt privé",
    },
    privateShare: {
      titleNew: (title: string) => `Partage Privé : "${title}"`,
      titleExisting: (title: string) => `Gérer le partage privé de "${title}"`,
      descriptionNew: "Partagez ce prompt avec des utilisateurs spécifiques en lecture seule ou avec droits de modification",
      descriptionExisting: (count: number) => 
        `${count} utilisateur${count > 1 ? 's ont' : ' a'} accès à ce prompt`,
    },
    compareVersions: {
      title: "Comparaison de versions",
    },
  },

  // Buttons and actions
  buttons: {
    shareNow: "Partager maintenant",
    sharePrivate: "Partager",
    stopAllPrivateSharing: "Arrêter tous les partages privés",
    stopPublicSharing: "Arrêter le partage public",
    enablePublicSharing: "Activer le partage public",
    createVersion: "Créer une version",
    createVersionAction: "Créer la version",
    updatePermission: "Mettre à jour",
    retry: "Réessayer",
    reload: "Recharger",
    close: "Fermer",
  },

  // Permission and access levels
  permissions: {
    readOnly: "Lecture seule",
    readAndWrite: "Lecture et modification",
    publicAccess: "Niveau d'accès public",
    privateAccess: "Niveau d'accès",
    readOnlyDescription: "Tous les utilisateurs pourront voir ce prompt mais ne pourront pas le modifier",
    readWriteDescription: "Tous les utilisateurs pourront voir et modifier ce prompt",
    noPermissionToCreateVersion: "Vous n'avez pas la permission de créer une version",
    noChangesToVersion: "Aucune modification à versionner",
  },

  // Version control
  versions: {
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

  // Share banners and notifications
  shareBanner: {
    promptCreated: "Prompt créé avec succès !",
    shareQuestion: (title: string) => 
      `Souhaitez-vous partager "${title}" avec d'autres utilisateurs ?`,
  },

  // Shared with section
  sharedWith: {
    label: "Partagé avec",
    sharedOn: "Partagé le",
  },

  // Error messages
  errors: {
    generic: "Une erreur est survenue. Veuillez réessayer.",
    validation: {
      emptyPrompt: "Veuillez saisir un prompt",
      failed: "Validation échouée",
    },
    analysis: {
      failed: "Impossible d'analyser",
    },
    save: {
      failed: "Erreur de sauvegarde",
      unexpected: "Une erreur inattendue s'est produite",
      network: "Erreur de connexion lors de la sauvegarde",
      validation: "Les données ne sont pas valides",
    },
    network: {
      generic: "Erreur de connexion",
      timeout: "Délai d'attente dépassé",
      unavailable: "Service temporairement indisponible",
    },
    update: {
      failed: "Erreur de mise à jour",
    },
    delete: {
      failed: "Erreur de suppression",
    },
    duplicate: {
      failed: "Erreur de duplication",
    },
    variables: {
      saveFailed: "Erreur d'enregistrement des variables",
    },
    version: {
      createFailed: "Erreur lors de la création de la version",
      deleteFailed: "Erreur lors de la suppression",
      restoreFailed: "Erreur lors de la restauration",
    },
    auth: {
      signOutFailed: "Impossible de se déconnecter",
    },
    share: {
      deleteSomeFailed: "Certains partages n'ont pas pu être supprimés",
    },
    // Database errors (for getSafeErrorMessage)
    database: {
      duplicate: "Cette entrée existe déjà",
      invalidReference: "Référence invalide",
      constraintViolation: "Les données ne respectent pas les contraintes",
      unauthorized: "Action non autorisée",
      rlsViolation: "Vous n'avez pas la permission d'effectuer cette action",
      sessionExpired: "Session expirée, veuillez vous reconnecter",
      uniqueViolation: "Cette valeur est déjà utilisée",
      invalidEmail: "Email ou mot de passe invalide",
      userExists: "Cet email est déjà utilisé",
      emailNotConfirmed: "Veuillez confirmer votre email avant de vous connecter",
      invalidPassword: "Mot de passe invalide",
    },
  },

  // Success messages
  success: {
    copied: "Copié",
    copiedToClipboard: "Copié dans le presse-papiers !",
    promptSaved: "Prompt sauvegardé",
    promptCreated: "Prompt créé",
    promptUpdated: "Prompt mis à jour",
    promptDeleted: "Prompt supprimé",
    promptDuplicated: "Prompt dupliqué avec succès",
    promptShared: "Prompt partagé avec la communauté",
    promptPrivate: "Prompt redevenu privé",
    allPrivateSharesDeleted: "Tous les partages privés ont été supprimés",
    analysisComplete: "Analyse terminée",
    variablesSaved: "Variables enregistrées",
    variablesDetected: (count: number) => `${count} variable(s) détectée(s)`,
    versionCreated: "Version créée",
    versionDeleted: "Version(s) supprimée(s)",
    versionRestored: (version: string) => `Version ${version} restaurée`,
    downloaded: "Téléchargé",
    templateCopied: "Template copié",
    signedOut: "Déconnexion réussie",
    settingSaved: (setting: string) => `${setting} a été mis à jour avec succès`,
  },

  // Info messages
  info: {
    noNewVariables: "Aucune nouvelle variable détectée",
    goodbye: "À bientôt !",
    dataExportStarted: "Vos données seront téléchargées sous peu",
    historyCleared: "L'historique de vos prompts a été supprimé",
    featureComingSoon: "Fonctionnalité à venir",
    accountDeletionRequired: "Contactez le support pour supprimer votre compte",
  },

  // Loading messages
  loading: {
    analyzing: "Analyse en cours...",
    exportingData: "Export en cours",
  },

  // Action messages
  actions: {
    historyClearedTitle: "Historique effacé",
    settingSavedTitle: "Paramètre sauvegardé",
    actionRequiredTitle: "Action requise",
  },

  // Copy action descriptions
  copy: {
    template: "Template copié",
    export: (label: string) => `${label} copié`,
    download: (name: string) => `${name} téléchargé`,
    copyPromptPreview: "Copier l'aperçu du prompt",
    copyAction: "Copier",
  },

  // Authentication messages
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Accédez à vos prompts",
    loginSuccess: "Connexion réussie !",
    loginButton: "Se connecter",
    signupTitle: "Créer un compte",
    signupSubtitle: "Commencez à gérer vos prompts professionnellement",
    signupSuccess: "Compte créé avec succès !",
    signupButton: "Créer mon compte",
    noAccount: "Pas de compte ?",
    createAccount: "Créer un compte",
    alreadyHaveAccount: "Déjà un compte ?",
    signIn: "Se connecter",
    signInButton: "Se connecter",
    signUpButton: "S'inscrire",
    logout: "Déconnexion",
  },

  // Navigation
  navigation: {
    dashboard: "Tableau de bord",
    myPrompts: "Mes Prompts",
    resources: "Ressources",
    methods: "Méthodes",
    faq: "FAQ",
    settings: "Paramètres",
    promptingMethods: "Méthodes de Prompting",
    learning: "Apprentissage",
    community: "Communauté",
    communityContact: "Des questions ? Contactez-nous",
  },

  // Dashboard
  dashboard: {
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de vos prompts et statistiques",
    mostUsedPrompts: "Prompts les plus utilisés",
    usageStatistics: "Statistiques d'utilisation",
    usages: "Utilisations:",
    successRate: "Taux de réussite:",
    recentlyModified: "Prompts récemment modifiés",
    favoritePrompts: "Prompts favoris",
    communityShared: "Prompts partagés par la communauté",
    noDataAvailable: "Aucune donnée disponible",
    noDataDescription: "Commencez par créer des prompts pour voir vos statistiques ici.",
    userPrompts: (count: number) => `${count} prompt${count > 1 ? 's' : ''} créé${count > 1 ? 's' : ''}`,
    sharedPrompts: (count: number) => `${count} partagé${count > 1 ? 's' : ''}`,
    totalVersions: (count: number) => `${count} version${count > 1 ? 's' : ''}`,
    welcome: (pseudo: string) => `Bon retour, ${pseudo} !`,
    seeAllPrompts: "Voir tous mes prompts",
  },

  // Settings
  settings: {
    title: "Paramètres",
    pageTitle: "Paramètres - PromptForge",
    pageDescription: "Personnalisez votre expérience PromptForge",
    subtitle: "Personnalisez votre expérience",
    tabs: {
      appearance: "Apparence",
      language: "Langue",
      notifications: "Notifications",
      data: "Données",
      security: "Sécurité",
      about: "À propos",
    },
    appearance: {
      title: "Apparence",
      description: "Personnalisez l'apparence de l'application",
      themeTitle: "Thème",
      themeDescription: "Choisissez le thème de l'application",
      themeLight: "Clair",
      themeDark: "Sombre",
      themeSystem: "Système",
      fontSizeTitle: "Taille de police",
      fontSizeDescription: "Ajustez la taille du texte",
      fontSizeSmall: "Petit",
      fontSizeMedium: "Moyen",
      fontSizeLarge: "Grand",
      compactModeTitle: "Mode compact",
      compactModeDescription: "Réduire l'espacement entre les éléments",
      animationsTitle: "Animations",
      animationsDescription: "Activer les animations de l'interface",
    },
    language: {
      title: "Langue",
      description: "Choisissez la langue de l'interface",
      currentLanguage: "Langue actuelle",
      french: "Français",
      english: "English",
      comingSoon: "Prochainement disponible",
      languagePreference: "Préférence de langue",
      languageDescription: "Choisissez votre langue préférée pour l'interface",
    },
    notifications: {
      title: "Notifications",
      description: "Gérez vos préférences de notifications",
      emailNotificationsTitle: "Notifications par email",
      emailNotificationsDescription: "Recevoir des emails pour les événements importants",
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
      changePasswordTitle: "Changer de mot de passe",
      changePasswordDescription: "Modifier votre mot de passe actuel",
      changePasswordButton: "Changer",
      twoFactorTitle: "Authentification à deux facteurs",
      twoFactorDescription: "Ajouter une couche de sécurité supplémentaire à votre compte",
      twoFactorButton: "Activer",
      sessionsTitle: "Sessions actives",
      sessionsDescription: "Gérer les appareils connectés à votre compte",
      sessionsButton: "Gérer",
    },
    about: {
      title: "À propos",
      description: "Informations sur l'application",
      versionTitle: "Version",
      versionNumber: "1.0.0",
      licenseTitle: "Licence",
      licenseType: "MIT",
      githubTitle: "Code source",
      githubLink: "Voir sur GitHub",
      documentationTitle: "Documentation",
      documentationLink: "Consulter la documentation",
    },
    profile: {
      pseudoLabel: "Pseudo",
      pseudoDescription: "Votre nom d'affichage public",
      savingButton: "Sauvegarde...",
      saveButton: "Sauvegarder",
      pseudoUpdated: "Pseudo mis à jour",
      pseudoUpdateFailed: "Erreur lors de la mise à jour du pseudo",
      pseudoRequired: "Le pseudo ne peut pas être vide",
      pseudoTooShort: "Le pseudo doit contenir au moins 2 caractères",
      pseudoTooLong: "Le pseudo ne peut pas dépasser 50 caractères",
      pseudoInvalidChars: "Le pseudo ne peut contenir que des lettres, chiffres, espaces, tirets et underscores",
    },
  },

  // Editor
  editor: {
    title: "Éditeur",
    preview: "Aperçu",
    previewPlaceholder: "L'aperçu s'affichera ici...",
    detectVariables: "Détecter variables",
    variableValues: "Valeurs des variables",
    promptContent: "Contenu du prompt",
    variables: "Variables",
    variableConfig: "Configuration des variables",
    variableConfigInstructions: "Utilisez {{variable}} dans votre prompt. Exemples :\n• {{nom}} - texte simple\n• {{age}} - nombre\n• {{actif}} - booléen",
  },

  // Analyzer
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

  // Variables
  variables: {
    emptyState: 'Aucune variable détectée. Utilisez le bouton "Détecter variables" ou ajoutez des variables manuellement avec la syntaxe',
    emptyStateWithInstructions: 'Commencez par ajouter des variables avec la syntaxe {{variable}} dans votre prompt, puis utilisez le bouton "Détecter variables".',
    types: {
      string: "Texte",
      number: "Nombre",
      boolean: "Boolean",
      enum: "Enum",
      date: "Date",
      multiString: "Multi-texte",
    },
  },

  // Prompt Actions Menu
  promptActions: {
    title: "Actions du prompt",
    edit: "Modifier",
    duplicate: "Dupliquer",
    privateShare: "Partage Privé",
    stopPublicShare: "Arrêter le partage public",
    publicShare: "Partage Public",
    delete: "Supprimer",
  },

  // Prompt List & Empty States
  promptList: {
    noResults: "Aucun résultat",
    noResultsDescription: "Aucun prompt ne correspond à votre recherche. Essayez avec d'autres mots-clés.",
    noSharedPrompts: "Aucun prompt partagé",
    noSharedPromptsDescription: "Vous n'avez pas encore reçu de prompts partagés...",
    noPrompts: "Aucun prompt",
    noPromptsDescription: "Vous n'avez pas encore créé de prompt...",
    createFirstPrompt: "Créer votre premier prompt",
  },

  // Conflict detection
  conflict: {
    title: "Conflit détecté",
    description: (timeAgo: string) => 
      `Ce prompt a été modifié par un autre utilisateur ${timeAgo}. Vos modifications risquent d'écraser les changements récents.`,
    reloadLatest: "Recharger la dernière version",
    continueAnyway: "Continuer malgré tout",
  },

  // Marketing / Landing page
  marketing: {
    tagline: "Gérez et optimisez vos prompts IA avec versioning professionnel et collaboration en équipe.",
    hero: {
      title: "Organisez vos Prompts IA comme un Pro",
      subtitle: "Versioning, collaboration et gestion centralisée pour vos prompts d'intelligence artificielle",
      cta: "Commencer gratuitement",
    },
    beforeAfter: {
      before: "Avant PromptForge",
      after: "Avec PromptForge",
      beforePoint1: "Prompts éparpillés",
      beforePoint2: "Versions perdues",
      beforePoint3: "Travail en silo",
      afterPoint1: "Tout centralisé",
      afterPoint2: "Historique complet",
      afterPoint3: "Collaboration fluide",
    },
    useCases: {
      marketing: {
        title: "Marketing",
        description: "Optimisez vos prompts pour la génération de contenu, emails et publicités",
      },
      development: {
        title: "Développement",
        description: "Gérez vos prompts de génération de code et documentation technique",
      },
      research: {
        title: "Recherche",
        description: "Organisez vos prompts d'analyse de données et de synthèse d'information",
      },
    },
    quickLinks: {
      analyzer: {
        title: "Analyseur de Prompts",
        description: "Analysez et structurez vos prompts automatiquement",
        cta: "Essayer l'analyseur",
      },
      methods: {
        title: "Méthodes de Prompting",
        description: "Découvrez les meilleures pratiques et techniques",
        cta: "Explorer les méthodes",
      },
      resources: {
        title: "Ressources",
        description: "Articles et guides pour maîtriser l'art du prompting",
        cta: "Voir les ressources",
      },
    },
  },
} as const;

// Helper type for message keys (useful for future i18n)
export type MessageKey = typeof messages;
