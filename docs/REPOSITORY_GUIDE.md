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
  // IMPORTANT: Toutes les méthodes de lecture nécessitent userId pour RLS
  fetchAll(userId: string): Promise<Prompt[]>;
  fetchOwned(userId: string): Promise<Prompt[]>;
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
  
  // IMPORTANT: userId passé en paramètre, JAMAIS récupéré via supabase.auth
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  
  // Opérations métier - userId en paramètre quand nécessaire
  duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
  toggleVisibility(id: string, currentVisibility: "PRIVATE" | "SHARED", publicPermission?: "READ" | "WRITE"): Promise<"PRIVATE" | "SHARED">;
  updatePublicPermission(id: string, permission: "READ" | "WRITE"): Promise<void>;
}

export class SupabasePromptRepository implements PromptRepository {
  async fetchAll(userId: string): Promise<Prompt[]> {
    // Validation du paramètre SANS appeler supabase.auth
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchOwned(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .eq("owner_id", userId)
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async fetchSharedWithMe(userId: string): Promise<Prompt[]> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    // 1. Récupérer les IDs des prompts partagés
    const sharesResult = await supabase
      .from("prompt_shares")
      .select("prompt_id")
      .eq("shared_with_user_id", userId);
    
    handleSupabaseError(sharesResult);
    
    if (!sharesResult.data || sharesResult.data.length === 0) {
      return [];
    }
    
    const promptIds = sharesResult.data.map(share => share.prompt_id);
    
    // 2. Récupérer les prompts correspondants
    const result = await supabase
      .from("prompts_with_share_count")
      .select("*")
      .in("id", promptIds)
      .order("updated_at", { ascending: false });
    
    handleSupabaseError(result);
    return result.data as Prompt[];
  }

  async create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
    // Validation du paramètre SANS appeler supabase.auth
    if (!userId) throw new Error("ID utilisateur requis");
    
    const result = await supabase
      .from("prompts")
      .insert({
        ...promptData,
        owner_id: userId,
      })
      .select()
      .single();
    
    handleSupabaseError(result);
    return result.data;
  }

  async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
    if (!userId) throw new Error("ID utilisateur requis");
    
    // ... logique de duplication utilisant userId
    const duplicatedPrompt = await this.create(userId, promptData);
    await variableRepository.bulkUpsert(duplicatedPrompt.id, duplicatedVariables);
    
    return duplicatedPrompt;
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
- [ ] **CRITIQUE:** Le repository n'appelle JAMAIS `supabase.auth.getUser()` ou `supabase.auth.getSession()`
- [ ] **CRITIQUE:** Toutes les méthodes nécessitant un `userId` le reçoivent en paramètre (create, duplicate, fetchAll, fetchOwned, fetchSharedWithMe)
- [ ] **CRITIQUE:** Validation explicite de `userId` : `if (!userId) throw new Error("ID utilisateur requis")`
- [ ] L'authentification est gérée par `useAuth()` dans les hooks/composants
- [ ] Les queries React Query ont `enabled: !!user` pour éviter les requêtes sans utilisateur

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
- [ ] **CRITIQUE:** Test que `supabase.auth.getUser` n'est PAS appelé (expect(mockSupabase.auth.getUser).not.toHaveBeenCalled())
- [ ] Tests des méthodes avec `userId` vérifient qu'une erreur est levée si `userId` est vide
- [ ] Aucun mock de `supabase.auth` n'est nécessaire dans les tests du repository
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


## Extraction de Services - Pattern SRP

### PromptFavoriteService

**Responsabilité Unique :** Gestion du statut favori des prompts

**Méthodes :**
- `toggleFavorite(id: string, currentState: boolean): Promise<void>`

**Utilisation :**
```typescript
import { usePromptFavoriteService } from "@/contexts/PromptFavoriteServiceContext";

const favoriteService = usePromptFavoriteService();
await favoriteService.toggleFavorite("prompt-id", false);
```

**Bénéfices :**
- ✅ Responsabilité isolée (SRP)
- ✅ Testable indépendamment
- ✅ Réutilisable dans d'autres contextes

**Tests :**
```typescript
import { SupabasePromptFavoriteService } from "@/services/PromptFavoriteService";

const service = new SupabasePromptFavoriteService();
await service.toggleFavorite("prompt-123", false);
```

---

## Pattern KISS : Simplification par Extraction de Méthodes Privées

### Principe

**KISS (Keep It Simple, Stupid)** : Quand une méthode publique devient complexe (> 30 lignes ou complexité cyclomatique > 3), extraire des **méthodes privées** pour améliorer la lisibilité sans compromettre l'encapsulation.

### Quand Appliquer le Pattern ?

**Indicateurs de Complexité Excessive :**
- ✅ Méthode > 30 lignes
- ✅ Complexité cyclomatique > 3
- ✅ Sections logiques distinctes (Step 1, Step 2, Step 3...)
- ✅ Difficulté à comprendre la méthode en une lecture

**Ne PAS appliquer si :**
- ❌ Méthode < 20 lignes et simple à comprendre
- ❌ Logique fortement couplée (extraction créerait plus de confusion)
- ❌ Méthode privée ne serait utilisée qu'une seule fois ET < 5 lignes

### Exemple Concret : `PromptRepository.duplicate`

#### Avant Refactoring (52 lignes, complexité 3)

```typescript
async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
  if (!userId) throw new Error("ID utilisateur requis");

  // Step 1: Fetch the original prompt (11 lignes)
  const fetchResult = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .single();
  handleSupabaseError(fetchResult);
  const original = fetchResult.data as Prompt;

  // Step 2: Fetch original variables (2 lignes)
  const originalVariables = await variableRepository.fetch(promptId);

  // Step 3: Create the duplicate prompt (19 lignes)
  const insertResult = await supabase
    .from("prompts")
    .insert({
      title: `${original.title} (Copie)`,
      content: original.content,
      description: original.description,
      tags: original.tags,
      visibility: "PRIVATE",
      version: "1.0.0",
      status: "DRAFT",
      is_favorite: false,
      owner_id: userId,
    })
    .select()
    .single();
  handleSupabaseError(insertResult);

  // Step 4: Duplicate variables (14 lignes)
  if (originalVariables.length > 0) {
    const variablesToDuplicate = originalVariables.map(v => ({
      name: v.name,
      type: v.type,
      required: v.required,
      default_value: v.default_value,
      help: v.help,
      pattern: v.pattern,
      options: v.options,
      order_index: v.order_index,
    }));
    await variableRepository.upsertMany(insertResult.data.id, variablesToDuplicate);
  }

  return insertResult.data;
}
```

**Problèmes :**
- 🔴 52 lignes difficiles à parcourir
- 🔴 Logique de fetch, création et transformation mélangée
- 🔴 Difficulté à identifier rapidement les étapes

#### Après Refactoring (22 lignes, complexité 2)

```typescript
async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
  if (!userId) throw new Error("ID utilisateur requis");

  // Step 1: Fetch the original prompt
  const original = await this.fetchOriginalPrompt(promptId);

  // Step 2: Fetch original variables
  const originalVariables = await variableRepository.fetch(promptId);

  // Step 3: Create the duplicate prompt with default values
  const duplicated = await this.createDuplicatePrompt(userId, original);

  // Step 4: Duplicate variables if any exist
  if (originalVariables.length > 0) {
    const variablesToDuplicate = this.mapVariablesForDuplication(originalVariables);
    await variableRepository.upsertMany(duplicated.id, variablesToDuplicate);
  }

  return duplicated;
}

// --- Méthodes Privées ---

private async fetchOriginalPrompt(promptId: string): Promise<Prompt> {
  const fetchResult = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .single();
  handleSupabaseError(fetchResult);
  return fetchResult.data as Prompt;
}

private async createDuplicatePrompt(userId: string, original: Prompt): Promise<Prompt> {
  const insertResult = await supabase
    .from("prompts")
    .insert({
      title: `${original.title} (Copie)`,
      content: original.content,
      description: original.description,
      tags: original.tags,
      visibility: "PRIVATE",
      version: "1.0.0",
      status: "DRAFT",
      is_favorite: false,
      owner_id: userId,
    })
    .select()
    .single();
  handleSupabaseError(insertResult);
  return insertResult.data as Prompt;
}

private mapVariablesForDuplication(originalVariables: Variable[]): VariableUpsertInput[] {
  return originalVariables.map(v => ({
    name: v.name,
    type: v.type,
    required: v.required,
    default_value: v.default_value,
    help: v.help,
    pattern: v.pattern,
    options: v.options,
    order_index: v.order_index,
  }));
}
```

**Bénéfices :**
- ✅ **Lisibilité accrue** : La méthode publique = orchestration claire des étapes
- ✅ **Testabilité indirecte** : Les méthodes privées sont testées via `duplicate`
- ✅ **Réutilisabilité potentielle** : Si besoin, les méthodes privées peuvent être promues en publiques
- ✅ **Maintenance facilitée** : Modification d'une étape isolée (ex: changer le suffixe "(Copie)")
- ✅ **Respect SRP** : Chaque méthode a une responsabilité unique

### Checklist KISS pour Refactoring

#### Avant l'Extraction
- [ ] Identifier les sections logiques distinctes (Step 1, Step 2...)
- [ ] Vérifier que chaque section > 5 lignes (sinon extraction inutile)
- [ ] S'assurer que la méthode publique > 30 lignes OU complexité > 3

#### Pendant l'Extraction
- [ ] **Nom descriptif** : `fetchOriginalPrompt` (verbe + objet) et non `fetch` ou `getPrompt`
- [ ] **JSDoc complet** : `@private`, `@param`, `@returns`, `@throws`
- [ ] **Type strict** : Typage explicite du retour (`Promise<Prompt>`, pas `Promise<any>`)
- [ ] **Gestion d'erreurs** : Conserver `handleSupabaseError` dans les méthodes privées

#### Après l'Extraction
- [ ] **Tests passants** : Tous les tests de la méthode publique doivent passer
- [ ] **Coverage maintenu** : Ne pas perdre de couverture de code
- [ ] **Méthode publique simplifiée** : Réduite à un orchestrateur (< 30 lignes)
- [ ] **Commentaires mis à jour** : JSDoc de la méthode publique mentionne les méthodes privées

### Anti-Patterns à Éviter

#### ❌ Extraction Excessive (Over-Engineering)

**Mauvais exemple :**
```typescript
private validateUserId(userId: string): void {
  if (!userId) throw new Error("ID utilisateur requis");
}
```

**Pourquoi ?** 1 ligne ne justifie pas une méthode privée (ajoute de la complexité inutile)

#### ❌ Méthodes Privées Testées Directement

**Mauvais exemple (test) :**
```typescript
it("fetchOriginalPrompt should return prompt", async () => {
  // ❌ Ne PAS tester les méthodes privées directement
  const prompt = await repository["fetchOriginalPrompt"]("id");
  expect(prompt).toBeDefined();
});
```

**Pourquoi ?** Les méthodes privées sont des détails d'implémentation. Tester via la méthode publique.

#### ❌ Noms Génériques

**Mauvais exemple :**
```typescript
private fetch(id: string): Promise<Prompt> { /* ... */ }
private create(data: any): Promise<Prompt> { /* ... */ }
```

**Bon exemple :**
```typescript
private fetchOriginalPrompt(promptId: string): Promise<Prompt> { /* ... */ }
private createDuplicatePrompt(userId: string, original: Prompt): Promise<Prompt> { /* ... */ }
```

### Métriques de Succès

| Critère | Avant | Après | Amélioration |
|---------|-------|-------|--------------|
| Lignes méthode publique | 52 | 22 | -58% |
| Complexité cyclomatique | 3 | 2 | -33% |
| Temps de compréhension | ~3 min | ~30 sec | -83% |
| Facilité de maintenance | Moyenne | Élevée | ⬆️ |

### Références

- **KISS Principle** : https://en.wikipedia.org/wiki/KISS_principle
- **Extract Method** : Refactoring (Martin Fowler), Chapter 6
- **Single Responsibility** : Clean Code (Robert C. Martin), Chapter 3

---

## Extraction de Services - Pattern SRP

### PromptFavoriteService

**Responsabilité Unique :** Gestion du statut favori des prompts

**Méthodes :**
- `toggleFavorite(id: string, currentState: boolean): Promise<void>`

**Utilisation :**
```typescript
import { usePromptFavoriteService } from "@/contexts/PromptFavoriteServiceContext";

const favoriteService = usePromptFavoriteService();
await favoriteService.toggleFavorite("prompt-id", false);
```

**Bénéfices :**
- ✅ Responsabilité isolée (SRP)
- ✅ Testable indépendamment
- ✅ Réutilisable dans d'autres contextes

---

### PromptVisibilityService

**Responsabilité Unique :** Gestion de la visibilité (PRIVATE/SHARED) et des permissions publiques (READ/WRITE)

**Interface :**
```typescript
interface PromptVisibilityService {
  toggleVisibility(
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    publicPermission?: "READ" | "WRITE"
  ): Promise<"PRIVATE" | "SHARED">;
  
  updatePublicPermission(id: string, permission: "READ" | "WRITE"): Promise<void>;
}
```

**Méthodes :**

#### `toggleVisibility`
Bascule la visibilité d'un prompt entre PRIVATE et SHARED.

**Comportement :**
- **PRIVATE → SHARED :**
  - Force `status` à `PUBLISHED`
  - Applique `publicPermission` (défaut: `READ`)
  - Retourne `"SHARED"`

- **SHARED → PRIVATE :**
  - Réinitialise `public_permission` à `READ`
  - Préserve le `status` (ne force PAS à DRAFT)
  - Retourne `"PRIVATE"`

**Exemple :**
```typescript
const visibilityService = usePromptVisibilityService();

// Rendre public avec permission READ (défaut)
const newVisibility = await visibilityService.toggleVisibility(
  "prompt-id",
  "PRIVATE"
);
console.log(newVisibility); // "SHARED"

// Rendre public avec permission WRITE
await visibilityService.toggleVisibility(
  "prompt-id",
  "PRIVATE",
  "WRITE"
);

// Repasser en privé
await visibilityService.toggleVisibility("prompt-id", "SHARED");
```

---

#### `updatePublicPermission`
Met à jour uniquement la permission publique (READ/WRITE) d'un prompt **déjà SHARED**.

**Validation :**
- ✅ Le prompt doit être `SHARED`
- ❌ Erreur `PERMISSION_UPDATE_ON_PRIVATE_PROMPT` si `PRIVATE`

**Exemple :**
```typescript
// Mettre à jour permission (prompt doit être SHARED)
await visibilityService.updatePublicPermission("prompt-id", "WRITE");

// Erreur si prompt PRIVATE
try {
  await visibilityService.updatePublicPermission("private-prompt-id", "WRITE");
} catch (error) {
  console.error(error.message); // "PERMISSION_UPDATE_ON_PRIVATE_PROMPT"
}
```

---

**Utilisation dans les Hooks :**
```typescript
import { usePromptVisibilityService } from "@/contexts/PromptVisibilityServiceContext";

// Toggle visibilité
const visibilityService = usePromptVisibilityService();
await visibilityService.toggleVisibility("prompt-id", "PRIVATE", "READ");

// Mettre à jour permission
await visibilityService.updatePublicPermission("prompt-id", "WRITE");
```

**Bénéfices :**
- ✅ Responsabilité isolée (gestion visibilité/permissions)
- ✅ Validation métier centralisée (prompt SHARED requis)
- ✅ Testable indépendamment (8 tests dédiés)
- ✅ Réutilisable dans d'autres contextes (ex: admin panel)

---

## PromptDuplicationService

**Responsabilité Unique :** Duplication complète de prompts avec leurs variables

**Interface :**
```typescript
interface PromptDuplicationService {
  duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
}
```

**Comportement :**
- Titre : `${original} (Copie)`
- Visibilité : PRIVATE (toujours)
- Status : DRAFT (toujours)
- Version : 1.0.0 (reset)
- Variables : Copiées avec nouveaux IDs

**Bénéfices :**
- ✅ Responsabilité isolée (duplication)
- ✅ Testable indépendamment (5 tests)
- ✅ Pattern KISS (3 méthodes privées)

---

## 🔓 OCP (Open/Closed Principle) Compliance

### Principe
Les Services **ne dépendent jamais directement de Supabase** mais délèguent aux Repositories.
Cela permet de changer de backend (Supabase → API REST) en créant une nouvelle implémentation de Repository, **sans modifier les Services**.

### Architecture 3-Tiers
```
UI Components (useXxxService)
   ↓ dépend de
Services (logique métier)
   ↓ dépend de
Repositories (abstraction)
   ↓ implémenté par
SupabaseRepository | RESTRepository | GraphQLRepository
```

### Exemple : PromptDuplicationService

❌ **Avant (couplage direct à Supabase - violation OCP)**
```typescript
export class SupabasePromptDuplicationService {
  // Appel direct à Supabase dans une méthode privée
  private async fetchOriginalPrompt(id: string) {
    const result = await supabase.from("prompts").select("*").eq("id", id).single();
    handleSupabaseError(result);
    return result.data;
  }

  private async createDuplicatePrompt(userId: string, original: Prompt) {
    const result = await supabase.from("prompts").insert({
      title: `${original.title} (Copie)`,
      // ...
    }).select().single();
    return result.data;
  }

  async duplicate(...) {
    const original = await this.fetchOriginalPrompt(id);  // Couplage
    const duplicate = await this.createDuplicatePrompt(...); // Couplage
    // ...
  }
}
```

**Problème :** 
- 🔴 Migration backend (Supabase → API REST) nécessite de réécrire **tous les services** (3 fichiers)
- 🔴 Méthodes privées couplées à l'infrastructure (violation DIP)
- 🔴 Tests complexes (mock de `supabase.from()`)

---

✅ **Après (délégation au Repository - OCP respecté)**
```typescript
export class SupabasePromptDuplicationService {
  constructor(private promptRepository: PromptRepository) {} // Injection

  async duplicate(userId: string, promptId: string, variableRepository: VariableRepository) {
    // Délégation au repository
    const original = await this.promptRepository.fetchById(promptId);
    const duplicate = await this.promptRepository.create(userId, {
      title: `${original.title} (Copie)`,
      // ...
    });
    
    // Duplication variables
    const variables = await variableRepository.fetch(promptId);
    if (variables.length > 0) {
      await variableRepository.upsertMany(duplicate.id, variables);
    }
    
    return duplicate;
  }

  // Suppression des 2 méthodes privées fetchOriginalPrompt et createDuplicatePrompt
  // Logique déléguée au PromptRepository (SRP + OCP)
}
```

**Bénéfices :**
- ✅ Migration backend sans modifier Services (1 fichier `SupabasePromptRepository` au lieu de 3+)
- ✅ Tests simplifiés (mock `PromptRepository` au lieu de `supabase`)
- ✅ Services purement métier (0 dépendance infrastructure)
- ✅ Conformité SOLID (OCP + DIP + SRP)

---

### Application aux 3 Services

#### PromptFavoriteService
**Avant :** 
```typescript
async toggleFavorite(id: string, currentState: boolean) {
  const result = await supabase.from("prompts").update({ is_favorite: !currentState }).eq("id", id);
  handleSupabaseError(result);
}
```

**Après :**
```typescript
constructor(private promptRepository: PromptRepository) {}

async toggleFavorite(id: string, currentState: boolean) {
  await this.promptRepository.update(id, { is_favorite: !currentState }); // Délégation
}
```

---

#### PromptVisibilityService
**Avant :** 
```typescript
async updatePublicPermission(id: string, permission: "READ" | "WRITE") {
  const prompt = await supabase.from("prompts").select("visibility").eq("id", id).single();
  if (prompt.data?.visibility !== "SHARED") throw new Error("...");
  
  await supabase.from("prompts").update({ public_permission: permission }).eq("id", id);
}
```

**Après :**
```typescript
constructor(private promptRepository: PromptRepository) {}

async updatePublicPermission(id: string, permission: "READ" | "WRITE") {
  const prompt = await this.promptRepository.fetchById(id); // Délégation
  if (prompt.visibility !== "SHARED") throw new Error("...");
  
  await this.promptRepository.update(id, { public_permission: permission }); // Délégation
}
```

---

### Métriques d'Impact (Phase 4)

| Service | Méthodes privées supprimées | Appels Supabase éliminés | Lignes réduites |
|---------|----------------------------|--------------------------|-----------------|
| PromptFavoriteService | 0 | 1 update | -3 lignes |
| PromptVisibilityService | 0 | 2 (select + update) | -8 lignes |
| PromptDuplicationService | **2** (fetchOriginal, createDuplicate) | 2 (select + insert) | **-49 lignes** |
| **TOTAL** | **2** | **5** | **-60 lignes** |

### Tests Simplifiés

**Avant (mock Supabase) :**
```typescript
const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
mockSupabase.from.mockReturnValue({ update: mockUpdate });

await service.toggleFavorite("id", false);
expect(mockSupabase.from).toHaveBeenCalledWith("prompts");
expect(mockUpdate).toHaveBeenCalledWith({ is_favorite: true });
```

**Après (mock Repository) :**
```typescript
const mockRepository: PromptRepository = { update: vi.fn(), /* ... */ };

await service.toggleFavorite("id", false);
expect(mockRepository.update).toHaveBeenCalledWith("id", { is_favorite: true });
```

**Gain :** -75% lignes de setup mock, tests 3x plus lisibles

---

### Checklist OCP Compliance

Lors de la création d'un nouveau service :

- [ ] **Injection de dépendance** : Le service reçoit ses repositories via le constructeur
- [ ] **Aucun import Supabase** : Le fichier service ne contient **jamais** `import { supabase }`
- [ ] **Délégation complète** : Toutes les opérations DB passent par les repositories
- [ ] **Méthodes privées pures** : Les méthodes privées ne doivent contenir que de la logique métier (mapping, validation), pas d'appels DB
- [ ] **Context avec useMemo** : Le provider utilise `useMemo` avec le repository en dépendance
- [ ] **Tests avec mock Repository** : Les tests mockent les repositories, pas Supabase directement

---

### Anti-Pattern à Éviter

❌ **Service hybride (OCP violé)**
```typescript
export class MixedService {
  constructor(private promptRepository: PromptRepository) {}

  async someMethod() {
    // ❌ MAUVAIS : Mix délégation + appel direct
    const prompt = await this.promptRepository.fetchById("id");
    const result = await supabase.from("variables").select("*"); // Violation OCP !
    return { prompt, variables: result.data };
  }
}
```

✅ **Solution :** Injecter également `VariableRepository`
```typescript
export class CleanService {
  constructor(
    private promptRepository: PromptRepository,
    private variableRepository: VariableRepository // Injection complète
  ) {}

  async someMethod() {
    const prompt = await this.promptRepository.fetchById("id");
    const variables = await this.variableRepository.fetch("id"); // OCP respecté
    return { prompt, variables };
  }
}
```

---

**Ce guide doit être consulté lors de chaque ajout de nouveau repository ou service.**

**Dernière mise à jour :** 2025-11-19  
**Responsable :** Équipe Architecture PromptForge
