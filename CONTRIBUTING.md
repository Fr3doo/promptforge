# Guide de contribution - PromptForge

Merci de votre intérêt pour contribuer à PromptForge ! 🎉

## 🚀 Démarrage rapide

```bash
# Fork et clone
git clone https://github.com/YOUR_USERNAME/promptforge.git
cd promptforge

# Installation
npm install

# Développement
npm run dev

# Tests
npm run test
```

## 📋 Processus de contribution

1. **Fork** le projet
2. **Créer une branche** (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir une Pull Request**

## ✅ Checklist PR

- [ ] Tests passent (`npm run test`)
- [ ] Code formaté (`npm run format`)
- [ ] Types TypeScript valides
- [ ] Documentation mise à jour si nécessaire
- [ ] Changelog mis à jour pour changements significatifs
- [ ] Couverture de code ≥ 70% (vérifier commentaire Codecov)
- [ ] Patch coverage ≥ 70% pour nouveaux changements

## 🧪 Tests

```bash
npm run test              # Mode watch
npm run test:ui           # Interface graphique
npm run test:coverage     # Couverture de code
```

**Couverture minimale attendue** : 70% pour les nouveaux composants

## 📝 Conventions

### Code Style
- **TypeScript strict** obligatoire
- **Functional components** avec hooks
- **Props destructuring** en signature
- **Named exports** (sauf pages)
- **Pas d'imports circulaires** - ESLint empêche automatiquement les cycles

### Commits
Format: `type(scope): message`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemples:
```
feat(versioning): add diff viewer component
fix(auth): resolve session persistence issue
docs(readme): update installation steps
```

### Nommage
- **Composants**: PascalCase (`PromptCard.tsx`)
- **Hooks**: camelCase avec prefix `use` (`usePrompts.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Prompt`, `Variable`)

## 🏗️ Architecture

Respecter l'organisation par features:

```
src/
├── features/
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       └── types.ts
```

## 🐛 Reporter un bug

Inclure:
- Description claire du problème
- Steps to reproduce
- Comportement attendu vs. actuel
- Screenshots si pertinent
- Version du navigateur

## 💡 Proposer une feature

Ouvrir une issue avec:
- Cas d'usage
- Bénéfices utilisateur
- Solution proposée (optionnel)

## 📚 Ressources

- [Architecture](./ARCHITECTURE.md)
- [Guide de tests](./TESTING.md)
- [Guide des Repositories](./docs/REPOSITORY_GUIDE.md) - **Obligatoire** pour ajouter de nouvelles entités
- [Règle ESLint Supabase](./docs/ESLINT_SUPABASE_RULE.md)
- [Détection des dépendances circulaires](./docs/CIRCULAR_DEPENDENCIES.md) - **Prévention des imports circulaires**
- [Guide Codecov pour PR](./docs/CODECOV_PR_GUIDE.md) - **Comprendre les commentaires de couverture**
- [Configuration Codecov](./docs/CODECOV_SETUP.md)
- [Changelog](./CHANGELOG.md)

---

**Questions ?** Ouvrez une issue ou contactez l'équipe !
