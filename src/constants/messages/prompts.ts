/**
 * Prompts Domain Messages Module
 * 
 * Responsibilities:
 * - Prompts CRUD operations (create, update, delete)
 * - Prompt actions (duplicate, share, etc.)
 * - Prompt list and filtering
 * - Sharing banners and notifications
 * - Conflict detection messages
 * - Prompts-specific tooltips
 * - Prompts help messages
 */

export const promptsMessages = {
  // Prompts-specific notifications
  prompts: {
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
      },

      // Partage privé
      privateShare: {
        added: {
          title: "Partage créé",
          description: (email: string) => `Le prompt a été partagé avec ${email}`,
        },
        permissionUpdated: {
          title: "Permission mise à jour",
          description: "Les droits d'accès ont été modifiés avec succès",
        },
        deleted: {
          title: "Partage supprimé",
          description: "Le partage a été révoqué avec succès",
        },
        errors: {
          userNotFound: {
            title: "Utilisateur introuvable",
            description: "Aucun compte n'existe avec cette adresse email",
          },
          selfShare: {
            title: "Erreur",
            description: "Vous ne pouvez pas partager un prompt avec vous-même",
          },
          notOwner: {
            title: "Action interdite",
            description: "Seul le propriétaire du prompt peut le partager",
          },
          alreadyShared: {
            title: "Déjà partagé",
            description: "Ce prompt est déjà partagé avec cet utilisateur",
          },
          shareNotFound: {
            title: "Erreur",
            description: "Le partage demandé n'existe pas",
          },
          unauthorizedUpdate: {
            title: "Permission refusée",
            description: "Vous n'êtes pas autorisé à modifier ce partage",
          },
          unauthorizedDelete: {
            title: "Permission refusée",
            description: "Vous n'êtes pas autorisé à supprimer ce partage",
          },
        },
      },

      // Visibilité publique
      visibility: {
        shared: {
          title: "Prompt partagé publiquement",
          description: "Le prompt est maintenant accessible à tous les utilisateurs",
        },
        private: {
          title: "Prompt rendu privé",
          description: "Le prompt n'est plus accessible publiquement",
        },
        permissionUpdated: {
          title: "Permission mise à jour",
          description: "Le niveau d'accès public a été modifié",
        },
        errors: {
          cannotUpdatePrivate: {
            title: "Erreur",
            description: "Impossible de modifier la permission d'un prompt privé",
          },
        },
      },
    },
  },

  // Prompt Actions Menu
  promptActions: {
    title: "Actions du prompt",
    edit: "Modifier",
    duplicate: "Dupliquer",
    privateShare: "Partage Privé",
    stopPublicShare: "Arrêter le partage public",
    publicShare: "Partage Public",
    delete: "Supprimer",
  },

  // Prompt List & Empty States
  promptList: {
    noResults: "Aucun résultat",
    noResultsDescription: "Aucun prompt ne correspond à votre recherche. Essayez avec d'autres mots-clés.",
    noSharedPrompts: "Aucun prompt partagé",
    noSharedPromptsDescription: "Vous n'avez pas encore reçu de prompts partagés...",
    noPrompts: "Aucun prompt",
    noPromptsDescription: "Vous n'avez pas encore créé de prompt...",
    createFirstPrompt: "Créer votre premier prompt",
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

  // Conflict detection
  conflict: {
    title: "Conflit détecté",
    description: (timeAgo: string) => 
      `Ce prompt a été modifié par un autre utilisateur ${timeAgo}. Vos modifications risquent d'écraser les changements récents.`,
    reloadLatest: "Recharger la dernière version",
    continueAnyway: "Continuer malgré tout",
  },

  // Prompts-specific tooltips
  tooltips: {
    prompts: {
      favorite: "Ajouter aux favoris",
      unfavorite: "Retirer des favoris",
      visibility: "Gérer le partage public",
      actions: "Plus d'actions",
      saveDisabled: "Sauvegarde désactivée",
      saveConflict: "Conflit détecté - Rechargez le prompt",
      saveNoPermission: "Vous n'avez pas la permission d'éditer",
      saveInvalid: "Formulaire invalide - Vérifiez les champs",
    },
  },

  // Prompts-specific help messages
  help: {
    prompts: {
      title: "Le titre doit être unique et descriptif",
      description: "Décrivez l'objectif et le contexte d'utilisation de ce prompt",
      tags: "Ajoutez des tags pour faciliter la recherche (max 10)",
      content: "Utilisez {{variable}} pour créer des variables dynamiques",
      visibility: "Le partage public permet à tous les utilisateurs de voir votre prompt",
      permissions: "Choisissez si les utilisateurs peuvent uniquement lire ou aussi modifier",
    },
  },
} as const;
