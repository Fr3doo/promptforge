# PromptForge 🚀

**Gestionnaire de prompts IA avancé avec versioning, variables et collaboration**

PromptForge est une application web moderne permettant de créer, gérer et versionner vos prompts IA avec un système de variables dynamiques et un historique complet de versions sémantiques.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/votre-username/promptforge/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://github.com/votre-username/promptforge/actions/workflows/tests.yml/badge.svg)](https://github.com/votre-username/promptforge/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/votre-username/promptforge/branch/main/graph/badge.svg)](https://codecov.io/gh/votre-username/promptforge)

## ✨ Fonctionnalités

- 🎯 **Gestion de prompts** - Éditeur riche avec tags, favoris, recherche
- 🔄 **Versioning SemVer** - Historique complet avec diff visuel
- 🎨 **Variables dynamiques** - Détection auto, types multiples, validation
- 💫 **UX Premium** - Animations Framer Motion, feedback immédiat
- 🧪 **Tests complets** - Vitest, Testing Library, CI/CD

## 🚀 Installation

```bash
git clone <repo>
cd promptforge
npm install

# Ajouter les scripts Prettier dans package.json (voir PRETTIER_SETUP.md)
# "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
# "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""

npm run dev
```

## 📖 Documentation

### Guides principaux
- [Architecture](./ARCHITECTURE.md) - Structure interne détaillée
- [Changelog](./CHANGELOG.md) - Historique des versions
- [Contributing](./CONTRIBUTING.md) - Guide de contribution

### Guides techniques
- [Tests](./TESTING.md) - Guide de tests avec Vitest
- [Codecov Setup](./docs/CODECOV_SETUP.md) - Configuration de la couverture de code
- [Codecov PR Guide](./docs/CODECOV_PR_GUIDE.md) - **Pour les contributeurs** : Comprendre les commentaires Codecov
- [Repository Pattern](./docs/REPOSITORY_GUIDE.md) - Créer de nouveaux repositories
- [ESLint Rules](./docs/ESLINT_SUPABASE_RULE.md) - Règles d'architecture
- [Circular Dependencies](./docs/CIRCULAR_DEPENDENCIES.md) - Prévention des imports circulaires
- [Prettier Setup](./PRETTIER_SETUP.md) - Configuration du formatter
- [Husky Hooks](./HUSKY.md) - Git hooks pour qualité de code

## 🛠️ Stack

React 18 • TypeScript • Vite • Tailwind CSS • Framer Motion • React Query • Supabase

---

**Développé avec ❤️**
