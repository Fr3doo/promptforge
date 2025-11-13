/**
 * Contextual messages - Tooltips, inline help
 */

export const contextual = {
  // Tooltips
  tooltips: {
    prompts: {
      favorite: {
        add: "Ajouter aux favoris",
        remove: "Retirer des favoris",
      },
      visibility: {
        private: "Privé - Visible uniquement par vous",
        privateShared: (count: number) => 
          `Partagé avec ${count} utilisateur${count > 1 ? 's' : ''} spécifique${count > 1 ? 's' : ''}`,
        public: "Public - Visible par tous les utilisateurs",
      },
      actions: {
        edit: "Modifier ce prompt",
        duplicate: "Créer une copie de ce prompt",
        share: "Gérer le partage de ce prompt",
        delete: "Supprimer définitivement ce prompt",
        createVersion: "Sauvegarder l'état actuel comme nouvelle version",
        viewVersions: "Consulter l'historique des versions",
      },
    save: {
      hasChanges: "Enregistrer les modifications (Ctrl+S)",
      noChanges: "Aucune modification à enregistrer",
      saving: "Sauvegarde en cours...",
      readOnly: "Mode lecture seule - Vous ne pouvez pas modifier ce prompt",
      disabled: "Sauvegarde désactivée - Aucune modification détectée",
    },
    },
    versions: {
      create: "Créer une nouvelle version pour suivre les changements",
      delete: "Supprimer cette version de l'historique",
      restore: "Restaurer cette version comme version actuelle",
      compare: "Comparer cette version avec la version actuelle",
      current: "Version actuellement active",
      major: "Changements incompatibles avec les versions précédentes",
      minor: "Nouvelles fonctionnalités rétrocompatibles",
      patch: "Corrections de bugs et améliorations mineures",
    },
    variables: {
      add: "Ajouter une nouvelle variable",
      delete: "Supprimer cette variable",
      required: "Cette variable est obligatoire",
      optional: "Cette variable est optionnelle",
      pattern: "Définir un pattern de validation (expression régulière)",
      defaultValue: "Valeur utilisée par défaut si aucune valeur n'est fournie",
      helpText: "Texte d'aide affiché à l'utilisateur pour cette variable",
    },
    analysis: {
      analyze: "Lancer l'analyse IA du prompt",
      score: "Score global de qualité du prompt (0-100)",
      complexity: "Niveau de complexité du prompt",
      clarity: "Clarté et compréhensibilité du prompt",
      specificity: "Précision et spécificité des instructions",
      export: "Exporter les résultats de l'analyse",
    },
    sharing: {
      public: "Rendre ce prompt accessible à tous les utilisateurs",
      private: "Partager avec des utilisateurs spécifiques",
      permission: {
        readOnly: "L'utilisateur peut uniquement consulter le prompt",
        readWrite: "L'utilisateur peut consulter et modifier le prompt",
      },
      stopSharing: "Arrêter tous les partages de ce prompt",
    },
    tags: {
      add: "Ajouter des tags pour faciliter la recherche",
      remove: "Supprimer ce tag",
      suggestions: "Tags suggérés basés sur le contenu",
    },
    search: {
      filter: "Filtrer les prompts par catégorie",
      sort: "Trier les résultats",
      clear: "Effacer les filtres de recherche",
    },
  },

  // Inline help
  help: {
    prompts: {
      title: "Le titre doit être court et descriptif (max 100 caractères)",
      description: (current: number, max: number) => 
        `Décrivez le but et le contexte d'utilisation de ce prompt (${current}/${max} caractères)`,
      content: "Utilisez {{nom_variable}} pour créer des variables dynamiques",
      tags: (count: number, max: number) => 
        `Ajoutez des tags séparés par des virgules pour faciliter la recherche (${count}/${max})`,
      tagsEdit: "Modifiez ou supprimez les tags existants",
      category: "Choisissez la catégorie qui correspond le mieux à votre prompt",
      visibility: "Définissez qui peut voir et utiliser ce prompt",
    },
    versions: {
      type: "Choisissez le type de version selon l'importance des changements",
      message: "Décrivez brièvement les changements effectués dans cette version",
      semver: "Utilisez le versioning sémantique : MAJOR.MINOR.PATCH",
    },
    variables: {
      name: "Nom de la variable tel qu'il apparaîtra dans le prompt (ex: nom_client)",
      type: "Type de données attendu pour cette variable",
      defaultValue: "Valeur par défaut si l'utilisateur ne fournit rien",
      required: "Cochez si cette variable doit obligatoirement être remplie",
      pattern: "Expression régulière pour valider le format de la variable",
      helpText: "Texte d'aide affiché à l'utilisateur lors de la saisie",
    },
    analysis: {
      prompt: "Collez le prompt que vous souhaitez analyser",
      results: "Les résultats incluent un score de qualité et des suggestions d'amélioration",
      export: "Vous pouvez exporter les résultats au format JSON, Markdown ou PDF",
    },
  },
} as const;
