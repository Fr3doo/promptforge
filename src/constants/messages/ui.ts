/**
 * UI components messages - Navigation, ErrorFallback, UI elements
 */

export const ui = {
  // Navigation
  navigation: {
    home: "Accueil",
    dashboard: "Tableau de bord",
    prompts: "Prompts",
    resources: "Ressources",
    faq: "FAQ",
    promptingMethods: "Méthodes de Prompting",
    settings: "Paramètres",
    profile: "Profil",
    logout: "Déconnexion",
    login: "Connexion",
    signup: "Créer un compte",
  },

  // Error fallback component
  errorFallback: {
    title: "Oups ! Une erreur s'est produite",
    subtitle: "Nous avons rencontré un problème inattendu",
    technicalError: "Erreur technique",
    unknownError: "Erreur inconnue",
    apologyMessage: "Nous nous excusons pour ce désagrément.",
    instructions: {
      tryAgain: "Vous pouvez essayer de :",
      reloadPage: "Recharger la page",
      goBackHome: "Retourner à l'accueil",
      contactSupport: "Contacter le support si le problème persiste",
    },
    buttons: {
      reload: "Recharger la page",
      home: "Retour à l'accueil",
      reportError: "Signaler l'erreur",
      copyError: "Copier les détails de l'erreur",
      retry: "Réessayer",
      goHome: "Retour à l'accueil",
      refresh: "Actualiser",
      viewDetails: "Voir les détails",
    },
    debug: {
      showDetails: "Afficher les détails techniques",
      hideDetails: "Masquer les détails",
      errorDetails: "Détails de l'erreur",
      stackTrace: "Stack trace",
      errorBoundary: "Error Boundary",
      errorMessage: "Message d'erreur",
      componentStack: "Pile des composants",
    },
  },

  // Empty states
  emptyState: {
    noData: "Aucune donnée disponible",
    noResults: "Aucun résultat trouvé",
    noItems: "Aucun élément",
    createFirst: "Créez votre premier élément",
  },

  // Loading states
  loading: {
    default: "Chargement...",
    data: "Chargement des données...",
    saving: "Sauvegarde en cours...",
    deleting: "Suppression en cours...",
    processing: "Traitement en cours...",
  },

  // Confirmation dialogs
  confirmation: {
    title: "Confirmer l'action",
    message: "Êtes-vous sûr de vouloir continuer ?",
    yes: "Oui",
    no: "Non",
    cancel: "Annuler",
    confirm: "Confirmer",
  },

  // Accessibility
  accessibility: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    skipToContent: "Aller au contenu principal",
    screenReaderOnly: "Visible uniquement pour les lecteurs d'écran",
  },
} as const;
