/**
 * Variables domain messages - Configuration, validation, input
 */

export const variables = {
  // Variable empty state
  emptyState: {
    title: "Aucune variable détectée",
    description: "Utilisez {{nom_variable}} dans votre prompt pour créer des variables",
    helpText: "Les variables permettent de créer des prompts réutilisables avec différentes valeurs",
  },
  emptyStateWithInstructions: "Ajoutez des variables à votre prompt en utilisant la syntaxe {{nom_variable}}",

  // Variable config panel
  configPanel: {
    title: "Configuration des variables",
    description: "Définissez les propriétés de vos variables",
    nameLabel: "Nom",
    typeLabel: "Type",
    defaultValueLabel: "Valeur par défaut",
    helpTextLabel: "Texte d'aide",
    requiredLabel: "Obligatoire",
    patternLabel: "Pattern de validation",
    minLengthLabel: "Longueur minimale",
    maxLengthLabel: "Longueur maximale",
    optionsLabel: "Options (séparées par des virgules)",
  },

  // Variable input panel
  inputPanel: {
    title: "Valeurs des variables",
    description: "Saisissez les valeurs pour vos variables",
    previewTitle: "Aperçu du prompt",
    fillAllRequired: "Veuillez remplir toutes les variables obligatoires",
  },

  // Variable types
  types: {
    text: "Texte",
    string: "Chaîne de caractères",
    number: "Nombre",
    boolean: "Booléen",
    email: "Email",
    url: "URL",
    date: "Date",
    select: "Sélection",
    enum: "Liste de choix",
    textarea: "Texte long",
    multiString: "Texte multi-lignes",
  },

  typeLabels: {
    STRING: "Chaîne de caractères",
    NUMBER: "Nombre",
    BOOLEAN: "Booléen (Vrai/Faux)",
    ENUM: "Liste de choix",
    DATE: "Date",
    MULTISTRING: "Texte multi-lignes",
  },

  requiredLabel: "Obligatoire",
  defaultValueLabel: "Valeur par défaut",
  patternLabel: "Pattern de validation",

  // Variable notifications
  notifications: {
    saved: {
      title: "Variables sauvegardées",
      description: "La configuration des variables a été enregistrée",
    },
    errors: {
      saveFailed: {
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la configuration des variables",
      },
      createFailed: {
        title: "Erreur de création",
        description: "Impossible de créer la variable",
      },
      updateFailed: {
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour la variable",
      },
      deleteFailed: {
        title: "Erreur de suppression",
        description: "Impossible de supprimer la variable",
      },
      validationFailed: {
        title: "Validation échouée",
        description: (variable: string) => `La variable "${variable}" n'est pas valide`,
      },
      invalidPattern: {
        title: "Pattern invalide",
        description: "Le pattern de validation n'est pas une expression régulière valide",
      },
      requiredMissing: {
        title: "Variable obligatoire",
        description: (variable: string) => `La variable "${variable}" est obligatoire`,
      },
    },
  },
} as const;
