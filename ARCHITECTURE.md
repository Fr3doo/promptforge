# Architecture de PromptForge v2

## 📐 Vue d'ensemble

PromptForge v2 suit une architecture **feature-based** avec séparation des préoccupations claire entre les composants UI, la logique métier et l'accès aux données.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │   Pages    │  │  Features  │  │   Components    │  │
│  │            │  │            │  │                 │  │
│  │  - Auth    │  │  - Prompts │  │  - UI Library   │  │
│  │  - Prompts │  │  - Variables│  │  - Animations  │  │
│  │  - Editor  │  │  - Versions│  │  - Forms        │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
│         │              │                   │            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Hooks & State Management                 │  │
│  │  - React Query (Server State)                    │  │
│  │  - useState/useReducer (UI State)                │  │
│  │  - Custom Hooks (Business Logic)                 │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Repository Layer (DIP)                 │  │
│  │  - PromptRepository                               │  │
│  │  - VariableRepository                             │  │
│  │  ⚠️  Seule couche autorisée à importer Supabase  │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Supabase Client                        │  │
│  │  - Authentication                                 │  │
│  │  - Database Queries                               │  │
│  │  - Real-time Subscriptions                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (Lovable Cloud)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │               PostgreSQL Database                 │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │ Prompts  │  │Variables │  │  Versions    │  │  │
│  │  ├──────────┤  ├──────────┤  ├──────────────┤  │  │
│  │  │ Profiles │  │Var Sets  │  │  User Roles  │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  │                                                   │  │
│  │  Row Level Security (RLS) enabled                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Supabase Auth                          │  │
│  │  - Email/Password                                 │  │
│  │  - Session Management                             │  │
│  │  - JWT Tokens                                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Principes d'architecture

### 1. Séparation des responsabilités

**Pages** (`src/pages/`)
- Orchestration des fonctionnalités
- Routing et navigation
- Layout général de la page

**Features** (`src/features/`)
- Logique métier spécifique
- Composants dédiés à une fonctionnalité
- Hooks personnalisés locaux

**Components** (`src/components/`)
- Composants UI réutilisables
- Pas de logique métier
- Purement présentationnels

### 2. Gestion d'état en couches

```typescript
┌─────────────────────────────────────┐
│      Server State (React Query)      │  ← Données backend
│  - Prompts, Variables, Versions     │
│  - Cache automatique                 │
│  - Invalidation intelligente         │
└─────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────┐
│     Component State (useState)       │  ← État local UI
│  - Formulaires en cours d'édition   │
│  - État des modals/dialogs          │
│  - Filtres de recherche              │
└─────────────────────────────────────┘
              ▲
              │
┌─────────────────────────────────────┐
│    Derived State (useMemo)          │  ← État calculé
│  - Listes filtrées                  │
│  - Données transformées              │
│  - Validations complexes             │
└─────────────────────────────────────┘
```

### 3. Data Flow (Flux de données)

```
User Action (UI Event)
      │
      ▼
Event Handler (Component)
      │
      ▼
Custom Hook (Business Logic)
      │
      ▼
React Query Mutation
      │
      ▼
Repository (PromptRepository, VariableRepository)
      │
      ▼
Supabase Client
      │
      ▼
Database + RLS Checks
      │
      ▼
Response
      │
      ▼
React Query Cache Update
      │
      ▼
Component Re-render (Automatic)
      │
      ▼
UI Update
```

### 4. Repository Pattern (DIP)

PromptForge v2 suit le **principe d'inversion de dépendance** (SOLID) via une couche de repositories.

```
┌────────────────────────────────────────────┐
│         Components & Hooks                 │
│  (Dépendent des abstractions)              │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│         Repository Interfaces              │
│  - PromptRepository                        │
│  - VariableRepository                      │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│    Concrete Implementations                │
│  - SupabasePromptRepository                │
│  - SupabaseVariableRepository              │
│  ⚠️ Seule couche autorisée à importer      │
│     le client Supabase                     │
└──────────────┬─────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────┐
│         Supabase Client                    │
│  (Implémentation bas niveau)               │
└────────────────────────────────────────────┘
```

**Règle ESLint stricte:** L'import direct de `@/integrations/supabase/client` est **interdit** en dehors de :
- `src/repositories/**/*.ts`
- `src/contexts/**/*RepositoryContext.tsx`
- `supabase/functions/**/*.ts`
- `src/hooks/useAuth.tsx`

📖 Voir [docs/ESLINT_SUPABASE_RULE.md](./docs/ESLINT_SUPABASE_RULE.md) pour plus de détails.
```

## 🔧 Modules principaux

### 1. Système de prompts

#### Composants
```
features/prompts/
├── components/
│   ├── PromptCard.tsx          # Carte d'affichage d'un prompt
│   ├── PromptList.tsx          # Liste avec filtres
│   ├── PromptSearchBar.tsx     # Barre de recherche
│   ├── PromptMetadataForm.tsx  # Formulaire de métadonnées
│   ├── PromptContentEditor.tsx # Éditeur de contenu
│   ├── CreateVersionDialog.tsx # Dialog de création de version
│   ├── VersionTimeline.tsx     # Timeline des versions
│   └── DiffViewer.tsx          # Comparaison de versions
├── hooks/
│   ├── usePromptForm.ts        # Logique du formulaire
│   └── usePromptFilters.ts     # Logique de filtrage
└── types.ts                     # Types TypeScript
```

#### Hooks de données

⚠️ **Important:** Les hooks de données utilisent désormais les **repositories** au lieu d'accéder directement à Supabase. Voir [docs/ESLINT_SUPABASE_RULE.md](./docs/ESLINT_SUPABASE_RULE.md).

```typescript
// src/hooks/usePrompts.ts
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";

export function usePrompts() {
  const repository = usePromptRepository();
  
  return useQuery({
    queryKey: ["prompts"],
    queryFn: () => repository.fetchAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: ({ id, updates }) => repository.update(id, updates),
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["prompts", id] });
      const previous = queryClient.getQueryData(["prompts", id]);
      
      queryClient.setQueryData(["prompts", id], (old) => 
        old ? { ...old, ...updates } : old
      );
      
      return { previous };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(["prompts", id], context?.previous);
    },
    onSuccess: (_, { id }) => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      queryClient.invalidateQueries({ queryKey: ["prompts", id] });
    },
  });
}
```

### 2. Système de variables

#### Détection automatique
```typescript
// src/hooks/useVariableDetection.ts
export function useVariableDetection(content: string) {
  return useMemo(() => {
    const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const matches = [...content.matchAll(regex)];
    return Array.from(new Set(matches.map(m => m[1])));
  }, [content]);
}
```

#### Composants modulaires
```
features/variables/
├── components/
│   ├── VariableConfigPanel.tsx    # Panel de configuration
│   ├── VariableConfigItem.tsx     # Item de configuration
│   ├── VariableInputPanel.tsx     # Panel de saisie
│   ├── VariableInputItem.tsx      # Item de saisie
│   └── VariableEmptyState.tsx     # État vide
```

### 3. Système de versioning

#### Architecture SemVer
```typescript
// src/lib/semver.ts
export type VersionBump = "major" | "minor" | "patch";

export function bumpVersion(current: string, type: VersionBump): string {
  const { major, minor, patch } = parseVersion(current);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}
```

#### Stockage des versions
```sql
-- Structure de la table versions
CREATE TABLE versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  content TEXT NOT NULL,
  semver TEXT NOT NULL,
  message TEXT,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Sécurité (RLS)

### Politique de sécurité en couches

```sql
-- 1. Bloquer l'accès anonyme
CREATE POLICY "Deny anonymous access to prompts"
ON prompts FOR ALL
TO anon
USING (false);

-- 2. Permettre lecture des prompts partagés
CREATE POLICY "Users can view own prompts and shared prompts"
ON prompts FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id 
  OR visibility = 'SHARED'
);

-- 3. Contrôler les modifications
CREATE POLICY "Users can update their own prompts"
ON prompts FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

-- 4. Héritage des permissions pour tables liées
CREATE POLICY "Variables inherit prompt permissions"
ON variables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = variables.prompt_id
    AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED')
  )
);
```

## ⚡ Optimisations

### 1. React Query - Stratégies de cache

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min
      cacheTime: 1000 * 60 * 10,       // 10 min
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

### 2. Optimistic Updates

```typescript
// Mise à jour immédiate de l'UI avant la réponse serveur
onMutate: async (newData) => {
  await queryClient.cancelQueries(['prompts']);
  const previous = queryClient.getQueryData(['prompts']);
  queryClient.setQueryData(['prompts'], (old) => {
    return old.map(item => 
      item.id === newData.id ? { ...item, ...newData } : item
    );
  });
  return { previous };
},
onError: (err, newData, context) => {
  // Rollback en cas d'erreur
  queryClient.setQueryData(['prompts'], context.previous);
}
```

### 3. Code Splitting

```typescript
// Lazy loading des pages
const PromptEditor = lazy(() => import('./pages/PromptEditor'));
const Prompts = lazy(() => import('./pages/Prompts'));

// Dans le router
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/editor/:id" element={<PromptEditor />} />
    <Route path="/prompts" element={<Prompts />} />
  </Routes>
</Suspense>
```

### 4. Memoization

```typescript
// Éviter les recalculs inutiles
const filteredPrompts = useMemo(() => {
  return prompts.filter(p => 
    p.title.includes(searchTerm) &&
    (selectedTags.length === 0 || 
     p.tags.some(t => selectedTags.includes(t)))
  );
}, [prompts, searchTerm, selectedTags]);

// Éviter les re-renders inutiles
const PromptCard = memo(({ prompt, onClick }) => {
  // ...
});
```

## 🧪 Architecture de tests

### Stratégie de test en pyramide

```
        ┌─────────────┐
        │    E2E      │  ← Peu, critiques
        │  (Futures)  │
        └─────────────┘
       ┌───────────────┐
       │  Integration  │  ← Quelques-uns
       │    (Hooks)    │
       └───────────────┘
      ┌─────────────────┐
      │   Unit Tests    │  ← Nombreux, rapides
      │  (Components)   │
      └─────────────────┘
```

### Organisation des tests

```
src/
├── hooks/
│   ├── usePrompts.ts
│   └── __tests__/
│       └── usePrompts.test.tsx
├── features/
│   └── prompts/
│       └── components/
│           ├── PromptCard.tsx
│           └── __tests__/
│               └── PromptCard.test.tsx
└── lib/
    ├── validation.ts
    └── __tests__/
        └── validation.test.ts
```

## 🎨 Design System

### Tokens sémantiques

```css
/* index.css */
:root {
  /* Couleurs principales */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  
  /* Couleurs UI */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --muted: 210 40% 96%;
  
  /* États */
  --destructive: 0 84% 60%;
  --success: 142 71% 45%;
  
  /* Animations */
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Composants réutilisables

```typescript
// Hiérarchie des composants
Button
├── LoadingButton (+ état de chargement)
└── IconButton (+ icône)

Card
├── AnimatedCard (+ animations Framer Motion)
└── PromptCard (+ logique métier)

Input
├── ValidatedInput (+ validation Zod)
└── DebounceInput (+ debounce)
```

## 📊 Métriques de performance

### Objectifs

- **Time to Interactive (TTI)** : < 3s
- **First Contentful Paint (FCP)** : < 1.5s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Cumulative Layout Shift (CLS)** : < 0.1
- **Bundle size** : < 300KB (gzipped)

### Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🔄 Flux de données critiques

### Création d'un prompt avec versioning

```
1. User fills form → PromptMetadataForm
2. Validation → Zod schema (client-side)
3. Submit → useCreatePrompt mutation
4. Supabase insert → prompts table
5. RLS check → user owns prompt
6. Success response
7. Auto-create version → useCreateVersion
8. Supabase insert → versions table
9. Cache invalidation → React Query
10. UI update → redirect to editor
```

### Restauration de version

```
1. User clicks "Restore" → VersionTimeline
2. Fetch version data → useVersions
3. Confirm dialog → user approval
4. Update prompt → useUpdatePrompt
   - content ← version.content
   - version ← version.semver
5. Restore variables → batch update
6. Optimistic update → immediate UI feedback
7. Server validation → RLS + constraints
8. Success → cache invalidation
9. UI update → show restored state
```

## 🚀 Évolution future

### Fonctionnalités planifiées

1. **Collaboration en temps réel**
   - Supabase Realtime pour édition collaborative
   - Curseurs multiples et présence

2. **Templates de prompts**
   - Bibliothèque de templates pré-configurés
   - Marketplace communautaire

3. **Analytics d'usage**
   - Tracking des prompts les plus utilisés
   - Statistiques de performance

4. **Export/Import**
   - Export JSON/YAML
   - Import de bibliothèques externes

5. **API publique**
   - REST API pour intégrations tierces
   - Webhooks pour notifications

## 📚 Ressources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [ESLint Supabase Rule](./docs/ESLINT_SUPABASE_RULE.md) - ⚠️ Import direct de Supabase interdit
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

---

**Dernière mise à jour** : v2.0.0 - 2025
