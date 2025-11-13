/**
 * Common Messages Module
 * 
 * Responsibilities:
 * - Generic labels used across the application
 * - Placeholders for form inputs
 * - Dialog messages (confirm, cancel, etc.)
 * - Generic errors (validation, network, database)
 * - Buttons labels
 * - Permissions messages
 */

export const commonMessages = {
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

  // Generic errors
  errors: {
    generic: "Une erreur est survenue. Veuillez réessayer.",
    validation: {
      emptyPrompt: "Veuillez saisir un prompt",
      failed: "Validation échouée",
    },
    network: {
      generic: "Erreur de connexion",
      timeout: "Délai d'attente dépassé",
      unavailable: "Service temporairement indisponible",
    },
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
} as const;
