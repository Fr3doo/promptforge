# Changelog

Toutes les modifications notables du projet PromptForge seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [2.0.0] - 2025-01-19

### 🎉 Version majeure avec refactoring complet

Cette version marque une réécriture importante de PromptForge avec de nombreuses améliorations d'architecture, de performance et d'expérience utilisateur.

### ✨ Ajouté

#### Système de versioning
- **Versioning sémantique (SemVer)** pour tous les prompts
  - Support Major.Minor.Patch avec bump automatique
  - Messages de commit pour documenter les changements
  - Historique complet avec timeline visuelle
- **Comparaison de versions (Diff)**
  - Visualisation côte-à-côte des différences
  - Highlighting des ajouts/suppressions
  - Interface de restauration en un clic
- **Hook `useVersions`** pour gestion des versions
- **Hook `usePromptVersioning`** pour logique de versioning
- **Composant `VersionTimeline`** avec animations
- **Composant `CreateVersionDialog`** avec prévisualisation
- **Composant `DiffViewer`** basé sur react-diff-viewer-continued
- **Utilitaires SemVer** (`src/lib/semver.ts`)
  - `bumpVersion()` - Incrémenter version
  - `parseVersion()` - Parser version string
  - `compareVersions()` - Comparer deux versions
  - `isValidSemVer()` - Valider format

#### UX Premium
- **Animations Framer Motion** sur toute l'application
  - Entrées/sorties fluides des composants
  - Hover effects et transitions
  - Stagger animations pour les listes
- **Composant `AnimatedCard`** avec animations configurables
- **Composant `LoadingButton`** avec état de chargement
- **Composant `SaveProgress`** avec barre de progression
- **Composant `EmptyState`** réutilisable
- **Skeleton loaders** pour états de chargement
- **Toast notifications avancées**
  - Utilitaires `successToast`, `errorToast`, `infoToast`, `warningToast`
  - Durées configurables par type
  - Icons contextuels

#### Décomposition en composants
- **Feature-based architecture** avec modules séparés
- **Variables components**
  - `VariableConfigPanel` - Panel de configuration
  - `VariableConfigItem` - Item de configuration individuel
  - `VariableInputPanel` - Panel de saisie
  - `VariableInputItem` - Item de saisie individuel
  - `VariableEmptyState` - État vide pour variables
- **Prompts components** 
  - Séparation claire entre présentation et logique
  - Composants réutilisables et testables

#### Tests
- **Configuration Vitest complète**
  - Support jsdom
  - Coverage reporting (v8)
  - UI mode pour debug interactif
- **Tests unitaires**
  - `src/lib/__tests__/validation.test.ts` - Tests schémas Zod
  - `src/features/prompts/components/__tests__/PromptCard.test.tsx`
  - `src/hooks/__tests__/usePrompts.test.tsx`
- **Utilitaires de test**
  - `src/test/setup.ts` - Configuration globale
  - `src/test/utils.tsx` - Helpers et wrappers
  - `src/test/vitest.d.ts` - Déclarations TypeScript
- **GitHub Actions CI**
  - Exécution automatique des tests
  - Rapports de couverture
  - Configuration `.github/workflows/tests.yml`
- **Documentation TESTING.md**
  - Guide d'écriture de tests
  - Exemples et patterns
  - Bonnes pratiques

### 🔄 Modifié

#### Architecture
- **Refactoring complet** de la structure de fichiers
  - Organisation par features au lieu de types
  - Séparation claire des responsabilités
  - Meilleure scalabilité
- **Hooks optimisés**
  - `usePrompts` avec optimistic updates améliorés
  - `useToggleFavorite` avec meilleure gestion d'erreurs
  - Invalidation de cache plus intelligente
- **Validation améliorée**
  - Messages d'erreur en français
  - Validation plus stricte des patterns
  - Support de tous les types de variables

#### UI/UX
- **PromptCard redesigné**
  - Animations sur hover/tap
  - Meilleur contraste visuel
  - Badge de version visible
- **PromptList amélioré**
  - Stagger animations pour les cartes
  - Gestion d'états vides avec EmptyState
  - Performance améliorée avec memoization
- **PromptEditor enrichi**
  - Onglets pour Editor/Variables/Versions
  - Intégration du système de versioning
  - Feedback visuel de sauvegarde

#### Performance
- **Bundle size réduit** de 15%
- **Code splitting** amélioré
- **Lazy loading** des composants lourds
- **Debouncing** sur recherche et filtres
- **Memoization** des calculs coûteux

### 🐛 Corrigé

- Problème de persistance des favoris après refresh
- Bug de validation des tags vides
- Erreur de race condition sur création de version
- Problème d'affichage des variables avec caractères spéciaux
- Bug de scroll dans le DiffViewer
- Erreur de timezone sur dates de version
- Problème de focus dans les dialogs
- Bug de cache React Query sur suppression

### 🔒 Sécurité

- **Validation renforcée** côté client avec Zod
- **Sanitisation** des entrées utilisateur
- **RLS policies** vérifiées et optimisées
- **Prévention XSS** dans le contenu des prompts
- **Validation des patterns regex** pour éviter ReDoS

### 📚 Documentation

- **README.md** complet avec guide d'installation
- **ARCHITECTURE.md** détaillant la structure interne
- **CHANGELOG.md** (ce fichier)
- **CONTRIBUTING.md** pour les contributeurs
- **TESTING.md** pour le guide de tests

### ⚙️ Infrastructure

- **Configuration TypeScript** optimisée
- **ESLint rules** mises à jour
- **Prettier** configuré
- **Git hooks** avec husky (futur)

---

## [1.0.0] - 2025-01-10

### Version initiale

#### ✨ Fonctionnalités principales

##### Gestion de prompts
- Création, édition, suppression de prompts
- Système de tags pour catégorisation
- Visibilité privée/partagée
- Système de favoris
- Recherche par titre et tags
- Tri par date de modification

##### Variables dynamiques
- Détection automatique des variables `{{nom}}`
- Types supportés: STRING, NUMBER, BOOLEAN, ENUM, DATE, MULTISTRING
- Configuration de variables:
  - Valeurs par défaut
  - Champs obligatoires
  - Patterns de validation (regex)
  - Options pour ENUM
  - Texte d'aide
- Panel de saisie des valeurs
- Prévisualisation en temps réel

##### Authentification
- Sign up / Sign in par email
- Gestion de session avec Supabase Auth
- Profils utilisateurs
- Protection RLS sur toutes les tables

##### UI/UX
- Design moderne avec Tailwind CSS
- Composants shadcn/ui
- Responsive mobile/tablette/desktop
- Thème dark/light automatique
- Toast notifications
- Loading states

##### Backend (Lovable Cloud)
- Base PostgreSQL
- Row Level Security (RLS)
- Tables:
  - `prompts` - Stockage des prompts
  - `variables` - Configuration des variables
  - `variable_sets` - Jeux de valeurs sauvegardés
  - `profiles` - Profils utilisateurs
  - `user_roles` - Gestion des rôles

##### Techniques
- React 18.3 avec TypeScript
- React Query pour state management
- React Hook Form pour formulaires
- Zod pour validation
- Vite pour build
- Supabase client

---

## Comparaison V1 → V2

### Nouveautés majeures

| Fonctionnalité | V1 | V2 |
|----------------|----|----|
| **Versioning** | ❌ Non | ✅ SemVer complet |
| **Diff visuel** | ❌ Non | ✅ Comparaison côte-à-côte |
| **Animations** | ⚠️ Basiques | ✅ Framer Motion |
| **Tests** | ❌ Aucun | ✅ Vitest + Testing Library |
| **Architecture** | ⚠️ Monolithique | ✅ Feature-based |
| **Performance** | ⚠️ Correcte | ✅ Optimisée (optimistic updates) |
| **Documentation** | ⚠️ README basique | ✅ Complète (4 docs) |
| **Empty states** | ⚠️ Texte simple | ✅ Composants dédiés |
| **Loading states** | ⚠️ Spinners | ✅ Skeletons + Progress |
| **Toasts** | ⚠️ Basiques | ✅ Utilitaires typés |

### Améliorations techniques

#### Code quality
- **V1**: Code dispersé, duplication
- **V2**: DRY, components réutilisables, hooks personnalisés

#### Maintenabilité
- **V1**: Difficile à tester, couplage fort
- **V2**: Testable, découplé, modulaire

#### Performance
- **V1**: Re-renders inutiles, cache basique
- **V2**: Memoization, optimistic updates, code splitting

#### DX (Developer Experience)
- **V1**: Configuration minimale
- **V2**: Tests, CI, documentation complète, types stricts

### Migrations nécessaires

Aucune migration de données requise. V2 est compatible avec le schéma V1.

Cependant, les prompts existants auront:
- Version par défaut: `1.0.0`
- Pas d'historique de versions (commence à partir de maintenant)

---

## [Unreleased] - À venir

### En développement

- 🔄 **Collaboration temps réel**
  - Édition collaborative
  - Curseurs multiples
  - Présence en ligne

- 📚 **Templates**
  - Bibliothèque de templates
  - Import/Export
  - Marketplace communautaire

- 📊 **Analytics**
  - Statistiques d'usage
  - Prompts populaires
  - Tendances

- 🔌 **API publique**
  - REST API
  - Webhooks
  - Rate limiting

### Backlog

- Internationalisation (i18n)
- Mode offline (PWA)
- Export PDF
- Intégrations (Slack, Discord)
- AI-assisted prompt optimization

---

## Format de versions

- **Major** (X.0.0): Changements breaking, refactoring majeur
- **Minor** (1.X.0): Nouvelles fonctionnalités, backward compatible
- **Patch** (1.0.X): Bug fixes, améliorations mineures

## Liens

- [Guide de contribution](./CONTRIBUTING.md)
- [Architecture](./ARCHITECTURE.md)
- [Guide de tests](./TESTING.md)
- [Documentation](./README.md)
