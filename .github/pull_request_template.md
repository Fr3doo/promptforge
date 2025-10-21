## Description

<!-- Décrivez brièvement les changements apportés par cette PR -->

## Type de changement

- [ ] 🐛 Bug fix (changement non-breaking qui corrige un problème)
- [ ] ✨ Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] 💥 Breaking change (fix ou feature qui causerait une incompatibilité avec les versions existantes)
- [ ] 📝 Documentation (mise à jour de la documentation uniquement)
- [ ] ♻️ Refactoring (ni fix ni feature, amélioration du code)
- [ ] ✅ Tests (ajout ou modification de tests)
- [ ] 🎨 Style (formatage, points-virgules manquants, etc.)
- [ ] ⚡ Performance (amélioration des performances)

## Checklist

### Tests et qualité

- [ ] Les tests unitaires passent localement (`npm run test`)
- [ ] J'ai ajouté des tests pour mes changements
- [ ] Couverture de code maintenue ou améliorée (vérifier le commentaire Codecov ci-dessous)
- [ ] La couverture du patch (diff coverage) est ≥ 70%
- [ ] Le code est formaté (`npm run format`)
- [ ] Le linter ne signale aucune erreur (`npm run lint`)
- [ ] Les types TypeScript sont valides

### Documentation

- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai ajouté des commentaires JSDoc pour les nouvelles fonctions/classes
- [ ] Le CHANGELOG.md a été mis à jour (pour les changements significatifs)

### Architecture

- [ ] Je respecte le pattern Repository (pas d'import direct de Supabase)
- [ ] Les nouveaux composants suivent les conventions de nommage
- [ ] Les hooks personnalisés commencent par `use`
- [ ] Les tests suivent la structure `__tests__/`

## Couverture Codecov

<!-- ⚠️ Codecov ajoutera automatiquement un commentaire ci-dessous avec les détails de couverture -->

**Avant de demander une revue :**

1. ✅ Vérifiez que le **diff coverage** est ≥ 70%
2. ✅ Consultez les annotations GitHub dans "Files changed" pour voir les lignes non couvertes
3. ✅ Ajoutez des tests si nécessaire
4. 📖 Consultez le [Guide Codecov pour PR](./docs/CODECOV_PR_GUIDE.md) si besoin d'aide

**Actions recommandées si couverture faible :**

```bash
# Générer le rapport localement
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/index.html

# Lancer l'UI de test pour voir les lignes non couvertes
npm run test:ui
```

## Contexte additionnel

<!-- Ajoutez tout contexte pertinent sur la PR ici (captures d'écran, liens, etc.) -->

## Issues liées

<!-- Référencez les issues résolues par cette PR -->

Closes #
Fixes #
Relates to #

---

## Pour les reviewers

**Points d'attention particuliers :**
- [ ] Vérifier la couverture Codecov (commentaire ci-dessous)
- [ ] Vérifier que les fichiers critiques (repositories, hooks) sont bien testés
- [ ] Consulter les annotations GitHub pour identifier les zones non testées
- [ ] S'assurer que la baisse de couverture (si applicable) est justifiée

**Checklist reviewer :**
- [ ] Le code respecte l'architecture du projet
- [ ] Les tests sont pertinents et couvrent les cas importants
- [ ] La documentation est à jour
- [ ] Pas de régression de couverture non justifiée
- [ ] Les commits suivent la convention Conventional Commits
