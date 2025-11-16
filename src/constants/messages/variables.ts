/**
 * Variables Domain Messages Module
 * 
 * Responsibilities:
 * - Variables CRUD operations
 * - Variable validation messages
 * - Variable detection notifications
 * - Variables-specific tooltips
 * - Variables help messages
 */

export const variablesMessages = {
  // Main variables messages
  variables: {
    // Empty states
    emptyState: 'Aucune variable détectée. Utilisez le bouton "Détecter variables" ou ajoutez des variables manuellement avec la syntaxe',
    emptyStateWithInstructions: 'Commencez par ajouter des variables avec la syntaxe {{variable}} dans votre prompt, puis utilisez le bouton "Détecter variables".',
    emptyStateWithButton: "Écrivez vos variables avec {{nom}} dans votre prompt, puis cliquez sur le bouton ci-dessus pour les détecter automatiquement.",
    
    // Type labels (for display)
    typeLabels: {
      STRING: "Texte",
      NUMBER: "Nombre",
      BOOLEAN: "Boolean",
      ENUM: "Enum",
      DATE: "Date",
      MULTISTRING: "Multi-texte",
    },
    
    // Type values (lowercase for compatibility)
    types: {
      string: "Texte",
      number: "Nombre",
      boolean: "Boolean",
      enum: "Enum",
      date: "Date",
      multiString: "Multi-texte",
    },
    
    // Form labels
    requiredLabel: "Obligatoire",
    defaultValueLabel: "Valeur par défaut",
    helpTextLabel: "Texte d'aide",
    patternLabel: "Pattern de validation",
    
    // Notifications
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

  // Error messages (Migrated from Step 10.6)
  errors: {
    variables: {
      saveFailed: "Erreur d'enregistrement des variables",
    },
  },

  // Tooltips specific to variables
  tooltips: {
    variables: {
      add: "Ajouter une nouvelle variable",
      delete: "Supprimer cette variable",
      required: "Cette variable est obligatoire",
      optional: "Cette variable est optionnelle",
      dragHandle: "Glisser pour réorganiser",
      detectAuto: "Détecter automatiquement les variables {{}} dans le prompt",
    },
  },

  // Inline help for variables
  help: {
    variables: {
      name: "Nom de la variable (utilisé dans le prompt avec {{nom}})",
      type: "Type de données attendu pour cette variable",
      required: "Si activé, la variable doit être renseignée",
      defaultValue: "Valeur par défaut si non renseignée",
      pattern: "Expression régulière pour valider le format",
      help: "Texte d'aide affiché à l'utilisateur",
    },
  },

  // Editor-related variable messages
  editor: {
    variablesButton: (count: number) => count > 0 ? `Variables (${count})` : "Variables",
  },
} as const;
