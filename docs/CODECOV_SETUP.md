# Configuration de la Couverture de Tests avec Codecov

## Vue d'ensemble

Ce guide explique comment la couverture de tests est collectée, rapportée et suivie dans PromptForge via Codecov.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Développement Local                     │
│  ┌──────────────────────────────────────────┐  │
│  │  npm run test:coverage                    │  │
│  │  - Exécute Vitest                         │  │
│  │  - Génère rapports locaux                 │  │
│  │  - Affiche dans le terminal               │  │
│  └──────────────────────────────────────────┘  │
│              │                                   │
│              ▼                                   │
│  ┌──────────────────────────────────────────┐  │
│  │  coverage/                                │  │
│  │  - lcov.info                              │  │
│  │  - coverage-final.json                    │  │
│  │  - html/ (visualisation)                  │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     │ Push to GitHub
                     ▼
┌─────────────────────────────────────────────────┐
│          GitHub Actions CI                       │
│  ┌──────────────────────────────────────────┐  │
│  │  1. Checkout code                         │  │
│  │  2. Install dependencies                  │  │
│  │  3. Run tests with coverage               │  │
│  └──────────────────────────────────────────┘  │
│              │                                   │
│              ▼                                   │
│  ┌──────────────────────────────────────────┐  │
│  │  Upload to Codecov                        │  │
│  │  - Envoie lcov.info                       │  │
│  │  - Envoie coverage-final.json             │  │
│  │  - Ajoute métadonnées (commit, branch)    │  │
│  └──────────────────────────────────────────┘  │
│              │                                   │
│              ▼                                   │
│  ┌──────────────────────────────────────────┐  │
│  │  Upload as Artifact                       │  │
│  │  - Sauvegarde rapports pour 7 jours       │  │
│  │  - Téléchargeable depuis Actions          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│             Codecov Dashboard                    │
│  ┌──────────────────────────────────────────┐  │
│  │  - Analyse de la couverture               │  │
│  │  - Tendances temporelles                  │  │
│  │  │  - Visualisation fichiers               │  │
│  │  - Commentaires PR automatiques           │  │
│  │  - Badge pour README                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Configuration

### 1. Vitest Configuration

**Fichier**: `vitest.config.ts`

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html", "lcov", "json-summary"],
  reportsDirectory: "./coverage",
  exclude: [
    "node_modules/",
    "src/test/",
    "**/*.config.ts",
    "**/*.config.js",
    "src/integrations/supabase/types.ts",
    "src/main.tsx",
    "src/vite-env.d.ts",
  ],
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70,
  },
}
```

**Reporters configurés:**
- `text` - Affichage console
- `json` - Format JSON brut
- `html` - Interface web interactive
- `lcov` - Format standard pour Codecov
- `json-summary` - Résumé JSON compact

**Seuils de couverture:**
- **70%** minimum pour chaque métrique
- Empêche la dégradation progressive
- Échoue les builds si en dessous

### 2. GitHub Actions Workflow

**Fichier**: `.github/workflows/tests.yml`

```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info,./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
    verbose: true
```

**Paramètres clés:**
- `token` - Token secret Codecov (requis pour repos privés)
- `files` - Chemins des rapports de couverture
- `flags` - Tag pour identifier les tests unitaires
- `fail_ci_if_error` - Ne pas bloquer le CI si Codecov échoue
- `verbose` - Logs détaillés pour debugging

### 3. Scripts package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Configuration Codecov

### Étape 1: Créer un compte Codecov

1. Aller sur [codecov.io](https://codecov.io/)
2. Se connecter avec votre compte GitHub
3. Autoriser l'application Codecov

### Étape 2: Ajouter le repository

1. Dans Codecov, cliquer sur "Add a repository"
2. Sélectionner votre repository PromptForge
3. Copier le token généré (CODECOV_TOKEN)

### Étape 3: Configurer le secret GitHub

1. Aller dans votre repo GitHub
2. Settings → Secrets and variables → Actions
3. Cliquer "New repository secret"
4. Nom: `CODECOV_TOKEN`
5. Valeur: Coller le token Codecov
6. Cliquer "Add secret"

### Étape 4: Configurer codecov.yml

Le fichier `codecov.yml` à la racine du projet configure le comportement de Codecov :

```yaml
coverage:
  precision: 2
  round: down
  range: "70...100"
  
  status:
    project:
      default:
        target: 70%
        threshold: 2%
    patch:
      default:
        target: 70%
        threshold: 5%

# Configuration des commentaires sur les PR
comment:
  layout: "header, diff, flags, components, files, footer"
  behavior: default
  require_changes: false
  after_n_builds: 1

# Annotations GitHub pour marquer les lignes non couvertes
github_checks:
  annotations: true

annotations:
  enabled: true
  range: "50..100"
  coverage_target: "70%"
  threshold: "2%"

ignore:
  - "src/test/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.config.ts"
  - "src/integrations/supabase/types.ts"
```

**Paramètres clés :**

- **status.project.target** : Couverture minimale du projet (70%)
- **status.project.threshold** : Tolérance de baisse (2%)
- **status.patch.target** : Couverture minimale pour nouveaux changements (70%)
- **comment.layout** : Sections du commentaire PR
- **comment.require_changes** : Commenter même si couverture inchangée
- **github_checks.annotations** : Annoter les lignes non couvertes dans PR
- **annotations.range** : Seuils pour annotations (50-100%)


## Badge README

### Format standard

```markdown
[![codecov](https://codecov.io/gh/OWNER/REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/OWNER/REPO)
```

**Remplacer:**
- `OWNER` par votre nom d'utilisateur GitHub
- `REPO` par le nom du repository

### Exemples de badges

**Badge simple:**
```markdown
[![codecov](https://codecov.io/gh/username/promptforge/branch/main/graph/badge.svg)](https://codecov.io/gh/username/promptforge)
```

**Badge avec token (pour repos privés):**
```markdown
[![codecov](https://codecov.io/gh/username/promptforge/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/username/promptforge)
```

**Badge avec style personnalisé:**
```markdown
[![codecov](https://codecov.io/gh/username/promptforge/branch/main/graph/badge.svg?token=YOUR_TOKEN&style=flat-square)](https://codecov.io/gh/username/promptforge)
```

## Utilisation Locale

### Générer les rapports

```bash
# Exécuter tests avec couverture
npm run test:coverage

# Les rapports sont générés dans coverage/
# - coverage/lcov.info
# - coverage/coverage-final.json
# - coverage/index.html
```

### Visualiser les rapports

**Option 1: HTML interactif**
```bash
# Ouvrir dans le navigateur
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

**Option 2: Vitest UI**
```bash
npm run test:ui
```
- Interface visuelle avec couverture en temps réel
- Accessible sur http://localhost:51204/__vitest__/

## Interprétation des Métriques

### Types de couverture

1. **Lines (Lignes)**
   - Pourcentage de lignes de code exécutées
   - Métrique la plus courante

2. **Functions (Fonctions)**
   - Pourcentage de fonctions appelées
   - Détecte les fonctions non utilisées

3. **Branches (Branches)**
   - Pourcentage de branches conditionnelles testées
   - Important pour if/else, switch, ternaires

4. **Statements (Instructions)**
   - Pourcentage d'instructions exécutées
   - Similaire aux lignes mais plus granulaire

### Objectifs de couverture

| Métrique | Minimum | Cible | Excellence |
|----------|---------|-------|------------|
| Lines    | 70%     | 80%   | 90%+       |
| Functions| 70%     | 80%   | 90%+       |
| Branches | 70%     | 75%   | 85%+       |
| Statements| 70%    | 80%   | 90%+       |

**Notes:**
- 100% n'est pas toujours nécessaire ou souhaitable
- Focus sur les chemins critiques
- Qualité > Quantité

## Commentaires Automatiques sur PR

Codecov ajoute automatiquement des commentaires détaillés sur chaque Pull Request.

### Configuration

Le fichier `codecov.yml` contrôle le comportement des commentaires :

```yaml
comment:
  layout: "header, diff, flags, components, files, footer"
  behavior: default
  require_changes: false  # Commenter même si couverture inchangée
  after_n_builds: 1      # Commenter après le premier build
```

### Contenu des commentaires PR

**1. En-tête (Header)**
- Couverture globale actuelle
- Changement par rapport à la base (+/-X%)
- Statut (✅ passing / ❌ failing)

**2. Différences (Diff)**
- Couverture du patch (nouveaux changements)
- Pourcentage du code ajouté qui est testé
- Impact sur la couverture globale

**3. Flags**
- Statut des différents types de tests (unittests, integration, etc.)
- Couverture par type de test

**4. Composants**
- Analyse par composant ou module
- Tendances de couverture

**5. Fichiers (Files)**
- Liste des fichiers modifiés
- Couverture actuelle vs. précédente pour chaque fichier
- Indicateur visuel (✅ améliorée, ⚠️ réduite, ➖ inchangée)

**6. Pied de page (Footer)**
- Liens vers dashboard Codecov
- Instructions pour visualiser en détail

### Exemple de commentaire complet

```markdown
## [Codecov](https://codecov.io/gh/user/promptforge) Report
> Merging #42 (abc123) into main (def456) will **increase** coverage by `0.43%`.
> The diff coverage is `85.71%`.

[![Impacted file tree graph](https://codecov.io/gh/user/promptforge/pull/42/graphs/tree.svg?token=TOKEN)](https://codecov.io/gh/user/promptforge/pull/42)

## Coverage Δ
| [Files](https://app.codecov.io/gh/user/promptforge/pull/42?src=pr&el=tree) | Coverage Δ | Complexity Δ |
|------------|-----------|--------------|
| [src/hooks/useVariableManager.ts](https://app.codecov.io/gh/user/promptforge/pull/42?src=pr&el=tree#diff-c3JjL2hvb2tzL3VzZVZhcmlhYmxlTWFuYWdlci50cw==) | `92.30% <85.71%> (+2.30%)` | `12 <0> (+1)` |
| [src/hooks/useVariableDetection.ts](https://app.codecov.io/gh/user/promptforge/pull/42?src=pr&el=tree#diff-c3JjL2hvb2tzL3VzZVZhcmlhYmxlRGV0ZWN0aW9uLnRz) | `88.88% <ø> (ø)` | `8 <0> (ø)` |

## Flags Coverage Δ
| [Flags](https://app.codecov.io/gh/user/promptforge/pull/42/flags?src=pr&el=flags) | Coverage Δ |
|--------|-----------|
| unittests | `75.66% <85.71%> (+0.43%)` ⬆️ |

**Continue to review full report at [Codecov](https://codecov.io/gh/user/promptforge/pull/42?src=pr&el=continue).**
```

### Annotations GitHub

Avec `github_checks.annotations: true`, Codecov ajoute également :

**1. Checks GitHub**
- Status check visible dans la PR
- Passe ✅ si couverture ≥ target
- Échoue ❌ si couverture < target

**2. Annotations sur le code**
- Lignes non couvertes marquées dans les fichiers modifiés
- Visible directement dans l'onglet "Files changed"
- Aide à identifier rapidement ce qui doit être testé

**Exemple d'annotation :**
```
⚠️ Line 42 is not covered by tests
Coverage: 0 hits, 1 branch
```

### Interprétation des commentaires

**Symboles utilisés :**
- ✅ : Couverture améliorée
- ⚠️ : Couverture réduite
- ➖ : Couverture inchangée
- 🔴 : Couverture en dessous du seuil
- 🟢 : Couverture au-dessus du seuil

**Métriques du patch :**
- `<85.71%>` : Couverture des lignes ajoutées dans cette PR
- `(+2.30%)` : Changement de couverture globale du fichier
- `12 <0> (+1)` : Complexité (actuelle <changement patch> changement total)

### Personnalisation avancée

**Masquer certaines sections :**
```yaml
comment:
  layout: "header, diff, files"  # Enlever flags, components, footer
```

**Ne commenter que si changements :**
```yaml
comment:
  require_changes: true  # Pas de commentaire si couverture identique
```

**Commentaire minimal :**
```yaml
comment:
  layout: "diff"  # Seulement le diff
  behavior: once  # Un seul commentaire, mise à jour ensuite
```

## Bonnes Pratiques

### 1. Exécuter avant chaque commit

```bash
# Hook pre-commit avec Husky
# .husky/pre-commit
npm run test:coverage
```

### 2. Ignorer les fichiers générés

```typescript
// vitest.config.ts
exclude: [
  "node_modules/",
  "src/test/",
  "**/*.config.ts",
  "src/integrations/supabase/types.ts", // Auto-généré
]
```

### 3. Surveiller les tendances

- Consulter Codecov régulièrement
- Identifier les fichiers sous-testés
- Prioritiser les fichiers critiques

### 4. Définir des objectifs progressifs

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: auto  # S'adapte à la couverture actuelle
        threshold: 1%  # Tolère une légère baisse
```

### 5. Tester les chemins critiques

Focus sur:
- ✅ Repositories (accès données)
- ✅ Hooks métier (usePrompts, useVariables)
- ✅ Utilitaires (validation, formatage)
- ⚠️ Composants UI (selon criticité)

## Troubleshooting

### Le badge n'affiche pas la bonne couverture

**Solution:**
```bash
# Vérifier que les rapports sont générés
npm run test:coverage
ls -la coverage/

# Vérifier que lcov.info existe
cat coverage/lcov.info

# Re-push pour déclencher le workflow
git commit --allow-empty -m "Trigger CI"
git push
```

### Codecov Action échoue

**Causes possibles:**
1. Token manquant ou invalide
2. Fichiers de couverture non générés
3. Problème réseau

**Debug:**
```yaml
# Ajouter verbose: true
- uses: codecov/codecov-action@v4
  with:
    verbose: true  # Logs détaillés
```

### Couverture à 0% sur Codecov

**Solution:**
1. Vérifier que les tests s'exécutent dans CI
2. Vérifier les chemins des fichiers
3. Vérifier que lcov.info contient des données

```bash
# Localement
npm run test:coverage
cat coverage/lcov.info | head -20
```

### Différence entre local et Codecov

**Causes:**
- Différentes versions de dépendances
- Fichiers exclus différemment
- Cache npm/node_modules

**Solution:**
```bash
# Nettoyer et réinstaller
rm -rf node_modules coverage
npm ci
npm run test:coverage
```

## Améliorations Futures

- [x] Commentaires automatiques sur PR
- [x] Annotations GitHub dans les fichiers modifiés
- [x] Dashboard personnalisé avec métriques
- [x] Couverture différentielle sur PR
- [ ] Intégration Codecov avec code review obligatoire
- [ ] Alertes Slack si couverture < 70%
- [ ] Tests de mutation (Stryker)
- [ ] Couverture e2e séparée

## Workflow typique avec Codecov

### Pour les contributeurs

1. **Créer une branche et faire des modifications**
   ```bash
   git checkout -b feat/new-feature
   # Faire des modifications
   ```

2. **Tester localement avec couverture**
   ```bash
   npm run test:coverage
   # Vérifier que la couverture est ≥ 70%
   ```

3. **Créer une Pull Request**
   - GitHub Actions s'exécute automatiquement
   - Codecov analyse la couverture
   - Un commentaire détaillé est ajouté en quelques minutes

4. **Consulter le commentaire Codecov**
   - Vérifier que la couverture globale n'a pas baissé
   - Identifier les fichiers modifiés sous-testés
   - Corriger si nécessaire

5. **Ajouter des tests si requis**
   ```bash
   # Ajouter des tests pour les lignes non couvertes
   git add .
   git commit -m "test: add coverage for edge cases"
   git push
   # Codecov met à jour le commentaire
   ```

### Pour les reviewers

1. **Consulter le commentaire Codecov dans la PR**
   - Vérifier que le patch coverage ≥ 70%
   - Identifier les fichiers critiques sans tests

2. **Utiliser les annotations GitHub**
   - Cliquer sur "Files changed"
   - Les lignes non couvertes sont annotées
   - Demander des tests pour les chemins critiques

3. **Vérifier les tendances**
   - Cliquer sur le lien Codecov dans le commentaire
   - Consulter le dashboard pour voir les tendances
   - S'assurer que la qualité s'améliore progressivement

### Checklist avant merge

- [ ] Couverture globale ≥ 70%
- [ ] Patch coverage ≥ 70%
- [ ] Pas de baisse > 2% de couverture
- [ ] Fichiers critiques (repositories, hooks) bien testés
- [ ] Annotations GitHub résolues ou justifiées
- [ ] Tests passent en CI

## Références

- [Codecov Documentation](https://docs.codecov.com/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [GitHub Actions Codecov](https://github.com/codecov/codecov-action)
- [LCOV Format](http://ltp.sourceforge.net/coverage/lcov.php)
