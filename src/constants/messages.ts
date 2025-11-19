/**
 * LEGACY MESSAGES FILE - EN COURS DE SUPPRESSION
 * =================================================
 * 
 * Ce fichier contient les derniers messages non migrés.
 * Il sera supprimé une fois la migration complète vers les modules.
 * 
 * Messages restants :
 * - tooltips.prompts.visibility.private / privateShared / public
 * - tooltips.prompts.actions.save
 * - success.prompts.share.*
 * - errors.analysis.*
 * - dashboard sections labels
 * - marketing.hero.description
 * - marketing.workflow.beforeAfter
 */

export const messages = {
  tooltips: {
    prompts: {
      visibility: {
        private: "Prompt privé - Visible uniquement par vous",
        privateShared: "Prompt partagé - Accessible aux utilisateurs autorisés",
        public: "Prompt public - Visible par tous",
      },
      actions: {
        save: "Enregistrer les modifications",
      },
    },
  },

  success: {
    prompts: {
      share: {
        added: {
          title: "Partage créé",
          description: (email: string) => `Le prompt a été partagé avec ${email}`,
        },
        permissionUpdated: {
          title: "Permission mise à jour",
          description: "Les droits d'accès ont été modifiés avec succès",
        },
        removed: {
          title: "Partage supprimé",
          description: "Le partage a été révoqué avec succès",
        },
        publicEnabled: {
          title: "Partage public activé",
          description: "Le prompt est maintenant accessible publiquement",
        },
        publicDisabled: {
          title: "Partage public désactivé",
          description: "Le prompt n'est plus accessible publiquement",
        },
        publicPermissionUpdated: {
          title: "Permission publique mise à jour",
          description: "Les droits d'accès publics ont été modifiés",
        },
        copied: {
          title: "Lien copié",
          description: "Le lien de partage a été copié dans le presse-papiers",
        },
      },
    },
  },

  errors: {
    analysis: {
      failed: "L'analyse du prompt a échoué",
      unavailable: "Le service d'analyse est temporairement indisponible",
    },
  },

  dashboard: {
    noDataAvailable: "Aucune donnée disponible",
    noDataDescription: "Commencez par créer votre premier prompt",
    subtitle: "Aperçu de vos prompts et activités",
    sections: {
      mostUsedPrompts: "Prompts les plus utilisés",
      usageStatistics: "Statistiques d'utilisation",
      recentlyModified: "Modifiés récemment",
      favoritePrompts: "Prompts favoris",
      communityShared: "Partagés avec la communauté",
    },
    stats: {
      usages: "utilisations",
      successRate: "de réussite",
    },
  },

  marketing: {
    hero: {
      description: "Organisez, versionnez et partagez vos prompts IA de manière professionnelle",
    },
    workflow: {
      beforeAfter: "Avant / Après PromptForge",
    },
  },
} as const;
