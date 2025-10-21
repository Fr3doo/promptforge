# Guide de création de Repositories

Ce guide détaille la procédure complète pour ajouter une nouvelle entité avec son repository en respectant l'architecture SOLID (DIP) et les principes DRY.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Conventions de nommage](#conventions-de-nommage)
3. [Étapes de création](#étapes-de-création)
4. [Exemples complets](#exemples-complets)
5. [Tests](#tests)
6. [Checklist de revue de code](#checklist-de-revue-de-code)

## Vue d'ensemble

### Architecture en couches

```
┌─────────────────────────────────────────────────────┐
│  Composants & Pages                                 │
│  - Utilisent les hooks de contexte                  │
│  - Ne connaissent pas l'implémentation              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Repository Contexts                                │
│  - Fournissent l'injection de dépendance           │
│  - Permettent le mock en tests                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Repository Interfaces (Abstractions)               │
│  - Définissent le contrat                          │
│  - Indépendantes de l'implémentation                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Repository Implementations                         │
│  - SupabaseXxxRepository                           │
│  - Seuls fichiers autorisant import Supabase       │
│  - Gestion des erreurs centralisée                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Supabase Client                                    │
│  - @/integrations/supabase/client                   │
│  - Généré automatiquement                           │
└─────────────────────────────────────────────────────┘
```

### Principe d'Inversion de Dépendance (DIP)

**Objectif :** Les modules de haut niveau (composants) ne doivent pas dépendre des modules de bas niveau (Supabase). Les deux doivent dépendre d'abstractions (interfaces).

**Bénéfices :**
- ✅ Testabilité accrue (mock facile)
- ✅ Flexibilité (changement de backend possible)
- ✅ Maintenance simplifiée (logique centralisée)
- ✅ Respect de SOLID

## Conventions de nommage

### Fichiers et types

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Interface repository | `{Entity}Repository` | `PromptRepository` |
| Implémentation Supabase | `Supabase{Entity}Repository` | `SupabasePromptRepository` |
| Contexte | `{Entity}RepositoryContext.tsx` | `PromptRepositoryContext.tsx` |
| Hook de contexte | `use{Entity}Repository` | `usePromptRepository` |
| Fichier de repository | `{Entity}Repository.ts` | `PromptRepository.ts` |
| Tests repository | `{Entity}Repository.test.ts` | `PromptRepository.test.ts` |
| Factory function | `create{Entity}Repository` | `createPromptRepository` |

### Types d'entités

| Type | Usage | Exemple |
|------|-------|---------|
| `{Entity}` | Type complet de l'entité | `Prompt` |
| `{Entity}Insert` | Données pour insertion (sans id, created_at, etc.) | `PromptInsert` |
| `{Entity}Update` | Données pour mise à jour (partial) | `Partial<Prompt>` |

## Étapes de création

### Étape 1 : Définir l'interface du repository

**Fichier :** `src/repositories/{Entity}Repository.ts`

**Objectif :** Définir le contrat que toutes les implémentations devront respecter.

**Template de base :**

```typescript
/**
 * Interface defining the contract for {Entity} data operations
 * Follows SOLID DIP by abstracting the data source
 */
export interface {Entity}Repository {
  /**
   * Fetches all {entities} for the current user
   * @returns Promise resolving to array of {entities}
   * @throws Error if fetch fails
   */
  fetchAll(): Promise<{Entity}[]>;

  /**
   * Fetches a single {entity} by ID
   * @param id - The {entity} ID
   * @returns Promise resolving to the {entity}
   * @throws Error if {entity} not found or fetch fails
   */
  fetchById(id: string): Promise<{Entity}>;

  /**
   * Creates a new {entity}
   * @param data - The {entity} data (without id, created_at, etc.)
   * @returns Promise resolving to the created {entity}
   * @throws Error if creation fails
   */
  create(data: {Entity}Insert): Promise<{Entity}>;

  /**
   * Updates an existing {entity}
   * @param id - The {entity} ID
   * @param updates - Partial {entity} data to update
   * @returns Promise resolving to the updated {entity}
   * @throws Error if update fails or {entity} not found
   */
  update(id: string, updates: Partial<{Entity}>): Promise<{Entity}>;

  /**
   * Deletes a {entity}
   * @param id - The {entity} ID
   * @returns Promise resolving when deletion is complete
   * @throws Error if deletion fails
   */
  delete(id: string): Promise<void>;
}
```

**Méthodes supplémentaires courantes :**

```typescript
// Pour les entités avec relations
fetchByParentId(parentId: string): Promise<{Entity}[]>;

// Pour les opérations batch
createMany(items: {Entity}Insert[]): Promise<{Entity}[]>;
deleteMany(ids: string[]): Promise<void>;
upsertMany(items: {Entity}UpsertInput[]): Promise<{Entity}[]>;

// Pour les opérations spécifiques métier
toggleStatus(id: string, currentStatus: boolean): Promise<void>;
search(query: string): Promise<{Entity}[]>;

// IMPORTANT: Ne jamais inclure de dépendances d'authentification
// Les méthodes nécessitant un userId doivent le recevoir en paramètre
create(userId: string, data: {Entity}Insert): Promise<{Entity}>;
duplicate(userId: string, sourceId: string): Promise<{Entity}>;
```

### Étape 2 : Implémenter avec Supabase

**Dans le même fichier :** `src/repositories/{Entity}Repository.ts`

**Template d'implémentation :**

```typescript
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

// Type aliases for clarity
export type {Entity} = Tables<"{table_name}">;
export type {Entity}Insert = TablesInsert<"{table_name}">;

/**
 * Supabase implementation of {Entity}Repository
 * Handles all data operations for {entities} using Supabase client
 */
export class Supabase{Entity}Repository implements {Entity}Repository {
  async fetchAll(): Promise<{Entity}[]> {
    const result = await supabase
      .from("{table_name}")
      .select("*")
      .order("created_at", { ascending: false });

    handleSupabaseError(result);

    return result.data || [];
  }

  async fetchById(id: string): Promise<{Entity}> {
    const result = await supabase
      .from("{table_name}")
      .select("*")
      .eq("id", id)
      .single();

    handleSupabaseError(result);

    if (!result.data) {
      throw new Error("{Entity} not found");
    }

    return result.data;
  }

  async create(userId: string, data: {Entity}Insert): Promise<{Entity}> {
    // IMPORTANT: Accepter userId en paramètre au lieu d'appeler supabase.auth
    // Cela respecte le principe de responsabilité unique (SRP)
    if (!userId) throw new Error("ID utilisateur requis");

    const result = await supabase
      .from("{table_name}")
      .insert({
        ...data,
        owner_id: userId, // ou user_id selon votre schéma
      })
      .select()
      .single();

    handleSupabaseError(result);

    if (!result.data) {
      throw new Error("Failed to create {entity}");
    }

    return result.data;
  }

  async update(id: string, updates: Partial<{Entity}>): Promise<{Entity}> {
    const result = await supabase
      .from("{table_name}")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    handleSupabaseError(result);

    if (!result.data) {
      throw new Error("{Entity} not found or update failed");
    }

    return result.data;
  }

  async delete(id: string): Promise<void> {
    const result = await supabase
      .from("{table_name}")
      .delete()
      .eq("id", id);

    handleSupabaseError(result);
  }
}

/**
 * Factory function to create the default {entity} repository
 * Useful for dependency injection and testing
 */
export const create{Entity}Repository = (): {Entity}Repository => {
  return new Supabase{Entity}Repository();
};
```

**Points importants :**

- ✅ Toujours utiliser `handleSupabaseError(result)` après chaque requête
- ✅ Vérifier `result.data` avant de le retourner
- ✅ Lancer des erreurs explicites avec des messages clairs
- ✅ Utiliser `.select()` après `.insert()` et `.update()` pour récupérer les données
- ✅ Utiliser `.single()` quand on attend un seul résultat
- ✅ **JAMAIS appeler `supabase.auth` dans un repository** - passer `userId` en paramètre
- ✅ Respecter le principe de responsabilité unique (SRP) - le repository gère les données, pas l'authentification

### Étape 3 : Créer le contexte React

**Fichier :** `src/contexts/{Entity}RepositoryContext.tsx`

**Template :**

```typescript
import { createContext, useContext, ReactNode } from "react";
import {
  {Entity}Repository,
  Supabase{Entity}Repository,
} from "@/repositories/{Entity}Repository";

const {Entity}RepositoryContext = createContext<{Entity}Repository | null>(null);

interface {Entity}RepositoryProviderProps {
  children: ReactNode;
  repository?: {Entity}Repository; // Pour les tests
}

/**
 * Provider component for {Entity}Repository
 * Allows dependency injection for testing and flexibility
 */
export function {Entity}RepositoryProvider({
  children,
  repository = new Supabase{Entity}Repository(),
}: {Entity}RepositoryProviderProps) {
  return (
    <{Entity}RepositoryContext.Provider value={repository}>
      {children}
    </{Entity}RepositoryContext.Provider>
  );
}

/**
 * Hook to access the {Entity}Repository from context
 * @throws Error if used outside of {Entity}RepositoryProvider
 */
export function use{Entity}Repository(): {Entity}Repository {
  const context = useContext({Entity}RepositoryContext);
  
  if (!context) {
    throw new Error(
      "use{Entity}Repository must be used within {Entity}RepositoryProvider"
    );
  }
  
  return context;
}
```

**Note :** Le paramètre `repository` optionnel permet d'injecter un mock en tests.

### Étape 4 : Ajouter le provider à l'application

**Fichier :** `src/main.tsx` ou `src/App.tsx`

```typescript
import { {Entity}RepositoryProvider } from "@/contexts/{Entity}RepositoryContext";

// ...

<QueryClientProvider client={queryClient}>
  <{Entity}RepositoryProvider>
    {/* Autres providers */}
    <App />
  </{Entity}RepositoryProvider>
</QueryClientProvider>
```

### Étape 5 : Utiliser dans les composants

**Exemple avec React Query :**

```typescript
import { use{Entity}Repository } from "@/contexts/{Entity}RepositoryContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function {Entity}List() {
  const repository = use{Entity}Repository();
  const queryClient = useQueryClient();

  // Fetch all
  const { data: {entities}, isLoading } = useQuery({
    queryKey: ["{entities}"],
    queryFn: () => repository.fetchAll(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: {Entity}Insert) => repository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{Entity}> }) =>
      repository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => repository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["{entities}"] });
    },
  });

  // ... render logic
}
```

## Exemples complets

### Exemple 1 : Repository simple (AnalysisRepository)

**Cas d'usage :** Appel à une edge function, pas de CRUD sur table.

```typescript
// src/repositories/AnalysisRepository.ts
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";

export interface AnalysisResult {
  sections: Record<string, string>;
  variables: Array<{
    name: string;
    description: string;
    type: string;
  }>;
  metadata: {
    role: string;
    objectifs: string[];
  };
}

export interface AnalysisRepository {
  analyzePrompt(content: string): Promise<AnalysisResult>;
}

export class SupabaseAnalysisRepository implements AnalysisRepository {
  async analyzePrompt(content: string): Promise<AnalysisResult> {
    const result = await supabase.functions.invoke('analyze-prompt', {
      body: { promptContent: content }
    });

    handleSupabaseError(result);

    if (result.data.error) {
      throw new Error(result.data.error);
    }

    return result.data as AnalysisResult;
  }
}

export const createAnalysisRepository = (): AnalysisRepository => {
  return new SupabaseAnalysisRepository();
};
```

### Exemple 2 : Repository avec relations (VariableRepository)

**Cas d'usage :** CRUD avec relations parent-enfant, opérations batch.

```typescript
// src/repositories/VariableRepository.ts
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "@/lib/errorHandler";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Variable = Tables<"variables">;
export type VariableInsert = TablesInsert<"variables">;

export interface VariableUpsertInput {
  id?: string;
  name: string;
  type: string;
  default_value?: string;
  required?: boolean;
  help?: string;
  options?: string[];
}

export interface VariableRepository {
  fetch(promptId: string): Promise<Variable[]>;
  create(variable: VariableInsert): Promise<Variable>;
  update(id: string, updates: Partial<Variable>): Promise<Variable>;
  deleteMany(promptId: string): Promise<void>;
  upsertMany(promptId: string, variables: VariableUpsertInput[]): Promise<Variable[]>;
}

export class SupabaseVariableRepository implements VariableRepository {
  async fetch(promptId: string): Promise<Variable[]> {
    const result = await supabase
      .from("variables")
      .select("*")
      .eq("prompt_id", promptId)
      .order("order_index", { ascending: true });

    handleSupabaseError(result);
    return result.data || [];
  }

  async create(variable: VariableInsert): Promise<Variable> {
    const result = await supabase
      .from("variables")
      .insert(variable)
      .select()
      .single();

    handleSupabaseError(result);

    if (!result.data) {
      throw new Error("Failed to create variable");
    }

    return result.data;
  }

  async update(id: string, updates: Partial<Variable>): Promise<Variable> {
    const result = await supabase
      .from("variables")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    handleSupabaseError(result);

    if (!result.data) {
      throw new Error("Variable not found or update failed");
    }

    return result.data;
  }

  async deleteMany(promptId: string): Promise<void> {
    const result = await supabase
      .from("variables")
      .delete()
      .eq("prompt_id", promptId);

    handleSupabaseError(result);
  }

  async upsertMany(
    promptId: string,
    variables: VariableUpsertInput[]
  ): Promise<Variable[]> {
    // 1. Fetch existing variables
    const existing = await this.fetch(promptId);
    
    // 2. Prepare upsert data
    const upsertData = variables.map((v, index) => ({
      id: v.id,
      prompt_id: promptId,
      name: v.name,
      type: v.type,
      default_value: v.default_value,
      required: v.required ?? false,
      help: v.help,
      options: v.options,
      order_index: index,
    }));

    // 3. Delete obsolete variables
    const newIds = variables.filter(v => v.id).map(v => v.id);
    const toDelete = existing.filter(v => !newIds.includes(v.id));
    
    if (toDelete.length > 0) {
      const deleteResult = await supabase
        .from("variables")
        .delete()
        .in("id", toDelete.map(v => v.id));
      
      handleSupabaseError(deleteResult);
    }

    // 4. Upsert all variables
    const result = await supabase
      .from("variables")
      .upsert(upsertData)
      .select();

    handleSupabaseError(result);
    return result.data || [];
  }
}

export const createVariableRepository = (): VariableRepository => {
  return new SupabaseVariableRepository();
};
```

### Exemple 3 : Repository avec méthodes métier (PromptRepository)

**Cas d'usage :** CRUD + opérations métier spécifiques (toggle favorite, duplicate).  
**Principe clé :** Découplage de l'authentification via injection de `userId`.

```typescript
// src/repositories/PromptRepository.ts (extrait)
export interface PromptRepository {
  // CRUD standard
  fetchAll(): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  
  // IMPORTANT: userId passé en paramètre, pas récupéré via auth
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  
  // Opérations métier - userId en paramètre
  duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
  toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED"): Promise<"PRIVATE" | "SHARED">;
}

export class SupabasePromptRepository implements PromptRepository {
  // ... méthodes CRUD ...

  async create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
    // Valider userId SANS appeler supabase.auth
    if (!userId) throw new Error("ID utilisateur requis");

    const result = await supabase
      .from("prompts")
      .insert({
        ...promptData,
        owner_id: userId, // Utiliser le userId fourni
      })
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async duplicate(
    userId: string,
    promptId: string,
    variableRepository: VariableRepository
  ): Promise<Prompt> {
    // Valider userId SANS appeler supabase.auth
    if (!userId) throw new Error("ID utilisateur requis");

    // 1. Récupérer le prompt original
    const original = await this.fetchById(promptId);

    // 2. Créer une copie avec le userId fourni
    const copy = await supabase
      .from("prompts")
      .insert({
        title: `${original.title} (Copie)`,
        content: original.content,
        description: original.description,
        tags: original.tags,
        status: "DRAFT",
        visibility: "PRIVATE",
        owner_id: userId, // Utiliser le userId fourni
      })
      .select()
      .single();

    handleSupabaseError(copy);

    // 3. Dupliquer les variables associées
    const variables = await variableRepository.fetch(promptId);
    
    if (variables.length > 0) {
      const variablesCopy = variables.map(v => ({
        prompt_id: copy.data.id,
        name: v.name,
        type: v.type,
        default_value: v.default_value,
        required: v.required,
        help: v.help,
        options: v.options,
        order_index: v.order_index,
      }));

      await variableRepository.upsertMany(copy.data.id, variablesCopy);
    }

    return copy.data;
  }

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.update(id, { is_favorite: !currentState });
  }

  async toggleVisibility(
    id: string,
    currentVisibility: "PRIVATE" | "SHARED"
  ): Promise<"PRIVATE" | "SHARED"> {
    const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
    await this.update(id, { visibility: newVisibility });
    return newVisibility;
  }
}
```

**Utilisation dans les hooks :**

```typescript
// src/hooks/usePrompts.ts
import { useAuth } from "@/hooks/useAuth";
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";

export function useCreatePrompt() {
  const repository = usePromptRepository();
  const { user } = useAuth(); // Récupérer l'utilisateur via useAuth
  
  return useMutation({
    mutationFn: (promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">) => {
      if (!user) throw new Error("Non authentifié");
      // Passer l'ID de l'utilisateur au repository
      return repository.create(user.id, promptData);
    },
    onSuccess: () => {
      // ...
    },
  });
}

export function useDuplicatePrompt() {
  const repository = usePromptRepository();
  const variableRepository = useVariableRepository();
  const { user } = useAuth(); // Récupérer l'utilisateur via useAuth
  
  return useMutation({
    mutationFn: (promptId: string) => {
      if (!user) throw new Error("Non authentifié");
      // Passer l'ID de l'utilisateur au repository
      return repository.duplicate(user.id, promptId, variableRepository);
    },
    onSuccess: () => {
      // ...
    },
  });
}
```

**Pourquoi cette approche ?**

✅ **Séparation des responsabilités (SRP)** : Le repository gère les données, `useAuth` gère l'authentification  
✅ **Testabilité améliorée** : Pas besoin de mocker `supabase.auth` dans les tests du repository  
✅ **Flexibilité** : Possibilité de passer un userId différent (admin, impersonation, etc.)  
✅ **Principe d'inversion de dépendance (DIP)** : Le repository ne dépend pas directement de l'authentification

## Tests

### Étape 6 : Créer les tests du repository

**Fichier :** `src/repositories/__tests__/{Entity}Repository.test.ts`

**Template de test :**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Supabase{Entity}Repository } from "../{Entity}Repository";
import { supabase } from "@/integrations/supabase/client";

// Mock du client Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("{Entity}Repository", () => {
  let repository: Supabase{Entity}Repository;
  let mockFrom: any;

  beforeEach(() => {
    repository = new Supabase{Entity}Repository();
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    vi.mocked(supabase.from).mockReturnValue(mockFrom);
  });

  describe("fetchAll", () => {
    it("should fetch all {entities} successfully", async () => {
      const mockData = [
        { id: "1", name: "Test 1" },
        { id: "2", name: "Test 2" },
      ];

      mockFrom.select.mockReturnValue({
        ...mockFrom,
        order: vi.fn().mockResolvedValue({
          data: mockData,
          error: null,
        }),
      });

      const result = await repository.fetchAll();

      expect(supabase.from).toHaveBeenCalledWith("{table_name}");
      expect(mockFrom.select).toHaveBeenCalledWith("*");
      expect(result).toEqual(mockData);
    });

    it("should handle errors when fetching {entities}", async () => {
      const mockError = new Error("Database error");

      mockFrom.select.mockReturnValue({
        ...mockFrom,
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      await expect(repository.fetchAll()).rejects.toThrow();
    });
  });

  describe("create", () => {
    it("should create a new {entity} successfully", async () => {
      const newData = { name: "New {Entity}" };
      const createdData = { id: "123", ...newData };

      mockFrom.insert.mockReturnValue({
        ...mockFrom,
        select: vi.fn().mockReturnValue({
          ...mockFrom,
          single: vi.fn().mockResolvedValue({
            data: createdData,
            error: null,
          }),
        }),
      });

      const result = await repository.create(newData);

      expect(supabase.from).toHaveBeenCalledWith("{table_name}");
      expect(mockFrom.insert).toHaveBeenCalledWith(newData);
      expect(result).toEqual(createdData);
    });
  });

  // ... autres tests pour update, delete, etc.
});
```

### Tester l'utilisation dans les composants

**Fichier :** `src/hooks/__tests__/use{Entity}.test.tsx`

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { {Entity}RepositoryProvider } from "@/contexts/{Entity}RepositoryContext";
import { use{Entity} } from "../use{Entity}";
import type { {Entity}Repository } from "@/repositories/{Entity}Repository";

describe("use{Entity}", () => {
  const mockRepository: {Entity}Repository = {
    fetchAll: vi.fn().mockResolvedValue([
      { id: "1", name: "Test" },
    ]),
    fetchById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <{Entity}RepositoryProvider repository={mockRepository}>
          {children}
        </{Entity}RepositoryProvider>
      </QueryClientProvider>
    );
  };

  it("should fetch {entities} successfully", async () => {
    const { result } = renderHook(() => use{Entity}(), { wrapper });

    await waitFor(() => {
      expect(result.current.{entities}).toBeDefined();
      expect(result.current.{entities}?.length).toBe(1);
    });

    expect(mockRepository.fetchAll).toHaveBeenCalled();
  });
});
```

## Checklist de revue de code

Lors de la revue d'un PR ajoutant un nouveau repository, vérifier :

### Architecture et SOLID

- [ ] L'interface `{Entity}Repository` est définie
- [ ] L'implémentation `Supabase{Entity}Repository` respecte l'interface
- [ ] Un contexte `{Entity}RepositoryContext` est créé avec provider et hook
- [ ] Le provider est ajouté à l'application (main.tsx ou App.tsx)
- [ ] Aucun import direct de Supabase en dehors du repository (ESLint ne doit pas alerter)
- [ ] **CRITIQUE:** Le repository n'appelle JAMAIS `supabase.auth.*`
- [ ] Les méthodes nécessitant un `userId` le reçoivent en paramètre
- [ ] L'authentification est gérée par `useAuth` dans les hooks/composants

### Qualité du code

- [ ] Toutes les méthodes ont une documentation JSDoc
- [ ] Les erreurs sont gérées avec `handleSupabaseError`
- [ ] Les méthodes vérifient que `result.data` existe avant de le retourner
- [ ] Les messages d'erreur sont explicites
- [ ] Les conventions de nommage sont respectées
- [ ] Validation des paramètres (`if (!userId) throw new Error(...)`)

### Opérations Supabase

- [ ] `.select()` est utilisé après `.insert()` et `.update()` pour récupérer les données
- [ ] `.single()` est utilisé quand on attend un seul résultat
- [ ] Les requêtes avec filtre utilisent `.eq()`, `.in()`, etc.
- [ ] Les résultats sont triés si nécessaire (`.order()`)

### Tests

- [ ] Tests unitaires du repository créés (`__tests__/{Entity}Repository.test.ts`)
- [ ] Tous les cas nominaux sont testés (fetchAll, create, update, delete)
- [ ] Les cas d'erreur sont testés
- [ ] **Test que `supabase.auth.getUser` n'est PAS appelé**
- [ ] Les méthodes spécifiques métier sont testées
- [ ] Couverture de code ≥ 70%

### Documentation

- [ ] Le fichier `ARCHITECTURE.md` est mis à jour si nécessaire
- [ ] Les exemples dans ce guide sont cohérents avec le nouveau repository
- [ ] Le `CHANGELOG.md` est mis à jour

### Intégration

- [ ] Les composants utilisent le hook `use{Entity}Repository` (pas d'import direct de Supabase)
- [ ] Les mutations React Query invalident les bonnes clés de cache
- [ ] Les messages toast sont affichés en cas de succès/erreur

## Questions fréquentes

### Q: Dois-je créer un repository pour chaque table ?

**R:** Pas nécessairement. Créez un repository pour chaque **entité métier principale**. Par exemple :
- ✅ `PromptRepository` pour la table `prompts`
- ✅ `VariableRepository` pour la table `variables` (car utilisée indépendamment)
- ❌ Pas besoin de repository séparé pour une table de liaison simple

### Q: Puis-je avoir plusieurs implémentations d'un même repository ?

**R:** Oui ! C'est tout l'intérêt du DIP. Vous pourriez avoir :
- `SupabasePromptRepository` (production)
- `MockPromptRepository` (tests)
- `LocalStoragePromptRepository` (mode offline)

### Q: Comment gérer l'authentification dans un repository ?

**R:** **JAMAIS appeler `supabase.auth` dans un repository !**

❌ **Mauvaise pratique :**
```typescript
async create(data: PromptInsert): Promise<Prompt> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  
  return supabase.from("prompts").insert({
    ...data,
    owner_id: user.id,
  });
}
```

✅ **Bonne pratique :**
```typescript
// Repository - Accepter userId en paramètre
async create(userId: string, data: PromptInsert): Promise<Prompt> {
  if (!userId) throw new Error("ID utilisateur requis");
  
  return supabase.from("prompts").insert({
    ...data,
    owner_id: userId,
  });
}

// Hook - Gérer l'authentification
export function useCreatePrompt() {
  const repository = usePromptRepository();
  const { user } = useAuth(); // Authentification ici
  
  return useMutation({
    mutationFn: (data: PromptInsert) => {
      if (!user) throw new Error("Non authentifié");
      return repository.create(user.id, data); // Passer userId
    },
  });
}
```

**Avantages :**
- ✅ Respect du SRP (Single Responsibility Principle)
- ✅ Testabilité : pas besoin de mocker `supabase.auth`
- ✅ Flexibilité : possibilité de passer différents userIds
- ✅ Respect du DIP (Dependency Inversion Principle)

1. **Méthode fetch séparée** :
```typescript
// Dans PromptRepository
async fetchWithVariables(id: string): Promise<PromptWithVariables> {
  const prompt = await this.fetchById(id);
  const variables = await variableRepository.fetch(id);
  return { ...prompt, variables };
}
```

2. **Injection de dépendance** :
```typescript
// Passer le repository dépendant en paramètre
async duplicate(
  promptId: string,
  variableRepository: VariableRepository
): Promise<Prompt> {
  // ...
}
```

### Q: Que faire si ma requête Supabase est très complexe ?

**R:** Créez une méthode privée pour améliorer la lisibilité :

```typescript
export class SupabasePromptRepository implements PromptRepository {
  private buildComplexQuery() {
    return supabase
      .from("prompts")
      .select(`
        *,
        variables (*),
        versions (*)
      `)
      .order("created_at", { ascending: false });
  }

  async fetchAll(): Promise<Prompt[]> {
    const result = await this.buildComplexQuery();
    handleSupabaseError(result);
    return result.data || [];
  }
}
```

### Q: Comment tester une méthode qui appelle plusieurs autres méthodes du repository ?

**R:** Mocker l'implémentation complète :

```typescript
const mockRepository: PromptRepository = {
  fetchById: vi.fn().mockResolvedValue({ id: "1", title: "Test" }),
  create: vi.fn().mockResolvedValue({ id: "2", title: "Copy" }),
  // ... autres méthodes
  duplicate: vi.fn().mockImplementation(async (id) => {
    const original = await mockRepository.fetchById!(id);
    return mockRepository.create!({ ...original, title: `${original.title} (copie)` });
  }),
};
```

---

**Ce guide doit être consulté lors de chaque ajout de nouveau repository.**

**Dernière mise à jour :** 2025-01-21  
**Responsable :** Équipe Architecture PromptForge
