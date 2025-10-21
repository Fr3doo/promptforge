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

### Étape 4: Configurer codecov.yml (optionnel)

Créer un fichier `codecov.yml` à la racine du projet:

```yaml
coverage:
  status:
    project:
      default:
        target: 70%
        threshold: 2%
    patch:
      default:
        target: 70%

comment:
  layout: "reach, diff, flags, files"
  behavior: default
  require_changes: false

ignore:
  - "src/test/**"
  - "**/*.config.ts"
  - "**/*.config.js"
  - "src/integrations/supabase/types.ts"
```

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

Codecov ajoute automatiquement des commentaires sur les Pull Requests avec:

**Informations incluses:**
- Changement de couverture global (+/-X%)
- Couverture du patch (nouveaux changements)
- Fichiers affectés avec leurs métriques
- Sunburst chart de la couverture

**Exemple de commentaire:**
```
## Codecov Report
Coverage: 75.23% (+0.43%) compared to base

Detailed Changes:
| File | Coverage Δ | Complexity Δ |
|------|-----------|--------------|
| src/components/ErrorBoundary.tsx | 92.30% | +3 |
| src/hooks/useVariables.ts | 88.88% | +1 |
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

- [ ] Intégration Codecov avec code review
- [ ] Alertes si couverture < 70%
- [ ] Dashboard personnalisé avec métriques
- [ ] Couverture différentielle sur PR
- [ ] Tests de mutation (Stryker)
- [ ] Couverture e2e séparée

## Références

- [Codecov Documentation](https://docs.codecov.com/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [GitHub Actions Codecov](https://github.com/codecov/codecov-action)
- [LCOV Format](http://ltp.sourceforge.net/coverage/lcov.php)
