# Configuration Husky - PromptForge

## Vue d'ensemble

Husky automatise les vérifications de qualité du code avant chaque commit et push, garantissant que le code non conforme ne soit jamais intégré au dépôt.

## ⚠️ Activation requise après clonage

Husky nécessite une **activation manuelle** après le clonage du projet :

```bash
# 1. Installer les dépendances
npm install

# 2. Activer Husky
npx husky install

# 3. Rendre les hooks exécutables (Unix/macOS/Linux)
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg

# Sur Windows (PowerShell), les permissions sont gérées automatiquement
```

### Vérifier l'installation

```bash
# Vérifier que les hooks sont actifs
ls -la .husky/

# Tester un hook manuellement
.husky/pre-commit
```

## Hooks configurés

### 🔍 Pre-commit

**Déclenché :** Avant chaque `git commit`

**Actions automatiques :**

1. **Formatage du code** (`npm run format`)
   - Formate automatiquement tous les fichiers avec Prettier
   - Garantit un style de code cohérent
   - Pas d'intervention manuelle nécessaire

2. **Analyse ESLint** (`npm run lint`)
   - Vérifie les règles de qualité du code
   - Bloque les imports directs de Supabase (règle DIP)
   - Détecte les erreurs TypeScript et React

3. **Tests unitaires** (`npm run test`)
   - Exécute tous les tests Vitest
   - Vérifie que les modifications n'ont pas cassé de tests existants
   - Mode watch désactivé (CI mode)

**Durée estimée :** 10-30 secondes selon le nombre de fichiers modifiés

**En cas d'échec :**
- Le commit est **bloqué**
- Corrigez les erreurs affichées
- Relancez `git commit`

### 🚀 Pre-push

**Déclenché :** Avant chaque `git push`

**Actions automatiques :**

1. **Suite de tests complète** (`npm run test`)
   - Exécute tous les tests du projet
   - Assure la non-régression

2. **Vérification du build** (`npm run build`)
   - Compile le projet en mode production
   - Détecte les erreurs de build avant le déploiement
   - Vérifie que les imports et dépendances sont corrects

**Durée estimée :** 30-90 secondes selon la taille du projet

**En cas d'échec :**
- Le push est **bloqué**
- Consultez les logs d'erreur
- Corrigez et relancez `git push`

### 📝 Commit-msg

**Déclenché :** Après la saisie du message de commit

**Action :** Valide le format des messages selon [Conventional Commits](https://www.conventionalcommits.org/)

**Format requis :**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types autorisés :**

| Type | Usage | Exemple |
|------|-------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(prompts): add version comparison` |
| `fix` | Correction de bug | `fix(auth): resolve session persistence` |
| `docs` | Documentation | `docs(readme): update setup instructions` |
| `style` | Formatage (sans impact fonctionnel) | `style(ui): adjust button spacing` |
| `refactor` | Refactoring | `refactor(repository): extract common logic` |
| `perf` | Amélioration de performance | `perf(prompts): optimize query with indexes` |
| `test` | Tests | `test(hooks): add coverage for usePrompts` |
| `build` | Système de build | `build(vite): update config for chunking` |
| `ci` | CI/CD | `ci(actions): add security scan workflow` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `revert` | Annulation de commit | `revert: feat(analytics): remove tracking` |

**Scopes suggérés :**
- `prompts`, `variables`, `versions`, `auth`, `ui`, `repository`, `hooks`, `tests`, `docs`, `security`

**Exemples valides :**
```bash
git commit -m "feat(versioning): add diff viewer component"
git commit -m "fix(variables): correct upsert logic for renamed vars"
git commit -m "refactor(prompts): migrate to repository pattern"
git commit -m "test(repository): add unit tests for PromptRepository"
git commit -m "docs(architecture): document DIP implementation"
```

**Exemples invalides :**
```bash
git commit -m "Update stuff"           # ❌ Pas de type
git commit -m "added new feature"      # ❌ Type non reconnu
git commit -m "feat: Add feature."     # ❌ Point final interdit
git commit -m "feat(scope):no space"   # ❌ Pas d'espace après :
```

## Workflow recommandé

### Développement quotidien

```bash
# 1. Faire vos modifications
# 2. Ajouter les fichiers au staging
git add .

# 3. Committer (Husky s'exécute automatiquement)
git commit -m "feat(prompts): add export to JSON"
# → Prettier formate
# → ESLint vérifie
# → Tests s'exécutent
# ✅ Commit créé si tout passe

# 4. Pusher (Husky s'exécute automatiquement)
git push
# → Tests complets s'exécutent
# → Build vérifié
# ✅ Push effectué si tout passe
```

### Gestion des échecs

**Si le pre-commit échoue :**

```bash
# Voir les erreurs détaillées
npm run lint         # Vérifier ESLint
npm run test         # Voir les tests en échec

# Corriger les problèmes
# Prettier se relance automatiquement au prochain commit

# Re-committer
git add .
git commit -m "fix(tests): correct failing assertions"
```

**Si le pre-push échoue :**

```bash
# Diagnostiquer le problème
npm run test         # Tester localement
npm run build        # Vérifier le build

# Corriger et recommitter
git add .
git commit -m "fix(build): resolve import paths"
git push
```

## Contournement (usage exceptionnel)

### Contourner un seul commit

```bash
# ⚠️ À utiliser UNIQUEMENT en cas d'urgence
git commit --no-verify -m "emergency: hotfix production issue"
git push --no-verify
```

### Désactiver temporairement

```bash
# Désactiver pour la session
export HUSKY=0

# Faire vos commits
git commit -m "message"
git push

# Réactiver
unset HUSKY
```

**⚠️ Avertissement :** Contourner les hooks expose le projet à :
- Code mal formaté
- Bugs non détectés
- Échecs de build en CI/CD
- Violation des règles d'architecture (imports Supabase directs)

**Utilisez cette option uniquement pour :**
- Hotfixes critiques en production
- Problèmes d'environnement local temporaires
- Commits de merge complexes

## Limitations dans Lovable

### ⚠️ Hooks inactifs dans l'éditeur Lovable

Les hooks Husky **ne fonctionnent PAS** dans l'interface web de Lovable. Ils sont actifs uniquement :

✅ **Environnements supportés :**
- Machine locale après clonage du dépôt
- GitHub Actions / GitLab CI / autres CI/CD
- Tout environnement Git standard (VS Code, terminal, etc.)

❌ **Environnements non supportés :**
- Éditeur web Lovable
- Commits directs via l'interface Lovable

### Workflow avec Lovable

**Dans Lovable (développement rapide) :**
1. Développer et tester manuellement
2. Exécuter `npm run lint` et `npm run test` avant de valider
3. Utiliser GitHub Actions pour validation finale

**Sur machine locale (revue/intégration) :**
1. Cloner le dépôt
2. Activer Husky (voir section activation)
3. Les commits sont automatiquement vérifiés

**Sécurité multi-niveaux :**
- Niveau 1 : Hooks locaux (développeurs)
- Niveau 2 : GitHub Actions (pull requests)
- Niveau 3 : Revue de code manuelle

## Intégration CI/CD

Les mêmes commandes sont exécutées dans GitHub Actions :

```yaml
# .github/workflows/tests.yml
- name: Format check
  run: npm run format:check

- name: Lint
  run: npm run lint

- name: Tests
  run: npm run test

- name: Build
  run: npm run build
```

Cela garantit que même sans hooks locaux, le code est validé avant merge.

## Dépannage

### "Permission denied" sur les hooks

```bash
# Unix/macOS/Linux
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg

# Vérifier les permissions
ls -l .husky/
```

### Les hooks ne se déclenchent pas

```bash
# Réinstaller Husky
rm -rf .husky/_
npx husky install
chmod +x .husky/*
```

### Tests trop lents en pre-commit

Envisager d'utiliser `lint-staged` pour ne tester que les fichiers modifiés :

```bash
npm install --save-dev lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint",
      "vitest related --run"
    ]
  }
}
```

### Conflit avec d'autres hooks Git

Husky gère automatiquement les conflits. Si vous avez des hooks custom :

```bash
# Les ajouter dans .husky/pre-commit
# Husky les exécutera séquentiellement
```

## Performance

### Temps d'exécution moyens

| Hook | Opérations | Temps estimé |
|------|-----------|--------------|
| pre-commit | format + lint + test | 15-30s |
| pre-push | test + build | 45-90s |
| commit-msg | validation message | <1s |

### Optimisations possibles

1. **Tests parallèles** : Vitest exécute déjà les tests en parallèle
2. **Cache ESLint** : ESLint met en cache les résultats
3. **Skip build en dev** : Utiliser `--no-verify` exceptionnellement

## Ressources

- [Documentation Husky](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)

## Support

**Questions fréquentes :**

**Q: Puis-je configurer Husky pour ne lancer que les tests des fichiers modifiés ?**  
R: Oui, utilisez `lint-staged` (voir section Dépannage).

**Q: Les hooks ralentissent trop mon workflow, que faire ?**  
R: Envisagez de désactiver temporairement (`HUSKY=0`) mais assurez-vous que la CI valide votre code.

**Q: Comment tester les hooks sans faire de commit ?**  
R: Exécutez directement `.husky/pre-commit` ou `.husky/pre-push`.

**Q: Pourquoi Prettier formate-t-il mon code automatiquement ?**  
R: C'est voulu ! Cela garantit un style cohérent sans effort manuel.

---

**Dernière mise à jour :** 2025-01-21  
**Version :** 2.0 - Formatage automatique + Tests systématiques  
**Responsable :** Équipe DevOps PromptForge
