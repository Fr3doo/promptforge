/**
 * Centralized message constants for the application
 * Structured for future i18n implementation
 */

export const messages = {
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
    analysisComplete: "Analyse terminée",
    variablesSaved: "Variables enregistrées",
    variablesDetected: (count: number) => `${count} variable(s) détectée(s)`,
    versionCreated: "Version créée",
    versionDeleted: "Version(s) supprimée(s)",
    versionRestored: (version: string) => `Version ${version} restaurée`,
    downloaded: "Téléchargé",
    templateCopied: "Template copié",
  },

  // Info messages
  info: {
    noNewVariables: "Aucune nouvelle variable détectée",
  },

  // Loading messages
  loading: {
    analyzing: "Analyse en cours...",
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
