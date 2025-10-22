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
  },

  // Placeholders
  placeholders: {
    promptTitle: "Ex: Résumé d'articles de blog",
    promptDescription: "Décrivez l'objectif et le contexte d'utilisation de ce prompt",
    promptContent: "Saisissez votre prompt ici...",
    tagInput: "Ex: marketing, email, SEO",
    emailInput: "utilisateur@exemple.com",
    versionMessage: "Décrivez les changements...",
    variableName: "Nom de la variable",
    variableDefaultValue: "Valeur par défaut...",
    variableHelp: "Description ou aide pour cette variable...",
    variableInput: (name: string) => `Entrez ${name}...`,
    search: "Rechercher des prompts...",
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
  },
} as const;

// Helper type for message keys (useful for future i18n)
export type MessageKey = typeof messages;
