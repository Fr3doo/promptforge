# Système de Qualité de Code - PromptForge

## Vue d'ensemble

PromptForge implémente un système de qualité de code multi-niveaux garantissant que chaque changement respecte les standards du projet.

## Architecture du système

```
┌─────────────────────────────────────────────────────────────────┐
│                    Développement Local                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Développeur écrit du code                                   │
│     ├─ ESLint vérifie en temps réel (IDE)                       │
│     ├─ TypeScript valide les types                              │
│     └─ Prettier suggère le formatage                            │
│                                                                  │
│  2. git add . && git commit                                     │
│     ├─ Hook pre-commit (Husky) s'exécute automatiquement:       │
│     │  ├─ npm run format (formate automatiquement)              │
│     │  ├─ npm run lint (vérifie règles ESLint)                  │
│     │  └─ npm run test (exécute tous les tests)                 │
│     │                                                            │
│     └─ Hook commit-msg vérifie le format Conventional Commits   │
│                                                                  │
│  3. git push                                                    │
│     └─ Hook pre-push s'exécute:                                 │
│        ├─ npm run test (tests complets)                         │
│        └─ npm run build (vérifie que le build fonctionne)       │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Workflow Tests déclenché sur push/PR                        │
│     ├─ Checkout code                                            │
│     ├─ Install dependencies                                     │
│     ├─ npm run format:check                                     │
│     ├─ npm run lint                                             │
│     ├─ npm run test:coverage                                    │
│     └─ Upload coverage to Codecov                               │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Codecov                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Analyse les rapports de couverture                          │
│  2. Compare avec la branche main                                │
│  3. Calcule le diff coverage (patch coverage)                   │
│  4. Génère un commentaire détaillé sur la PR                    │
│  5. Ajoute des annotations GitHub sur les lignes non couvertes  │
│  6. Met à jour les checks GitHub (✅/❌)                         │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Pull Request Review                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Reviewer vérifie:                                              │
│  ├─ ✅ Tous les checks passent                                  │
│  ├─ 📊 Commentaire Codecov (couverture ≥ 70%)                   │
│  ├─ 🎯 Patch coverage ≥ 70%                                     │
│  ├─ 🔍 Annotations résolues ou justifiées                       │
│  ├─ 📝 Code respecte l'architecture (DIP, SOLID)                │
│  └─ ✅ Approuve et merge                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Niveaux de protection

### Niveau 1 : Développement local (Instantané)

**Outils :**
- ESLint (IDE)
- TypeScript (IDE)
- Prettier (IDE)

**Quand :** En temps réel pendant le développement

**Avantage :** Feedback immédiat, pas besoin d'attendre le commit

### Niveau 2 : Pre-commit hooks (< 30s)

**Outils :**
- Husky pre-commit
- Prettier (formatage auto)
- ESLint (vérification)
- Vitest (tests unitaires)

**Quand :** Avant chaque commit

**Avantage :** Bloque les commits non conformes localement

**Désactivation :** `git commit --no-verify` (déconseillé)

### Niveau 3 : Pre-push hooks (< 90s)

**Outils :**
- Husky pre-push
- Vitest (suite complète)
- Vite build

**Quand :** Avant chaque push

**Avantage :** Vérifie que le code est prêt pour la CI

### Niveau 4 : GitHub Actions CI (2-5 min)

**Outils :**
- Workflow Tests
- Format check
- Lint
- Tests + couverture
- Codecov upload

**Quand :** Sur chaque push et PR

**Avantage :** Environnement neutre, validation pour tous (même sans hooks locaux)

### Niveau 5 : Codecov Analysis (< 1 min après CI)

**Outils :**
- Codecov
- Analyse de couverture
- Diff coverage
- Annotations GitHub

**Quand :** Après les tests CI

**Avantage :** Visibilité sur l'impact qualité, guide les contributeurs

### Niveau 6 : Code Review (Variable)

**Acteurs :**
- Reviewers humains
- Maintainers

**Quand :** Avant merge

**Avantage :** Validation finale de la logique métier et architecture

## Métriques de qualité

### Couverture de code

| Métrique | Minimum | Cible | Excellence |
|----------|---------|-------|------------|
| Lines    | 70%     | 80%   | 90%+       |
| Functions| 70%     | 80%   | 90%+       |
| Branches | 70%     | 75%   | 85%+       |
| Statements| 70%    | 80%   | 90%+       |

**Appliqué par :**
- Vitest thresholds (local + CI)
- Codecov status checks (PR)
- Code review (humain)

### Règles ESLint

**Critiques (bloquantes) :**
- ❌ Import direct Supabase hors repositories
- ❌ Unused variables (@typescript-eslint)
- ❌ React hooks rules violations
- ❌ Missing dependencies in useEffect

**Recommandations (warnings) :**
- ⚠️ Console.log en production
- ⚠️ TODO comments

### Formatage

**Outil :** Prettier

**Configuration :**
- Semi-colons: Oui
- Quotes: Double
- Trailing comma: ES5
- Print width: 80
- Tab width: 2

**Appliqué par :**
- Pre-commit (auto-formatage)
- CI (vérification)

### Commits

**Convention :** Conventional Commits

**Format :** `type(scope): subject`

**Types valides :**
- feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Appliqué par :**
- commitlint (pre-commit hook)

## Workflow contributeur complet

### 1. Développement

```bash
# Créer une branche
git checkout -b feat/new-feature

# Développer
# - ESLint et TypeScript vous guident en temps réel

# Tester localement
npm run test

# Vérifier la couverture
npm run test:coverage
open coverage/index.html
```

### 2. Commit

```bash
# Stager les changements
git add .

# Committer (Husky s'exécute automatiquement)
git commit -m "feat(prompts): add export to JSON"

# → Prettier formate automatiquement
# → ESLint vérifie
# → Tests s'exécutent
# → Commit créé si tout passe ✅
```

### 3. Push

```bash
# Pusher (Husky pre-push s'exécute)
git push origin feat/new-feature

# → Tests complets s'exécutent
# → Build vérifié
# → Push effectué si tout passe ✅
```

### 4. Pull Request

```bash
# Créer la PR sur GitHub
# → GitHub Actions s'exécute (2-5 min)
# → Codecov analyse la couverture (< 1 min après)
# → Commentaire Codecov apparaît sur la PR
# → Annotations ajoutées sur les fichiers modifiés
```

### 5. Vérification Codecov

**Dans la PR :**
1. Consulter le commentaire Codecov
2. Vérifier que diff coverage ≥ 70%
3. Cliquer sur "Files changed" → voir annotations
4. Si couverture faible :
   ```bash
   # Identifier les lignes non couvertes
   npm run test:ui
   
   # Ajouter des tests
   # ...
   
   # Committer et pusher
   git add .
   git commit -m "test: add coverage for edge cases"
   git push
   
   # → Codecov met à jour le commentaire
   ```

### 6. Review et merge

**Reviewer vérifie :**
- ✅ Checks GitHub passent
- ✅ Couverture globale ≥ 70%
- ✅ Patch coverage ≥ 70%
- ✅ Architecture respectée
- ✅ Tests pertinents

**Si approuvé :**
```bash
# Merge via GitHub UI
# → Code intégré à main
# → Badge Codecov mis à jour
```

## Désactivation temporaire

### Hooks locaux (urgence uniquement)

```bash
# Désactiver pour une session
export HUSKY=0

# Ou pour un commit unique
git commit --no-verify -m "emergency: hotfix"

# Réactiver
unset HUSKY
```

⚠️ **Attention :** Le code sera quand même validé par la CI

### CI (jamais recommandé)

Pas de mécanisme de bypass. La CI doit toujours passer.

## Maintenance du système

### Mettre à jour les seuils

**Fichier :** `vitest.config.ts`

```typescript
coverage: {
  thresholds: {
    lines: 75,      // Augmenter progressivement
    functions: 75,
    branches: 75,
    statements: 75,
  }
}
```

**Fichier :** `codecov.yml`

```yaml
coverage:
  status:
    project:
      default:
        target: 75%  # Synchroniser avec Vitest
```

### Ajouter de nouvelles règles ESLint

**Fichier :** `eslint.config.js`

```javascript
rules: {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["**/integrations/supabase/client"],
          message: "Use repositories instead",
        },
        // Ajouter de nouvelles restrictions ici
      ],
    },
  ],
}
```

### Exclure des fichiers de la couverture

**Fichier :** `vitest.config.ts`

```typescript
coverage: {
  exclude: [
    "node_modules/",
    "src/test/",
    "**/*.config.ts",
    // Ajouter ici
  ]
}
```

**Fichier :** `codecov.yml`

```yaml
ignore:
  - "src/test/**"
  - "**/*.config.ts"
  # Ajouter ici
```

## Métriques du projet

### Dashboards

**GitHub Actions :**
- Visualiser : Repository → Actions
- Historique des runs
- Durée des workflows
- Taux de succès

**Codecov :**
- Visualiser : codecov.io/gh/{owner}/{repo}
- Tendances de couverture
- Sunburst charts
- Fichiers sous-testés

### KPIs à suivre

| Métrique | Objectif |
|----------|----------|
| Couverture globale | Maintenir ≥ 70% |
| Couverture nouvelle code | Toujours ≥ 70% |
| % PR avec baisse couverture | < 10% |
| Temps CI moyen | < 5 min |
| Taux de succès CI | > 95% |

## Ressources

### Guides complets
- [Codecov Setup](./CODECOV_SETUP.md)
- [Codecov PR Guide](./CODECOV_PR_GUIDE.md)
- [Husky Configuration](../HUSKY.md)
- [Testing Guide](../TESTING.md)
- [Contributing](../CONTRIBUTING.md)

### Outils externes
- [Codecov Dashboard](https://codecov.io/)
- [GitHub Actions](https://github.com/features/actions)
- [Vitest](https://vitest.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

**Dernière mise à jour :** 2025-01-21  
**Responsable :** Équipe DevOps PromptForge
