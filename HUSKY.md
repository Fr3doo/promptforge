# Configuration Husky

## ⚠️ Important : Activation nécessaire

Husky a été configuré mais nécessite une **activation manuelle** après le clonage du projet :

```bash
# Après avoir cloné le projet
npm install
npx husky install
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg
```

## Hooks configurés

### Pre-commit
Exécute avant chaque commit :
- ✅ `npm run lint` - Vérification ESLint
- ✅ `npm run test` - Tests unitaires

### Pre-push  
Exécute avant chaque push :
- ✅ `npm run test` - Tests complets
- ✅ `npm run build` - Vérification du build

### Commit-msg
Valide le format des messages de commit selon la convention Conventional Commits.

## Format des messages de commit

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types autorisés :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage
- `refactor`: Refactoring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance
- `build`: Build
- `ci`: CI/CD
- `revert`: Annulation

### Exemples :
```bash
git commit -m "feat: add tag manager hook"
git commit -m "fix: correct variable substitution logic"
git commit -m "refactor: extract PromptCard components"
git commit -m "test: add tests for usePromptForm"
```

## Contourner les hooks (déconseillé)

En cas de besoin urgent :
```bash
git commit --no-verify -m "message"
git push --no-verify
```

## Désactiver temporairement

```bash
export HUSKY=0
git commit -m "message"
unset HUSKY
```

## Limitations dans Lovable

⚠️ **Les hooks Husky ne fonctionnent pas dans l'éditeur Lovable**. Ils sont actifs uniquement :
- Sur votre machine locale après clonage
- Dans les workflows GitHub Actions
- Dans tout environnement Git standard

Pour une qualité de code continue dans Lovable, utilisez :
- Tests manuels réguliers (`npm run test`)
- Lint manuel (`npm run lint`)
- GitHub Actions pour validation automatique
