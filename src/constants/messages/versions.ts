/**
 * Versions Domain Messages Module
 * 
 * Responsibilities:
 * - Versions CRUD operations
 * - Version comparison messages
 * - Version restore notifications
 * - Versions-specific tooltips
 * - Versions help messages
 */

export const versionsMessages = {
  // Main versions messages
  versions: {
    // Flat properties for backward compatibility
    typeLabel: "Type de version",
    messageLabel: "Message de version",
    typeMajor: "Major",
    typeMinor: "Minor",
    typePatch: "Patch",
    typeMajorDescription: "Changements incompatibles avec les versions précédentes",
    typeMinorDescription: "Nouvelles fonctionnalités compatibles avec les versions précédentes",
    typePatchDescription: "Corrections de bugs et améliorations mineures",
    
    // Type labels (structured - retained for future use)
    typeLabels: {
      major: "Major",
      minor: "Minor",
      patch: "Patch",
    },
    
    // Type descriptions (structured - retained for future use)
    typeDescriptions: {
      major: "Changements incompatibles avec les versions précédentes",
      minor: "Nouvelles fonctionnalités compatibles avec les versions précédentes",
      patch: "Corrections de bugs et améliorations mineures",
    },
    
    // Version labels
    currentVersion: "Version actuelle",
    newVersion: "Nouvelle version",
    
    // Form labels
    versionTypeLabel: "Type de version",
    versionMessageLabel: "Message de version",
    versionMessagePlaceholder: "Décrivez les changements de cette version...",
    
    // Notifications
    notifications: {
      created: {
        title: "Version créée",
        description: "La nouvelle version a été créée avec succès",
      },
      deleted: {
        title: "Version(s) supprimée(s)",
        description: "Les versions sélectionnées ont été supprimées",
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
          description: "Impossible de supprimer les versions",
        },
        restoreFailed: {
          title: "Erreur de restauration",
          description: "Impossible de restaurer la version",
        },
      },
    },
  },

  // Tooltips specific to versions
  tooltips: {
    versions: {
      create: "Créer une nouvelle version",
      delete: "Supprimer cette version",
      restore: "Restaurer cette version",
      compare: "Comparer les versions",
      viewDiff: "Voir les différences avec la version actuelle",
      restoreVersion: "Restaurer cette version comme version actuelle",
      deleteSelected: "Supprimer les versions sélectionnées",
      selectVersion: "Sélectionner cette version pour suppression",
      currentVersionLocked: "Impossible de supprimer la version actuelle",
    },
  },

  // Help messages for versions
  help: {
    versions: {
      name: "Nom de cette version (optionnel)",
      description: "Description des changements dans cette version",
    },
  },
} as const;
