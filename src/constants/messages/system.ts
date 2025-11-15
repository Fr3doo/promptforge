/**
 * System Messages Module
 * 
 * Responsibilities:
 * - Success notifications
 * - Info notifications
 * - Loading states messages
 * - System-level errors (analysis, save, update, delete, etc.)
 * - Generic actions labels
 * - Copy/clipboard messages
 */

export const systemMessages = {
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
} as const;
