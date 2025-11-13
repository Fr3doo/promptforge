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
    variablePattern: "Expression régulière (ex: ^[A-Z].*)",
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
      timeout: (seconds: number) => 
        `L'analyse a dépassé le délai maximum de ${seconds}s. Le service d'analyse est temporairement lent, réessayez plus tard.`,
      edgeTimeout: (seconds: number) => 
        `Le service d'analyse IA n'a pas répondu dans le délai imparti (${seconds}s). Réessayez avec un prompt plus court ou attendez quelques instants.`,
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
      // Codes PostgreSQL
      codes: {
        '23505': "Cette valeur existe déjà",
        '23503': "Référence invalide",
        '23514': "Contrainte de validation violée",
        '42501': "Accès non autorisé",
      },
      // Patterns de messages (par ordre de priorité)
      patterns: [
        // Variables (spécifiques)
        { pattern: 'variables_name_length', message: "Le nom de la variable est trop long (max 50 caractères)" },
        { pattern: 'variables_default_value_length', message: "La valeur par défaut est trop longue (max 1000 caractères)" },
        { pattern: 'variables_help_length', message: "Le texte d'aide est trop long (max 500 caractères)" },
        { pattern: 'variables_pattern_length', message: "Le pattern est trop long (max 200 caractères)" },
        { pattern: 'variables_name_format', message: "Le nom de la variable doit respecter le format snake_case" },
        { pattern: "nombre d'options ne peut pas dépasser", message: "Vous ne pouvez pas avoir plus de 20 options" },
        { pattern: 'option ne peut pas dépasser 100', message: "Une option ne peut pas dépasser 100 caractères" },
        { pattern: 'ne peut pas avoir plus de 50 variables', message: "Vous ne pouvez pas avoir plus de 50 variables par prompt" },
        // Génériques
        { pattern: 'row-level security', message: "Accès refusé par les politiques de sécurité" },
        { pattern: 'jwt', message: "Session expirée. Veuillez vous reconnecter." },
        { pattern: 'token', message: "Session expirée. Veuillez vous reconnecter." },
        { pattern: 'unique', message: "Cette valeur doit être unique" },
        { pattern: 'invalid email', message: "Adresse email invalide" },
        { pattern: 'invalid_grant', message: "Adresse email invalide" },
        { pattern: 'user already registered', message: "Un compte existe déjà avec cette adresse email" },
        { pattern: 'email not confirmed', message: "Veuillez confirmer votre adresse email" },
        { pattern: 'invalid password', message: "Mot de passe incorrect" },
      ],
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
      // Variables validation constraints
      variableNameTooLong: "Le nom de la variable ne peut pas dépasser 100 caractères",
      variableDefaultTooLong: "La valeur par défaut ne peut pas dépasser 1000 caractères",
      variableHelpTooLong: "Le texte d'aide ne peut pas dépasser 500 caractères",
      variablePatternTooLong: "Le pattern ne peut pas dépasser 200 caractères",
      variableNameInvalid: "Le nom de la variable ne peut contenir que des lettres, chiffres et underscores",
      variableTooManyOptions: "Le nombre d'options ne peut pas dépasser 50",
      variableOptionTooLong: "Chaque option ne peut pas dépasser 100 caractères",
      variableCountExceeded: "Un prompt ne peut pas avoir plus de 50 variables",
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

  // System messages
  system: {
    sessionExpired: {
      title: "Session expirée",
      description: "Votre session a expiré. Veuillez vous reconnecter.",
    },
    genericError: {
      title: "Erreur",
      description: "Une erreur inattendue s'est produite",
    },
    networkError: {
      title: "Erreur de connexion",
      description: "Vérifiez votre connexion internet et réessayez",
    },
  },

  // Analysis-specific notifications
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
  },

  // Prompts-specific notifications
  prompts: {
    notifications: {
      // Succès - CRUD
      created: {
        title: "Prompt créé avec succès",
        description: (title: string) => `"${title}" a été ajouté à votre bibliothèque`,
      },
      updated: {
        title: "Modifications enregistrées",
        description: (title: string) => `Les changements apportés à "${title}" ont été sauvegardés`,
      },
      deleted: {
        title: "Prompt supprimé",
        description: "Le prompt a été supprimé avec succès",
      },
      duplicated: {
        title: "Prompt dupliqué avec succès",
        description: (title: string) => `Une copie de "${title}" a été créée`,
      },

      // Erreurs - Formulaire
      form: {
        noEditPermission: {
          title: "Action interdite",
          description: "Vous n'avez pas la permission de modifier ce prompt. Contactez le propriétaire pour obtenir l'accès en écriture.",
        },
        conflictDetected: {
          title: "Conflit détecté",
          description: "Veuillez recharger le prompt pour obtenir la dernière version avant de sauvegarder.",
        },
        validationFailed: {
          title: "Validation échouée",
          description: (field: string, constraint: string) => `${field}: ${constraint}`,
        },
      },

      // Erreurs - Sauvegarde
      save: {
        duplicateTitle: {
          title: "Erreur de création",
          description: "Un prompt avec ce titre existe déjà",
        },
        networkError: {
          title: "Erreur de connexion",
          description: (action: string) => `Impossible de ${action}. Vérifiez votre connexion internet.`,
        },
        serverError: {
          title: "Erreur serveur",
          description: (action: string) => `Une erreur s'est produite lors de l'opération "${action}". Veuillez réessayer.`,
        },
        permissionDenied: {
          title: "Accès refusé",
          description: (resource: string) => `Vous n'avez pas les permissions nécessaires pour modifier ${resource}.`,
        },
      },

      // Partage privé
      share: {
        added: {
          title: "Prompt partagé",
          description: (email: string, permission: "READ" | "WRITE") =>
            `Le prompt a été partagé avec ${email} en ${permission === "READ" ? "lecture seule" : "lecture/écriture"}`,
        },
        permissionUpdated: {
          title: "Permission mise à jour",
          description: "Le niveau d'accès a été modifié avec succès",
        },
        deleted: {
          title: "Partage supprimé",
          description: "L'accès au prompt a été retiré",
        },
        errors: {
          userNotFound: {
            title: "Utilisateur introuvable",
            description: "Cet email n'est pas encore inscrit. Invitez cet utilisateur à créer un compte pour pouvoir partager avec lui.",
          },
          selfShare: {
            title: "Partage impossible",
            description: "Vous ne pouvez pas partager un prompt avec vous-même",
          },
          notOwner: {
            title: "Action non autorisée",
            description: "Seul le propriétaire du prompt peut le partager avec d'autres utilisateurs",
          },
          alreadyShared: {
            title: "Déjà partagé",
            description: "Ce prompt est déjà partagé avec cet utilisateur",
          },
          shareNotFound: {
            title: "Partage introuvable",
            description: "Ce partage n'existe plus ou a déjà été supprimé",
          },
          unauthorizedUpdate: {
            title: "Action non autorisée",
            description: "Vous n'êtes pas autorisé à modifier ce partage",
          },
          unauthorizedDelete: {
            title: "Action non autorisée",
            description: "Vous n'avez pas les permissions nécessaires pour supprimer ce partage",
          },
        },
      },

      // Visibilité publique
      visibility: {
        shared: {
          title: "Prompt partagé avec la communauté",
          description: "Votre prompt est maintenant accessible publiquement",
        },
        private: {
          title: "Prompt redevenu privé",
          description: "Votre prompt n'est plus accessible publiquement",
        },
        permissionUpdated: {
          title: "Niveau d'accès mis à jour",
          description: "Les permissions publiques ont été modifiées",
        },
        errors: {
          cannotUpdatePrivate: {
            title: "Action impossible",
            description: "Impossible de modifier le niveau d'accès d'un prompt privé. Activez d'abord le partage public.",
          },
        },
      },
    },
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
    backButton: "Retour",
    tabs: {
      appearance: "Apparence",
      language: "Langue",
      notifications: "Notifications",
      data: "Données",
      security: "Sécurité",
      about: "À propos",
    },
    appearance: {
      title: "Apparence & Thème",
      description: "Personnalisez l'apparence de l'interface",
      themeTitle: "Thème",
      themeDescription: "Choisissez le thème de l'application",
      themeLight: "Clair",
      themeDark: "Sombre",
      themeSystem: "Système",
      darkModeTitle: "Mode sombre",
      darkModeDescription: "Activez le mode sombre pour réduire la fatigue oculaire",
      systemThemeTitle: "Respecter les préférences système",
      systemThemeDescription: "Utiliser le thème de votre système d'exploitation",
      fontSizeTitle: "Taille de la police",
      fontSizeDescription: "Ajustez la taille du texte",
      fontSizeSmall: "Petite",
      fontSizeMedium: "Moyenne",
      fontSizeLarge: "Grande",
      compactModeTitle: "Mode compact",
      compactModeDescription: "Réduire l'espacement entre les éléments",
      animationsTitle: "Animations",
      animationsDescription: "Activer les animations de l'interface",
      pseudoDisplayDescription: "Ce pseudo sera affiché à la place de votre adresse email",
    },
    language: {
      title: "Langue & Région",
      description: "Choisissez la langue de l'interface utilisateur",
      currentLanguage: "Langue actuelle",
      french: "Français",
      english: "English",
      spanish: "Español",
      german: "Deutsch",
      comingSoon: "Prochainement disponible",
      languagePreference: "Préférence de langue",
      languageDescription: "Choisissez votre langue préférée pour l'interface",
      autoDetectTitle: "Détection automatique de langue",
      autoDetectDescription: "Détecter automatiquement la langue du navigateur",
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
      pseudoUpdateFailed: "Erreur lors de la mise à jour du pseudo",
      pseudoRequired: "Le pseudo ne peut pas être vide",
      pseudoTooShort: "Le pseudo doit contenir au moins 2 caractères",
      pseudoTooLong: "Le pseudo ne peut pas dépasser 50 caractères",
      pseudoInvalidChars: "Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores",
      pseudoLengthError: "Le pseudo doit contenir entre 2 et 50 caractères",
      pseudoAlreadyUsed: "Ce pseudo est déjà utilisé",
      pseudoUpdateError: "Impossible de mettre à jour le pseudo",
    },
  },

  // Editor
  editor: {
    title: "Éditeur",
    preview: "Aperçu",
    previewPlaceholder: "L'aperçu s'affichera ici...",
    detectVariables: "Détecter variables",
    detectVariablesAuto: "Détecter automatiquement",
    variableValues: "Valeurs des variables",
    promptContent: "Contenu du prompt",
    variables: "Variables",
    variablesButton: (count: number) => count > 0 ? `Variables (${count})` : "Variables",
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
    emptyStateWithButton: "Écrivez vos variables avec {{nom}} dans votre prompt, puis cliquez sur le bouton ci-dessus pour les détecter automatiquement.",
    typeLabels: {
      STRING: "Texte",
      NUMBER: "Nombre",
      BOOLEAN: "Boolean",
      ENUM: "Enum",
      DATE: "Date",
      MULTISTRING: "Multi-texte",
    },
    types: {
      string: "Texte",
      number: "Nombre",
      boolean: "Boolean",
      enum: "Enum",
      date: "Date",
      multiString: "Multi-texte",
    },
    requiredLabel: "Obligatoire",
    defaultValueLabel: "Valeur par défaut",
    helpTextLabel: "Texte d'aide",
    patternLabel: "Pattern de validation",
    notifications: {
      saved: {
        title: "Variables enregistrées",
        description: "Les variables ont été sauvegardées avec succès",
      },
      errors: {
        saveFailed: {
          title: "Erreur de sauvegarde",
          description: "Impossible de sauvegarder les variables",
        },
        createFailed: {
          title: "Erreur de création",
          description: "Impossible de créer la variable",
        },
      },
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
    loading: "Chargement...",
    hero: {
      title: "Gérez et optimisez vos prompts IA – dans un seul outil",
      subtitle: "Créez, versionnez, partagez vos prompts, et mesurez leur efficacité",
      description: "Centralisez vos templates IA, automatisez vos workflows et collaborez en équipe avec un système de versioning professionnel",
      cta: "Commencer gratuitement",
      welcomeBack: (pseudo: string) => `Bienvenue, ${pseudo}`,
      welcomeDescription: "Prêt à créer des prompts professionnels ?",
    },
    beforeAfter: {
      before: "Avant",
      after: "Après",
      beforePoint1: "Prompts éparpillés, non versionnés",
      beforePoint2: "Versions perdues",
      beforePoint3: "Travail en silo",
      afterPoint1: "Bibliothèque centralisée et optimisée",
      afterPoint2: "Historique complet",
      afterPoint3: "Collaboration fluide",
    },
    useCases: {
      marketing: {
        title: "Marketing",
        description: "Générez des campagnes ciblées avec des templates personnalisables. Créez des variations A/B et suivez les performances.",
      },
      development: {
        title: "Développement",
        description: "Automatisez vos prompts d'IA avec versioning SemVer. Intégrez dans vos workflows CI/CD et partagez avec l'équipe.",
      },
      research: {
        title: "Recherche",
        description: "Centralisez vos templates de recherche. Exportez en JSON/Markdown et collaborez efficacement sur vos projets.",
      },
    },
    quickLinks: {
      resources: {
        title: "Ressources",
        description: "Guides et tutoriels sur le prompt engineering",
        descriptionWithAuth: "(Connexion requise)",
        cta: "Voir les ressources",
      },
      methods: {
        title: "Méthodes",
        description: "12 techniques de prompting expliquées",
        descriptionWithAuth: "(Connexion requise)",
        cta: "Explorer les méthodes",
      },
      faq: {
        title: "FAQ",
        description: "Réponses à vos questions fréquentes",
        descriptionWithAuth: "(Connexion requise)",
        cta: "Voir la FAQ",
      },
      dashboard: {
        title: "Tableau de bord",
        description: "Vue d'ensemble et statistiques",
      },
      newPrompt: {
        title: "Nouveau prompt",
        description: "Créez un prompt avec variables paramétrables",
      },
      myPrompts: {
        title: "Mes prompts",
        description: "Consultez et gérez tous vos prompts",
      },
    },
  },

  // UI Components messages (Phase 2)
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

  // Contextual messages (tooltips, inline help) - Phase 4
  tooltips: {
    prompts: {
      favorite: {
        add: "Ajouter aux favoris",
        remove: "Retirer des favoris",
      },
      visibility: {
        private: "Ce prompt est privé et accessible uniquement par vous",
        privateShared: (count: number) => 
          `Partagé avec ${count} personne${count > 1 ? 's' : ''} spécifique${count > 1 ? 's' : ''}`,
        public: "Ce prompt est accessible à tous les utilisateurs de la plateforme",
      },
      actions: {
        edit: "Modifier ce prompt",
        duplicate: "Dupliquer ce prompt",
        delete: "Supprimer ce prompt",
        share: "Partager ce prompt",
        analyze: "Analyser ce prompt",
        menu: "Ouvrir le menu des actions",
      },
      save: {
        disabled: "Veuillez corriger les erreurs avant d'enregistrer",
        readOnly: "Mode lecture seule - Vous ne pouvez pas modifier ce prompt",
      },
    },
    versions: {
      create: "Créer une nouvelle version",
      delete: "Supprimer cette version",
      restore: "Restaurer cette version",
      compare: "Comparer les versions",
      current: "Version actuelle",
      viewDiff: "Comparer avec la version actuelle",
      restoreVersion: "Restaurer cette version comme version actuelle",
      deleteSelected: "Supprimer les versions sélectionnées",
      selectVersion: "Sélectionner cette version pour suppression",
      currentVersionLocked: "La version actuelle ne peut pas être supprimée",
    },
    variables: {
      add: "Ajouter une nouvelle variable",
      delete: "Supprimer cette variable",
      required: "Cette variable est obligatoire",
      optional: "Cette variable est optionnelle",
      dragHandle: "Glisser pour réorganiser",
      detectAuto: "Détecter automatiquement les variables {{}} dans le prompt",
    },
    analysis: {
      start: "Analyser ce prompt",
      export: "Exporter l'analyse",
      clear: "Effacer l'analyse",
    },
    sharing: {
      addUser: "Ajouter un utilisateur",
      removeAccess: "Retirer l'accès",
      changePermission: "Modifier la permission",
      copyLink: "Copier le lien de partage",
    },
    tags: {
      add: "Ajouter un tag (Entrée)",
      remove: (tag: string) => `Retirer le tag ${tag}`,
    },
    search: {
      clear: "Effacer la recherche",
      filter: "Filtrer les résultats",
    },
  },

  help: {
    prompts: {
      title: "Donnez un nom clair et descriptif à votre prompt",
      description: (current: number, max: number) => 
        `Ajoutez des détails pour retrouver facilement ce prompt plus tard (${current}/${max})`,
      tags: (current: number, max: number) => 
        `Organisez vos prompts avec des mots-clés. Appuyez sur Entrée pour ajouter.${current > 0 ? ` (${current}/${max})` : ''}`,
      tagsEdit: "Modifiez les tags dans la section \"Options avancées\" ci-dessous",
    },
    variables: {
      name: "Nom de la variable (utilisé dans le prompt avec {{nom}})",
      type: "Type de données attendu pour cette variable",
      required: "Si activé, la variable doit être renseignée",
      defaultValue: "Valeur par défaut si non renseignée",
      pattern: "Expression régulière pour valider le format",
      help: "Texte d'aide affiché à l'utilisateur",
    },
    versions: {
      name: "Nom de cette version (optionnel)",
      description: "Description des changements dans cette version",
    },
    sharing: {
      email: "Adresse email de l'utilisateur à ajouter",
      permission: "Niveau d'accès accordé (lecture ou édition)",
    },
  },
} as const;

// Helper type for message keys (useful for future i18n)
export type MessageKey = typeof messages;
