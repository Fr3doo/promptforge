# Architecture de PromptForge

## 📐 Vue d'ensemble

PromptForge suit une architecture **feature-based** avec séparation des préoccupations claire entre les composants UI, la logique métier et l'accès aux données.

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

## 🔧 Modules principaux

### 0. Couche Repository (Nouveau ✨)

#### Architecture

Les repositories encapsulent toute la logique d'accès aux données et appliquent le **principe d'inversion de dépendance** (DIP).

```
src/repositories/
├── PromptRepository.ts       # Interface + implémentation pour les prompts
└── VariableRepository.ts     # Interface + implémentation pour les variables

src/contexts/
├── PromptRepositoryContext.tsx    # Provider pour PromptRepository
└── VariableRepositoryContext.tsx  # Provider pour VariableRepository
```

#### PromptRepository

Interface et implémentation pour la gestion des prompts.

```typescript
export interface PromptRepository {
  fetchAll(): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  create(promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  duplicate(promptId: string): Promise<Prompt>;
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
  toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED"): Promise<"PRIVATE" | "SHARED">;
}
```

**Avantages:**

- ✅ **Testabilité**: Facile à mocker dans les tests
- ✅ **Flexibilité**: Changement de backend sans impact sur les composants
- ✅ **Centralisation**: Logique d'accès aux données au même endroit
- ✅ **Type Safety**: Interfaces TypeScript strictes
- ✅ **DIP**: Composants dépendent d'abstractions, pas d'implémentations

#### VariableRepository

Interface et implémentation pour la gestion des variables.

```typescript
export interface VariableRepository {
  fetch(promptId: string): Promise<Variable[]>;
  create(variable: VariableInsert): Promise<Variable>;
  update(id: string, updates: Partial<Variable>): Promise<Variable>;
  deleteMany(promptId: string): Promise<void>;
  upsertMany(promptId: string, variables: Omit<VariableInsert, "prompt_id">[]): Promise<Variable[]>;
}
```

La méthode `upsertMany` gère intelligemment :

- Insertion de nouvelles variables
- Mise à jour de variables existantes (basé sur le nom)
- Suppression de variables obsolètes
- Réordonnancement automatique

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
│   ├── usePromptForm.ts        # Hook de composition (orchestration)
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

#### Hooks de composition (Nouveau ✨)

Les hooks de composition orchestrent la logique métier complexe en combinant plusieurs hooks spécialisés, suivant le principe de **responsabilité unique** (SRP).

##### usePromptForm

Hook principal pour gérer l'état et la logique du formulaire de prompt.

```typescript
// src/features/prompts/hooks/usePromptForm.ts
export function usePromptForm({ prompt, existingVariables, isEditMode }: UsePromptFormOptions) {
  // Délégation de la sauvegarde
  const { savePrompt, isSaving } = usePromptSave({ isEditMode });

  // État du formulaire
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");

  // Gestion des tags (hook dédié)
  const { tags, addTag, removeTag } = useTagManager();

  // Gestion des variables (hook dédié)
  const { variables, addVariablesFromContent, updateVariable, deleteVariable }
    = useVariableManager({ content, initialVariables: existingVariables });

  const handleSave = async (promptId?: string) => {
    await savePrompt({ title, content, tags, visibility, variables }, promptId);
  };

  return { title, setTitle, content, setContent, handleSave, isSaving, /* ... */ };
}
```

**Utilisation:**

```typescript
function PromptEditor({ promptId }: { promptId?: string }) {
  const { data: prompt } = usePrompt(promptId);
  const { data: existingVariables } = useVariables(promptId);

  const { title, setTitle, handleSave, isSaving } = usePromptForm({
    prompt,
    existingVariables,
    isEditMode: !!promptId,
  });

  return <form onSubmit={() => handleSave(promptId)}>...</form>;
}
```

##### usePromptSave

Hook dédié à la sauvegarde des prompts avec validation Zod et gestion des erreurs.

```typescript
// src/hooks/usePromptSave.ts
export function usePromptSave({ isEditMode, onSuccess }: UsePromptSaveOptions) {
  const { notifyError } = useToastNotifier();
  const { mutate: createPrompt } = useCreatePrompt();
  const { mutate: updatePrompt } = useUpdatePrompt();
  const { mutate: saveVariables } = useBulkUpsertVariables();

  const savePrompt = async (data: PromptSaveData, promptId?: string) => {
    try {
      // Validation Zod
      const validated = promptSchema.parse(data);

      if (isEditMode && promptId) {
        updatePrompt({ id: promptId, updates: validated });
      } else {
        createPrompt(validated);
      }

      // Sauvegarde des variables
      saveVariables({ promptId, variables: data.variables });
    } catch (error) {
      notifyError("Erreur de sauvegarde");
    }
  };

  return { savePrompt, isSaving };
}
```

**Responsabilités:**

- ✅ Validation des données (Zod)
- ✅ Création/mise à jour du prompt
- ✅ Sauvegarde des variables associées
- ✅ Gestion des notifications
- ✅ Navigation après succès

##### useTagManager

Hook simple pour gérer l'état et la logique des tags.

```typescript
// src/hooks/useTagManager.ts
export function useTagManager(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return { tags, setTags, tagInput, setTagInput, addTag, removeTag };
}
```

**Responsabilités:**

- ✅ État des tags
- ✅ Ajout avec dédoublonnage
- ✅ Suppression de tags

##### useVariableManager

Hook pour synchroniser les variables détectées dans le contenu avec les variables configurées.

```typescript
// src/hooks/useVariableManager.ts
export function useVariableManager({ content, initialVariables }: UseVariableManagerOptions) {
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const { detectedNames } = useVariableDetection(content);
  const { notifySuccess } = useToastNotifier();

  // Synchronisation automatique avec le contenu
  useEffect(() => {
    const validVariables = variables.filter(v => detectedNames.includes(v.name));
    if (validVariables.length !== variables.length) {
      setVariables(validVariables); // Supprime les variables obsolètes
    }
  }, [detectedNames]);

  const addVariablesFromContent = () => {
    const newVariables = detectedNames
      .filter(name => !variables.some(v => v.name === name))
      .map((name, index) => ({
        name,
        type: "STRING",
        required: false,
        order_index: variables.length + index,
      }));

    if (newVariables.length > 0) {
      setVariables([...variables, ...newVariables]);
      notifySuccess(`${newVariables.length} variable(s) détectée(s)`);
    }
  };

  return { variables, addVariablesFromContent, updateVariable, deleteVariable };
}
```

**Responsabilités:**

- ✅ Détection automatique des `{{variables}}` dans le contenu
- ✅ Synchronisation avec les variables existantes
- ✅ Suppression automatique des variables obsolètes
- ✅ Notifications utilisateur

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
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

### Documentation du projet

- [ESLint Supabase Rule](./docs/ESLINT_SUPABASE_RULE.md) - ⚠️ Import direct de Supabase interdit
- [Architecture v2 Summary](./docs/ARCHITECTURE_V2_SUMMARY.md) - Récapitulatif des nouveautés v2
- [Testing Guide](./TESTING.md) - Guide des tests unitaires et d'intégration
- [Variable Upsert Security](./docs/VARIABLE_UPSERT_SECURITY.md) - Sécurité de l'upsert des variables
- [Error Boundary](./docs/ERROR_BOUNDARY.md) - Gestion globale des erreurs runtime
- [Codecov Setup](./docs/CODECOV_SETUP.md) - Configuration de la couverture de tests

---

**Dernière mise à jour**: v2.0.0 - 2025-01  
**Architecture**: Feature-based avec Repository Pattern (DIP)
