/**
 * Prompts domain messages - CRUD, sharing, visibility, conflicts, versions
 */

export const prompts = {
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

  // Prompt actions menu
  promptActions: {
    title: "Actions",
    edit: "Modifier",
    editTitle: "Modifier",
    editDescription: "Éditer le contenu et les métadonnées du prompt",
    duplicate: "Dupliquer",
    duplicateTitle: "Dupliquer",
    duplicateDescription: "Créer une copie de ce prompt",
    privateShare: "Partager (privé)",
    publicShare: "Rendre public",
    stopPublicShare: "Rendre privé",
    shareTitle: "Partager",
    shareDescription: "Gérer le partage de ce prompt",
    delete: "Supprimer",
    deleteTitle: "Supprimer",
    deleteDescription: "Supprimer définitivement ce prompt",
    createVersionTitle: "Créer une version",
    createVersionDescription: "Sauvegarder l'état actuel comme nouvelle version",
    viewVersionsTitle: "Voir les versions",
    viewVersionsDescription: "Consulter l'historique des versions",
  },

  // Prompt list messages
  promptList: {
    emptyState: {
      noPromptsTitle: "Aucun prompt trouvé",
      noPromptsDescription: "Commencez par créer votre premier prompt",
      noResultsTitle: "Aucun résultat",
      noResultsDescription: "Aucun prompt ne correspond à votre recherche",
    },
    noResults: "Aucun résultat",
    noResultsDescription: "Aucun prompt ne correspond à votre recherche",
    noSharedPrompts: "Aucun prompt partagé",
    noSharedPromptsDescription: "Aucun prompt n'a encore été partagé avec vous",
    noPrompts: "Aucun prompt",
    noPromptsDescription: "Commencez par créer votre premier prompt",
    createFirstPrompt: "Créer mon premier prompt",
    filters: {
      allPrompts: "Tous les prompts",
      myPrompts: "Mes prompts",
      sharedWithMe: "Partagés avec moi",
      favorites: "Favoris",
      archived: "Archivés",
    },
  },

  // Share banners and notifications
  shareBanner: {
    promptCreated: "Prompt créé avec succès !",
    shareQuestion: (title: string) => 
      `Souhaitez-vous partager "${title}" avec d'autres utilisateurs ?`,
    sharedWithYou: "Ce prompt a été partagé avec vous",
    canEdit: "Vous pouvez le modifier",
    readOnly: "Vous pouvez uniquement le consulter",
  },

  // Shared with section
  sharedWith: {
    label: "Partagé avec",
    sharedOn: "Partagé le",
  },

  // Conflict messages
  conflict: {
    title: "Conflit de modification détecté",
    description: (timeAgo: string) => `Une version plus récente de ce prompt existe (mise à jour ${timeAgo}). Veuillez recharger avant de sauvegarder.`,
    action: "Recharger maintenant",
    ignoreAction: "Ignorer et continuer (risque de perte de données)",
    reloadLatest: "Recharger la dernière version",
    continueAnyway: "Continuer quand même",
  },

  // Prompts-specific notifications
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
        title: "Permission refusée",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
      },
      conflictError: {
        title: "Conflit détecté",
        description: "Ce prompt a été modifié par quelqu'un d'autre. Rechargez avant de sauvegarder.",
      },
      validationError: {
        title: "Erreur de validation",
        description: "Les données saisies ne sont pas valides. Vérifiez les champs obligatoires.",
      },
    },

    // Succès - Partage
    share: {
      added: {
        title: "Partage ajouté",
        description: (email: string) => `Le prompt a été partagé avec ${email}`,
      },
      permissionUpdated: {
        title: "Permission mise à jour",
        description: "Les droits d'accès ont été modifiés",
      },
      deleted: {
        title: "Partage supprimé",
        description: "L'accès a été révoqué",
      },
      allPrivateDeleted: {
        title: "Tous les partages supprimés",
        description: "Tous les partages privés ont été révoqués",
      },
      errors: {
        userNotFound: "Utilisateur non trouvé",
        selfShare: "Vous ne pouvez pas partager avec vous-même",
        notOwner: "Seul le propriétaire peut gérer les partages",
        alreadyShared: "Déjà partagé avec cet utilisateur",
        shareNotFound: "Partage non trouvé",
        unauthorizedUpdate: "Vous n'êtes pas autorisé à modifier ce partage",
        unauthorizedDelete: "Vous n'êtes pas autorisé à supprimer ce partage",
      },
      publicEnabled: {
        title: "Partage public activé",
        description: "Ce prompt est maintenant accessible publiquement",
      },
      publicDisabled: {
        title: "Partage public désactivé",
        description: "Ce prompt n'est plus accessible publiquement",
      },
      privateAdded: {
        title: "Utilisateur ajouté",
        description: (email: string) => `Le prompt a été partagé avec ${email}`,
      },
      privateUpdated: {
        title: "Permission mise à jour",
        description: "Les droits d'accès ont été modifiés",
      },
      privateDeleted: {
        title: "Partage supprimé",
        description: "L'accès a été révoqué",
      },
      allPrivateDeleted: {
        title: "Tous les partages supprimés",
        description: "Tous les partages privés ont été révoqués",
      },
    },

    // Erreurs - Partage
    shareErrors: {
      createFailed: {
        title: "Erreur de partage",
        description: "Impossible de partager le prompt",
      },
      updateFailed: {
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour les permissions",
      },
      deleteFailed: {
        title: "Erreur de suppression",
        description: "Impossible de supprimer le partage",
      },
      deleteSomeFailed: {
        title: "Suppression partielle",
        description: "Certains partages n'ont pas pu être supprimés",
      },
      publicAlreadyEnabled: {
        title: "Déjà partagé publiquement",
        description: "Ce prompt est déjà accessible publiquement",
      },
      userNotFound: {
        title: "Utilisateur non trouvé",
        description: "L'utilisateur spécifié n'existe pas",
      },
      selfShare: {
        title: "Partage impossible",
        description: "Vous ne pouvez pas partager avec vous-même",
      },
      notOwner: {
        title: "Permission refusée",
        description: "Seul le propriétaire peut gérer les partages",
      },
      alreadyShared: {
        title: "Déjà partagé",
        description: "Ce prompt est déjà partagé avec cet utilisateur",
      },
      shareNotFound: {
        title: "Partage non trouvé",
        description: "Le partage spécifié n'existe pas",
      },
      unauthorizedUpdate: {
        title: "Modification refusée",
        description: "Vous n'êtes pas autorisé à modifier ce partage",
      },
      unauthorizedDelete: {
        title: "Suppression refusée",
        description: "Vous n'êtes pas autorisé à supprimer ce partage",
      },
    },

    // Visibilité
    visibility: {
      changed: {
        title: "Visibilité modifiée",
        description: "Le niveau de visibilité du prompt a été mis à jour",
      },
      shared: {
        title: "Prompt public",
        description: "Le prompt est maintenant accessible à tous les utilisateurs",
      },
      private: {
        title: "Prompt privé",
        description: "Le prompt n'est plus accessible publiquement",
      },
      permissionUpdated: {
        title: "Permission mise à jour",
        description: "Les droits d'accès ont été modifiés",
      },
      errors: {
        cannotUpdatePrivate: {
          title: "Erreur de visibilité",
          description: "Impossible de modifier la visibilité d'un prompt privé",
        },
      },
    },
  },
} as const;
