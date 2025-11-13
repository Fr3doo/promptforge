/**
 * Common messages - Generic labels, placeholders, buttons, system errors
 * Reusable across all domains
 */

export const common = {
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
    readOnlyDescription: "Les utilisateurs peuvent uniquement consulter ce prompt",
    readAndWrite: "Lecture et modification",
    readWriteDescription: "Les utilisateurs peuvent consulter et modifier ce prompt",
    publicAccess: "Niveau d'accès public",
    privateAccess: "Niveau d'accès",
    noPermissionToEdit: "Vous n'avez pas la permission de modifier ce prompt",
    noPermissionToDelete: "Vous n'avez pas la permission de supprimer ce prompt",
    noPermissionToShare: "Vous n'avez pas la permission de partager ce prompt",
    noPermissionToCreateVersion: "Vous n'avez pas la permission de créer une version",
    noChangesToVersion: "Aucune modification à versionner",
  },

  // Copy action descriptions
  copy: {
    template: "Template copié",
    export: (label: string) => `${label} copié`,
    download: (name: string) => `${name} téléchargé`,
    copyPromptPreview: "Copier l'aperçu du prompt",
    copyAction: "Copier",
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

  // Error messages (generic and database)
  errors: {
    generic: "Une erreur est survenue. Veuillez réessayer.",
    validation: {
      emptyPrompt: "Veuillez saisir un prompt",
      failed: "Validation échouée",
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
      saveFailed: "Erreur lors de la sauvegarde des variables",
    },
    share: "Erreur lors du partage",
    // Database errors (for getSafeErrorMessage)
    database: {
      // Codes PostgreSQL
      codes: {
        '23505': "Cette valeur existe déjà",
        '23503': "Référence invalide",
        '23514': "Contrainte de validation violée",
        '42501': "Accès non autorisé",
      },
      // Patterns pour correspondances partielles
      patterns: {
        'unique constraint': "Cette valeur existe déjà dans la base de données",
        'foreign key': "Référence à un élément inexistant",
        'check constraint': "Les données ne respectent pas les règles de validation",
        'permission denied': "Vous n'avez pas l'autorisation d'effectuer cette action",
        'duplicate key': "Cette entrée existe déjà",
        'invalid input syntax': "Format de données invalide",
        'violates not-null': "Un champ obligatoire est manquant",
      },
    },
  },

  // Success messages
  success: {
    promptCreated: (title: string) => `Le prompt "${title}" a été créé avec succès`,
    promptUpdated: (title: string) => `Le prompt "${title}" a été mis à jour`,
    promptDeleted: "Le prompt a été supprimé avec succès",
    promptDuplicated: (title: string) => `Une copie de "${title}" a été créée`,
    settingSaved: "Le paramètre a été sauvegardé",
    historyClearedMessage: "L'historique de consultation a été effacé avec succès",
    sharePermissionUpdated: "Les permissions ont été mises à jour",
    signedOut: "Vous avez été déconnecté avec succès",
    copied: "Copié !",
    promptSaved: "Prompt sauvegardé avec succès",
    copiedToClipboard: "Copié dans le presse-papiers",
    downloaded: (name: string) => `${name} téléchargé avec succès`,
    allPrivateSharesDeleted: "Tous les partages privés ont été supprimés",
  },

  // Info messages
  info: {
    unsavedChanges: "Vous avez des modifications non enregistrées",
    leaveWithoutSaving: "Quitter sans enregistrer ?",
    noInternetConnection: "Pas de connexion Internet. Vos modifications seront sauvegardées localement.",
    reconnected: "Connexion rétablie",
    offlineMode: "Mode hors ligne activé",
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
    serverError: {
      title: "Erreur serveur",
      description: "Le serveur a rencontré un problème. Veuillez réessayer.",
    },
    permissionError: {
      title: "Permission refusée",
      description: "Vous n'avez pas l'autorisation d'effectuer cette action",
    },
    conflictError: {
      title: "Conflit détecté",
      description: "Quelqu'un d'autre a modifié ces données. Veuillez recharger.",
    },
    validationError: {
      title: "Erreur de validation",
      description: "Les données saisies ne sont pas valides",
    },
  },
} as const;
