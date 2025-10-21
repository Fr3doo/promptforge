module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nouvelle fonctionnalité
        'fix',      // Correction de bug
        'docs',     // Documentation
        'style',    // Formatage, point-virgules manquants, etc.
        'refactor', // Refactoring du code
        'perf',     // Amélioration des performances
        'test',     // Ajout de tests
        'chore',    // Tâches de maintenance
        'revert',   // Annulation d'un commit précédent
        'build',    // Changements du système de build
        'ci',       // Changements de la CI
      ],
    ],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100],
  },
};
