# Nouvelle Architecture PromptForge v2

## 📋 Table des matières

1. [Repositories](#0-couche-repository-nouveau-)
   - [PromptRepository](#promptrepository)
   - [VariableRepository](#variablerepository)
2. [Hooks de composition](#hooks-de-composition-nouveau-)
   - [usePromptForm](#usepromptform)
   - [usePromptSave](#usepromptsave)
   - [useTagManager](#usetagmanager)
   - [useVariableManager](#usevariablemanager)
3. [Tests](#tests)
4. [Règles ESLint](#règles-eslint)

---

## Récapitulatif des changements v2

### 🎯 Nouveaux services

#### PromptRepository

- Interface abstraite pour l'accès aux données des prompts
- Implémentation Supabase
- Méthodes: `fetchAll`, `fetchById`, `create`, `update`, `delete`, `duplicate`, `toggleFavorite`, `toggleVisibility`
- Localisation: `src/repositories/PromptRepository.ts`

#### VariableRepository

- Interface abstraite pour l'accès aux données des variables
- Implémentation Supabase avec upsert intelligent
- Méthodes: `fetch`, `create`, `update`, `deleteMany`, `upsertMany`
- Localisation: `src/repositories/VariableRepository.ts`

### 🪝 Nouveaux hooks

#### usePromptForm

- Hook de composition principal pour le formulaire de prompt
- Orchestre: tags, variables, sauvegarde
- Localisation: `src/features/prompts/hooks/usePromptForm.ts`

#### usePromptSave

- Hook dédié à la sauvegarde (création/mise à jour)
- Validation Zod, gestion des erreurs, notifications
- Localisation: `src/hooks/usePromptSave.ts`

#### useTagManager

- Gestion de l'état et de la logique des tags
- Dédoublonnage automatique
- Localisation: `src/hooks/useTagManager.ts`

#### useVariableManager

- Synchronisation des variables détectées dans le contenu
- Suppression automatique des variables obsolètes
- Localisation: `src/hooks/useVariableManager.ts`

### 🧪 Tests

#### Tests unitaires

- `src/repositories/__tests__/PromptRepository.test.ts`
  - Couverture complète des méthodes CRUD
  - Tests de duplication avec variables
  - Tests de gestion des erreurs

- `src/repositories/__tests__/VariableRepository.test.ts`
  - Tests de l'upsert intelligent
  - Tests de suppression de variables obsolètes
  - Tests de gestion des erreurs

#### Tests d'intégration

- `src/features/prompts/hooks/__tests__/usePromptForm.test.tsx`
  - Tests du cycle complet de création
  - Tests du mode édition
  - Tests de la gestion des tags et variables

### ⚙️ Règles ESLint

#### no-restricted-imports

- Interdit l'import direct de `@/integrations/supabase/client`
- Exceptions: repositories, contexts, edge functions, useAuth
- Documentation: `docs/ESLINT_SUPABASE_RULE.md`

**Message d'erreur:**

```
❌ Import direct de Supabase interdit !
Utilisez les repositories (PromptRepository, VariableRepository)
pour respecter le principe d'inversion de dépendance (DIP).
Voir ARCHITECTURE.md pour plus de détails.
```

---

## 🏗️ Architecture en couches

```
┌──────────────────────────────────────┐
│     Composants & Pages               │
│  (UI, formulaires, affichage)        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     Hooks de composition             │
│  usePromptForm, useTagManager, etc.  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     Hooks React Query                │
│  usePrompts, useCreatePrompt, etc.   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     Repositories                     │
│  PromptRepository, VariableRepo      │
│  ⚠️ Seule couche accédant Supabase   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     Supabase Client                  │
│  (Base de données, Auth, Storage)    │
└──────────────────────────────────────┘
```

---

## 🔄 Flux de données

### Création d'un prompt

```
1. User fills form → PromptMetadataForm
2. usePromptForm orchestrates state
3. User clicks Save → handleSave()
4. usePromptSave validates (Zod)
5. usePromptSave calls repository.create()
6. SupabasePromptRepository executes insert
7. Supabase validates + RLS checks
8. Variables saved via repository.upsertMany()
9. React Query cache invalidated
10. Navigation to /prompts
11. Toast notification shown
```

### Détection de variables

```
1. User types {{variable}} in content
2. useVariableDetection detects "variable"
3. useVariableManager syncs state
4. User clicks "Détecter variables"
5. addVariablesFromContent() called
6. New variable added to state
7. VariableConfigPanel re-renders
8. User configures variable type, default, etc.
9. On save, variables sent to repository
```

---

## 📖 Exemples d'utilisation

### Utiliser un Repository dans un composant

```typescript
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";

function MyComponent() {
  const repository = usePromptRepository();

  const { data: prompts } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => repository.fetchAll(),
  });

  return <div>{prompts.map(p => <PromptCard key={p.id} prompt={p} />)}</div>;
}
```

### Utiliser usePromptForm

```typescript
import { usePromptForm } from "@/features/prompts/hooks/usePromptForm";

function PromptEditor({ promptId }: { promptId?: string }) {
  const { data: prompt } = usePrompt(promptId);
  const { data: variables } = useVariables(promptId);

  const {
    title, setTitle,
    content, setContent,
    tags, addTag, removeTag,
    detectVariables,
    handleSave,
    isSaving,
  } = usePromptForm({
    prompt,
    existingVariables: variables,
    isEditMode: !!promptId,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(promptId); }}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} />

      <Button type="button" onClick={detectVariables}>
        Détecter variables
      </Button>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </form>
  );
}
```

### Tester avec des mocks

```typescript
import { vi } from "vitest";

const mockRepository: PromptRepository = {
  fetchAll: vi.fn().mockResolvedValue([]),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  duplicate: vi.fn(),
  toggleFavorite: vi.fn(),
  toggleVisibility: vi.fn(),
};

// Utiliser le mock dans les tests
it("fetches prompts", async () => {
  mockRepository.fetchAll.mockResolvedValue([
    { id: "1", title: "Test" },
  ]);

  const result = await mockRepository.fetchAll();
  expect(result).toHaveLength(1);
});
```

---

## 🎯 Principes SOLID appliqués

### Single Responsibility Principle (SRP)

- ✅ `usePromptSave`: Uniquement la sauvegarde
- ✅ `useTagManager`: Uniquement les tags
- ✅ `useVariableManager`: Uniquement les variables
- ✅ `usePromptForm`: Orchestration uniquement

### Open/Closed Principle (OCP)

- ✅ Repositories: Extension via nouvelles implémentations sans modification des interfaces

### Dependency Inversion Principle (DIP)

- ✅ Composants dépendent de `PromptRepository` (abstraction)
- ✅ Pas de dépendance directe à `supabase` (implémentation)
- ✅ Règle ESLint pour forcer le respect

### Don't Repeat Yourself (DRY)

- ✅ Logique d'upsert centralisée dans `VariableRepository.upsertMany`
- ✅ Validation Zod dans `usePromptSave` uniquement
- ✅ Détection de variables dans `useVariableDetection`

---

## 📚 Ressources

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture complète du projet
- [docs/ESLINT_SUPABASE_RULE.md](./ESLINT_SUPABASE_RULE.md) - Règle ESLint détaillée
- [TESTING.md](../TESTING.md) - Guide des tests
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Dernière mise à jour:** v2.0.0 - 2025-01  
**Auteur:** Équipe Architecture PromptForge
