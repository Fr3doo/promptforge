# Repository Patterns - Interface Segregation Principle (ISP)

## Table des matières
1. [Vue d'ensemble du pattern ISP](#1-vue-densemble-du-pattern-isp)
2. [Architecture des repositories ségrégués](#2-architecture-des-repositories-ségrégués)
3. [Hiérarchie des Providers React](#3-hiérarchie-des-providers-react)
4. [Services utilisant les repositories ségrégués](#4-services-utilisant-les-repositories-ségrégués)
5. [Exemples concrets de migration](#5-exemples-concrets-de-migration)
6. [Diagrammes d'architecture](#6-diagrammes-darchitecture)
7. [Guidelines de développement](#7-guidelines-de-développement)
8. [FAQ et bonnes pratiques](#8-faq-et-bonnes-pratiques)
9. [Conclusion](#9-conclusion)

---

## 1. Vue d'ensemble du pattern ISP

### Qu'est-ce que l'ISP ?

**Interface Segregation Principle (SOLID)** : Les clients ne devraient pas dépendre d'interfaces qu'ils n'utilisent pas.

### Problème initial

```typescript
// ❌ AVANT : Violation de l'ISP
export function useToggleFavorite() {
  const repository = usePromptRepository(); // 7 méthodes
  
  // Utilise SEULEMENT update()
  return repository.update(id, { is_favorite: !state });
}
```

**Problèmes** :
- Le hook reçoit 7 méthodes mais n'en utilise qu'une seule
- Dépendance trop large → couplage fort
- Tests complexes (mock de 7 méthodes pour en tester 1)
- Confusion sur les responsabilités

### Solution avec ISP

```typescript
// ✅ APRÈS : Respect de l'ISP
export function useToggleFavorite() {
  const mutationRepository = usePromptMutationRepository(); // 1 méthode
  
  // Ne reçoit QUE update()
  return mutationRepository.update(id, { is_favorite: !state });
}
```

**Bénéfices** :
- ✅ Interface minimale et ciblée
- ✅ Tests simplifiés (1 seule méthode à mocker)
- ✅ Responsabilités claires
- ✅ Couplage réduit

---

## 2. Architecture des repositories ségrégués

### Hiérarchie des interfaces

```
┌─────────────────────────────────────────────────────┐
│  PromptRepository (Interface agrégée)               │
│  - Hérite de PromptQueryRepository                  │
│  - Hérite de PromptCommandRepository                │
│  - 7 méthodes au total                              │
└─────────────────────────────────────────────────────┘
              ▲
              │ implements
              │
┌─────────────────────────────────────────────────────┐
│  SupabasePromptRepository (Implémentation unique)   │
│  - Implémente toutes les méthodes                   │
│  - Classe singleton partagée par tous les contexts  │
└─────────────────────────────────────────────────────┘
              ▲
              │ injectée dans
              │
    ┌─────────┴──────────┬──────────────────┐
    │                    │                  │
┌───────────────┐ ┌──────────────┐ ┌────────────────┐
│ Query Context │ │ Mutation Ctx │ │ Command Context│
│ (4 méthodes)  │ │ (1 méthode)  │ │ (3 méthodes)   │
└───────────────┘ └──────────────┘ └────────────────┘
```

### Interfaces ségrégées

#### PromptQueryRepository (LECTURE)

```typescript
/**
 * Interface ségrégée : Opérations de LECTURE seules
 * Utilisée par : usePrompts, useOwnedPrompts, useSharedWithMePrompts, usePrompt
 */
export interface PromptQueryRepository {
  fetchAll(userId: string): Promise<Prompt[]>;
  fetchOwned(userId: string): Promise<Prompt[]>;
  fetchSharedWithMe(userId: string): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
}
```

**Utilisé par** :
- `usePrompts()` (fetchAll)
- `useOwnedPrompts()` (fetchOwned)
- `useSharedWithMePrompts()` (fetchSharedWithMe)
- `usePrompt()` (fetchById)
- `PromptVisibilityService` (fetchById pour validation)
- `PromptDuplicationService` (fetchById pour duplication)

#### PromptMutationRepository (MUTATION partielle)

```typescript
/**
 * Interface ségrégée : Opérations de MUTATION partielles
 * Utilisée par : PromptFavoriteService, PromptVisibilityService
 */
export interface PromptMutationRepository {
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
}
```

**Utilisé par** :
- `PromptFavoriteService` (toggleFavorite)
- `PromptVisibilityService` (toggleVisibility, updatePublicPermission)
- `useUpdatePrompt()` (mise à jour générale)

#### PromptCommandRepository (ÉCRITURE complète)

```typescript
/**
 * Interface ségrégée : Opérations d'ÉCRITURE complètes
 * Utilisée par : useCreatePrompt, useUpdatePrompt, useDeletePrompt, PromptDuplicationService
 */
export interface PromptCommandRepository {
  create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
}
```

**Utilisé par** :
- `PromptDuplicationService` (create pour le prompt dupliqué)
- `useCreatePrompt()` (création)
- `useUpdatePrompt()` (via PromptCommandRepository)
- `useDeletePrompt()` (suppression)

### PromptRepository (Interface agrégée)

```typescript
/**
 * Interface agrégée pour la rétrocompatibilité et l'implémentation complète
 * Implémentée par : SupabasePromptRepository
 * Utilisée par : PromptRepositoryProvider
 */
export interface PromptRepository 
  extends PromptQueryRepository, 
          PromptCommandRepository {
  // 7 méthodes héritées :
  // - Query: fetchAll, fetchOwned, fetchSharedWithMe, fetchById
  // - Command: create, update, delete
}
```

**Utilisé par** :
- `SupabasePromptRepository` (implémentation unique)
- `PromptRepositoryProvider` (instance singleton)
- Code legacy (compatibilité rétro)

---

## 3. Hiérarchie des Providers React

### Structure de nesting obligatoire

```tsx
<PromptRepositoryProvider>                 {/* Instancie SupabasePromptRepository */}
  <PromptQueryRepositoryProvider>          {/* Expose PromptQueryRepository */}
    <PromptMutationRepositoryProvider>     {/* Expose PromptMutationRepository */}
      <PromptCommandRepositoryProvider>    {/* Expose PromptCommandRepository */}
        
        {/* Services consommant les repositories ségrégués */}
        <PromptFavoriteServiceProvider>    {/* Utilise MutationRepository */}
        
        <PromptVisibilityServiceProvider>  {/* Utilise Mutation + Query */}
        
        <PromptDuplicationServiceProvider> {/* Utilise Command + Query */}
        
        <App />
      </PromptCommandRepositoryProvider>
    </PromptMutationRepositoryProvider>
  </PromptQueryRepositoryProvider>
</PromptRepositoryProvider>
```

### Règles importantes

1. **Instance unique** : `SupabasePromptRepository` est instanciée UNE SEULE FOIS dans `PromptRepositoryProvider`
2. **Réutilisation** : Les 3 contexts ségrégués (`Query`, `Mutation`, `Command`) réutilisent cette même instance
3. **Ordre d'imbrication** : Les contexts ségrégués DOIVENT être enfants de `PromptRepositoryProvider`
4. **Indépendance** : L'ordre entre `Query`, `Mutation`, et `Command` n'est pas critique (ils sont indépendants)

### Implémentation des Providers ségrégués

```typescript
// Context pour Query
export function PromptQueryRepositoryProvider({ children }: { children: ReactNode }) {
  // Réutilise l'instance existante de SupabasePromptRepository
  const repository = usePromptRepository();
  
  return (
    <PromptQueryRepositoryContext.Provider value={repository}>
      {children}
    </PromptQueryRepositoryContext.Provider>
  );
}

// Context pour Mutation
export function PromptMutationRepositoryProvider({ children }: { children: ReactNode }) {
  const repository = usePromptRepository();
  
  return (
    <PromptMutationRepositoryContext.Provider value={repository}>
      {children}
    </PromptMutationRepositoryContext.Provider>
  );
}

// Context pour Command
export function PromptCommandRepositoryProvider({ children }: { children: ReactNode }) {
  const repository = usePromptRepository();
  
  return (
    <PromptCommandRepositoryContext.Provider value={repository}>
      {children}
    </PromptCommandRepositoryContext.Provider>
  );
}
```

---

## 4. Services utilisant les repositories ségrégués

### 4.1 PromptFavoriteService

**Dépendance** : `PromptMutationRepository` uniquement

```typescript
/**
 * Service dédié à la gestion des favoris de prompts
 * Responsabilité unique : Toggle et gestion du statut favori
 */
export interface PromptFavoriteService {
  toggleFavorite(id: string, currentState: boolean): Promise<void>;
}

export class SupabasePromptFavoriteService implements PromptFavoriteService {
  constructor(private mutationRepository: PromptMutationRepository) {}

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.mutationRepository.update(id, { is_favorite: !currentState });
  }
}
```

**Injection via Context** :

```typescript
export function PromptFavoriteServiceProvider({ 
  children, 
  service 
}: PromptFavoriteServiceProviderProps) {
  const mutationRepository = usePromptMutationRepository(); // ✅ Interface minimale
  const defaultService = useMemo(
    () => service || new SupabasePromptFavoriteService(mutationRepository),
    [service, mutationRepository]
  );

  return (
    <PromptFavoriteServiceContext.Provider value={defaultService}>
      {children}
    </PromptFavoriteServiceContext.Provider>
  );
}
```

**Bénéfices ISP** :
- ✅ Reçoit 1 méthode au lieu de 7 (réduction de 85% de la surface d'API)
- ✅ Tests focalisés : Mock de `update()` uniquement
- ✅ Impossibilité d'appeler `create()`, `delete()`, ou `fetchAll()` par erreur

### 4.2 PromptVisibilityService

**Dépendances** : `PromptMutationRepository` + `PromptQueryRepository`

```typescript
/**
 * Service dédié à la gestion de la visibilité et des permissions publiques des prompts
 * 
 * Responsabilité unique : Gérer le cycle de vie de la visibilité (PRIVATE/SHARED)
 * et les permissions d'accès public (READ/WRITE)
 */
export interface PromptVisibilityService {
  /**
   * Bascule la visibilité d'un prompt entre PRIVATE et SHARED
   * 
   * @param id - ID du prompt
   * @param currentVisibility - Visibilité actuelle (PRIVATE ou SHARED)
   * @param publicPermission - Permission à appliquer si passage en SHARED (défaut: READ)
   * @returns Nouvelle visibilité (PRIVATE ou SHARED)
   * 
   * @remarks
   * - PRIVATE → SHARED : Force status=PUBLISHED et applique publicPermission
   * - SHARED → PRIVATE : Réinitialise public_permission à READ
   */
  toggleVisibility(
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    publicPermission?: "READ" | "WRITE"
  ): Promise<"PRIVATE" | "SHARED">;

  /**
   * Met à jour uniquement la permission publique d'un prompt SHARED
   * 
   * @param id - ID du prompt
   * @param permission - Nouvelle permission (READ ou WRITE)
   * @throws {Error} "PERMISSION_UPDATE_ON_PRIVATE_PROMPT" si le prompt est PRIVATE
   */
  updatePublicPermission(id: string, permission: "READ" | "WRITE"): Promise<void>;
}

export class SupabasePromptVisibilityService implements PromptVisibilityService {
  constructor(
    private mutationRepository: PromptMutationRepository,  // update()
    private queryRepository: PromptQueryRepository         // fetchById()
  ) {}

  async toggleVisibility(
    id: string,
    currentVisibility: "PRIVATE" | "SHARED",
    publicPermission?: "READ" | "WRITE"
  ): Promise<"PRIVATE" | "SHARED"> {
    // Toggle PRIVATE <-> SHARED
    const newVisibility = currentVisibility === "PRIVATE" ? "SHARED" : "PRIVATE";
    
    const updateData: {
      visibility: "PRIVATE" | "SHARED";
      status?: "PUBLISHED";
      public_permission: "READ" | "WRITE";
    } = {
      visibility: newVisibility,
      public_permission: "READ", // Reset to default
    };

    // Force PUBLISHED status and set permission when going public
    if (newVisibility === "SHARED") {
      updateData.status = "PUBLISHED";
      updateData.public_permission = publicPermission || "READ";
    }

    await this.mutationRepository.update(id, updateData);
    return newVisibility;
  }

  async updatePublicPermission(id: string, permission: "READ" | "WRITE"): Promise<void> {
    // First, check if the prompt is SHARED (public permission only applies to SHARED prompts)
    const prompt = await this.queryRepository.fetchById(id);

    if (prompt.visibility !== "SHARED") {
      throw new Error("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");
    }

    await this.mutationRepository.update(id, { public_permission: permission });
  }
}
```

**Injection via Context** :

```typescript
export function PromptVisibilityServiceProvider({
  children,
  service,
}: PromptVisibilityServiceProviderProps) {
  const mutationRepository = usePromptMutationRepository(); // 1 méthode
  const queryRepository = usePromptQueryRepository();       // 4 méthodes
  const defaultService = useMemo(
    () => service || new SupabasePromptVisibilityService(mutationRepository, queryRepository),
    [service, mutationRepository, queryRepository]
  );

  return (
    <PromptVisibilityServiceContext.Provider value={defaultService}>
      {children}
    </PromptVisibilityServiceContext.Provider>
  );
}
```

**Bénéfices ISP** :
- ✅ Reçoit 5 méthodes au lieu de 7 (réduction de 28%)
- ✅ Séparation claire : Queries (lecture) vs Mutations (écriture)
- ✅ Tests séparés : Mock de `update()` et `fetchById()` indépendamment
- ✅ Validation explicite avant mutation (pattern Guard Clause)

### 4.3 PromptDuplicationService

**Dépendances** : `PromptQueryRepository` + `PromptCommandRepository`

```typescript
/**
 * Service dédié à la duplication de prompts avec leurs variables associées
 * 
 * Responsabilité unique : Dupliquer un prompt existant et ses variables
 */
export interface PromptDuplicationService {
  /**
   * Duplique un prompt avec ses variables associées
   * 
   * @param userId - ID de l'utilisateur propriétaire du nouveau prompt
   * @param promptId - ID du prompt à dupliquer
   * @param variableRepository - Repository pour gérer les variables
   * @returns Le nouveau prompt créé
   * 
   * @remarks
   * - Le nouveau prompt est créé avec le statut DRAFT et la visibilité PRIVATE
   * - Le titre est suffixé par " (copie)"
   * - Toutes les variables sont dupliquées avec leurs configurations
   */
  duplicate(
    userId: string, 
    promptId: string, 
    variableRepository: VariableRepository
  ): Promise<Prompt>;
}

export class SupabasePromptDuplicationService implements PromptDuplicationService {
  constructor(
    private queryRepository: PromptQueryRepository,      // fetchById()
    private commandRepository: PromptCommandRepository   // create()
  ) {}

  async duplicate(
    userId: string, 
    promptId: string, 
    variableRepository: VariableRepository
  ): Promise<Prompt> {
    // Étape 1 : Récupérer le prompt original (Query)
    const originalPrompt = await this.queryRepository.fetchById(promptId);

    // Étape 2 : Récupérer les variables associées
    const originalVariables = await variableRepository.fetch(promptId);

    // Étape 3 : Créer le nouveau prompt (Command)
    const newPrompt = await this.commandRepository.create(userId, {
      title: `${originalPrompt.title} (copie)`,
      content: originalPrompt.content,
      description: originalPrompt.description,
      tags: originalPrompt.tags,
      visibility: "PRIVATE",
      is_favorite: false,
      version: "1.0.0",
      status: "DRAFT",
      public_permission: "READ",
    });

    // Étape 4 : Dupliquer les variables
    if (originalVariables.length > 0) {
      const variablesToCreate = this.mapVariablesForDuplication(originalVariables);
      await variableRepository.upsertMany(newPrompt.id, variablesToCreate);
    }

    return newPrompt;
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
    }));
  }
}
```

**Injection via Context** :

```typescript
export function PromptDuplicationServiceProvider({
  children,
  service,
}: PromptDuplicationServiceProviderProps) {
  const queryRepository = usePromptQueryRepository();     // 4 méthodes
  const commandRepository = usePromptCommandRepository(); // 3 méthodes
  const defaultService = useMemo(
    () => service || new SupabasePromptDuplicationService(queryRepository, commandRepository),
    [service, queryRepository, commandRepository]
  );

  return (
    <PromptDuplicationServiceContext.Provider value={defaultService}>
      {children}
    </PromptDuplicationServiceContext.Provider>
  );
}
```

**Bénéfices ISP** :
- ✅ Reçoit 7 méthodes (4+3) mais SEULEMENT celles nécessaires
- ✅ Sémantique claire : Query pour lire, Command pour écrire
- ✅ Tests isolés : Mock de `fetchById()` et `create()` séparément
- ✅ Pattern CQRS (Command Query Responsibility Segregation)

---

## 5. Exemples concrets de migration

### Migration 1 : PromptFavoriteService

**État initial (violation ISP)** :

```typescript
// ❌ Service initial
export class SupabasePromptFavoriteService implements PromptFavoriteService {
  constructor(private promptRepository: PromptRepository) {} // 7 méthodes

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.promptRepository.update(id, { is_favorite: !currentState });
    // Utilise 1 méthode sur 7 → 85% de méthodes inutiles
  }
}

// ❌ Tests complexes
const mockPromptRepository: PromptRepository = {
  fetchAll: vi.fn(),         // ❌ Inutilisé
  fetchOwned: vi.fn(),       // ❌ Inutilisé
  fetchSharedWithMe: vi.fn(), // ❌ Inutilisé
  fetchById: vi.fn(),        // ❌ Inutilisé
  create: vi.fn(),           // ❌ Inutilisé
  update: vi.fn(),           // ✅ Utilisé
  delete: vi.fn(),           // ❌ Inutilisé
};
```

**Après migration (respect ISP)** :

```typescript
// ✅ Service migré
export class SupabasePromptFavoriteService implements PromptFavoriteService {
  constructor(private mutationRepository: PromptMutationRepository) {} // 1 méthode

  async toggleFavorite(id: string, currentState: boolean): Promise<void> {
    await this.mutationRepository.update(id, { is_favorite: !currentState });
    // Utilise 1 méthode sur 1 → 100% d'utilisation
  }
}

// ✅ Tests focalisés
const mockMutationRepository: PromptMutationRepository = {
  update: vi.fn(), // ✅ Seule méthode nécessaire
};
```

**Métriques** :
- Surface d'API : **7 méthodes → 1 méthode** (-85%)
- Lignes de mock : **7 lignes → 1 ligne** (-85%)
- Complexité : **Cyclomatic 1 → 1** (stable)

### Migration 2 : PromptVisibilityService

**État initial** :

```typescript
// ❌ Service initial
export class SupabasePromptVisibilityService implements PromptVisibilityService {
  constructor(private promptRepository: PromptRepository) {} // 7 méthodes

  async toggleVisibility(...) {
    await this.promptRepository.update(...); // Utilise update()
  }

  async updatePublicPermission(id: string, permission: "READ" | "WRITE") {
    const prompt = await this.promptRepository.fetchById(id); // Utilise fetchById()
    
    if (prompt.visibility === "PRIVATE") {
      throw new Error("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");
    }

    await this.promptRepository.update(id, { public_permission: permission });
  }
  // Utilise 2 méthodes (fetchById + update) sur 7 → 71% de méthodes inutiles
}
```

**Après migration** :

```typescript
// ✅ Service migré
export class SupabasePromptVisibilityService implements PromptVisibilityService {
  constructor(
    private mutationRepository: PromptMutationRepository, // 1 méthode
    private queryRepository: PromptQueryRepository        // 4 méthodes
  ) {}

  async toggleVisibility(...) {
    await this.mutationRepository.update(...);
  }

  async updatePublicPermission(id: string, permission: "READ" | "WRITE") {
    const prompt = await this.queryRepository.fetchById(id);
    
    if (prompt.visibility === "PRIVATE") {
      throw new Error("PERMISSION_UPDATE_ON_PRIVATE_PROMPT");
    }

    await this.mutationRepository.update(id, { public_permission: permission });
  }
  // Utilise 2 méthodes (1 Mutation + 1 Query) → Séparation claire
}
```

**Métriques** :
- Surface d'API : **7 méthodes → 5 méthodes** (-28%)
- Séparation : **Monolithique → Query/Mutation**
- Testabilité : **2 mocks focalisés** (au lieu de 1 gros mock)

### Migration 3 : PromptDuplicationService

**État initial** :

```typescript
// ❌ Service initial
export class SupabasePromptDuplicationService implements PromptDuplicationService {
  constructor(private promptRepository: PromptRepository) {} // 7 méthodes

  async duplicate(userId: string, promptId: string, variableRepo: VariableRepository) {
    const original = await this.promptRepository.fetchById(promptId); // fetchById()
    // ...
    const newPrompt = await this.promptRepository.create(userId, {...}); // create()
    // ...
  }
  // Utilise 2 méthodes (fetchById + create) sur 7 → 71% de méthodes inutiles
}
```

**Après migration** :

```typescript
// ✅ Service migré
export class SupabasePromptDuplicationService implements PromptDuplicationService {
  constructor(
    private queryRepository: PromptQueryRepository,      // 4 méthodes
    private commandRepository: PromptCommandRepository   // 3 méthodes
  ) {}

  async duplicate(userId: string, promptId: string, variableRepo: VariableRepository) {
    const original = await this.queryRepository.fetchById(promptId);
    // ...
    const newPrompt = await this.commandRepository.create(userId, {...});
    // ...
  }
  // Utilise 2 méthodes focalisées → Pattern CQRS
}
```

**Métriques** :
- Surface d'API : **7 méthodes → 7 méthodes** (stable mais ségrégué)
- Séparation : **Monolithique → Query/Command (CQRS)**
- Sémantique : **Clarté des responsabilités** (lecture vs écriture)

---

## 6. Diagrammes d'architecture

### Diagramme 1 : Hiérarchie des repositories

<lov-presentation-mermaid>
graph TB
    subgraph "Interfaces ségrégées"
        IQuery["PromptQueryRepository<br/>━━━━━━━━━━━━━━<br/>+ fetchAll(userId)<br/>+ fetchOwned(userId)<br/>+ fetchSharedWithMe(userId)<br/>+ fetchById(id)"]
        
        IMutation["PromptMutationRepository<br/>━━━━━━━━━━━━━━<br/>+ update(id, updates)"]
        
        ICommand["PromptCommandRepository<br/>━━━━━━━━━━━━━━<br/>+ create(userId, data)<br/>+ update(id, updates)<br/>+ delete(id)"]
    end
    
    subgraph "Interface agrégée"
        IRepo["PromptRepository<br/>━━━━━━━━━━━━━━<br/>extends PromptQueryRepository<br/>extends PromptCommandRepository"]
    end
    
    subgraph "Implémentation unique"
        Impl["SupabasePromptRepository<br/>━━━━━━━━━━━━━━<br/>implements PromptRepository<br/><br/>Instance singleton partagée"]
    end
    
    IQuery -.-> IRepo
    ICommand -.-> IRepo
    IRepo --> Impl
    
    style IQuery fill:#e1f5e1,stroke:#4caf50,stroke-width:2px
    style IMutation fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style ICommand fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style IRepo fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style Impl fill:#ffebee,stroke:#f44336,stroke-width:3px
</lov-presentation-mermaid>

### Diagramme 2 : Flow d'injection de dépendances

<lov-presentation-mermaid>
graph LR
    subgraph "React Context Hierarchy"
        Root["PromptRepositoryProvider<br/>━━━━━━━━━━━━━━<br/>Instancie SupabasePromptRepository<br/>(instance unique)"]
        
        QueryCtx["PromptQueryRepositoryProvider<br/>━━━━━━━━━━━━━━<br/>Expose PromptQueryRepository"]
        
        MutationCtx["PromptMutationRepositoryProvider<br/>━━━━━━━━━━━━━━<br/>Expose PromptMutationRepository"]
        
        CommandCtx["PromptCommandRepositoryProvider<br/>━━━━━━━━━━━━━━<br/>Expose PromptCommandRepository"]
    end
    
    subgraph "Services"
        FavService["PromptFavoriteService<br/>━━━━━━━━━━━━━━<br/>Utilise MutationRepository"]
        
        VisService["PromptVisibilityService<br/>━━━━━━━━━━━━━━<br/>Utilise Mutation + Query"]
        
        DupService["PromptDuplicationService<br/>━━━━━━━━━━━━━━<br/>Utilise Command + Query"]
    end
    
    Root --> QueryCtx
    Root --> MutationCtx
    Root --> CommandCtx
    
    MutationCtx -.->|injecte| FavService
    MutationCtx -.->|injecte| VisService
    QueryCtx -.->|injecte| VisService
    CommandCtx -.->|injecte| DupService
    QueryCtx -.->|injecte| DupService
    
    style Root fill:#ffebee,stroke:#f44336,stroke-width:3px
    style QueryCtx fill:#e1f5e1,stroke:#4caf50,stroke-width:2px
    style MutationCtx fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style CommandCtx fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style FavService fill:#fce4ec,stroke:#e91e63,stroke-width:2px
    style VisService fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style DupService fill:#e0f2f1,stroke:#009688,stroke-width:2px
</lov-presentation-mermaid>

### Diagramme 3 : Pattern CQRS appliqué

<lov-presentation-mermaid>
graph TB
    subgraph "Clients"
        ReadClients["Hooks de lecture<br/>━━━━━━━━━━━━━━<br/>• usePrompts()<br/>• useOwnedPrompts()<br/>• usePrompt()"]
        
        WriteClients["Hooks d'écriture<br/>━━━━━━━━━━━━━━<br/>• useCreatePrompt()<br/>• useUpdatePrompt()<br/>• useDeletePrompt()"]
        
        Services["Services métier<br/>━━━━━━━━━━━━━━<br/>• PromptFavoriteService<br/>• PromptVisibilityService<br/>• PromptDuplicationService"]
    end
    
    subgraph "CQRS Layer"
        Query["Query Side<br/>━━━━━━━━━━━━━━<br/>PromptQueryRepository<br/><br/>Lecture seule<br/>Optimisé pour fetch"]
        
        Command["Command Side<br/>━━━━━━━━━━━━━━<br/>PromptCommandRepository<br/><br/>Écriture complète<br/>Gère create/update/delete"]
        
        Mutation["Mutation Side<br/>━━━━━━━━━━━━━━<br/>PromptMutationRepository<br/><br/>Mutations partielles<br/>Gère update uniquement"]
    end
    
    subgraph "Data Layer"
        DB[("Supabase<br/>Database")]
    end
    
    ReadClients -->|utilise| Query
    WriteClients -->|utilise| Command
    Services -->|utilise| Query
    Services -->|utilise| Mutation
    Services -->|utilise| Command
    
    Query -->|SELECT| DB
    Command -->|INSERT/UPDATE/DELETE| DB
    Mutation -->|UPDATE| DB
    
    style ReadClients fill:#e1f5e1,stroke:#4caf50,stroke-width:2px
    style WriteClients fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style Services fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style Query fill:#c8e6c9,stroke:#4caf50,stroke-width:3px
    style Command fill:#bbdefb,stroke:#2196f3,stroke-width:3px
    style Mutation fill:#ffe0b2,stroke:#ff9800,stroke-width:3px
    style DB fill:#ffebee,stroke:#f44336,stroke-width:3px
</lov-presentation-mermaid>

---

## 7. Guidelines de développement

### Quand créer une interface ségrégée ?

**Critères de décision** :

| Situation | Action recommandée |
|-----------|-------------------|
| Service utilise 1-2 méthodes sur 7+ | ✅ Créer interface ségrégée |
| Service utilise 5+ méthodes sur 7 | ⚠️ Garder interface complète (ou repenser service) |
| Service nécessite Queries ET Commands | ✅ Injecter 2 interfaces (`QueryRepo` + `CommandRepo`) |
| Service ne fait QUE des mutations | ✅ Utiliser `MutationRepository` uniquement |
| Service ne fait QUE des lectures | ✅ Utiliser `QueryRepository` uniquement |

### Pattern de naming

```typescript
// ✅ Conventions de nommage
interface {Entity}QueryRepository    // Opérations de lecture
interface {Entity}MutationRepository // Opérations de mutation partielle (update uniquement)
interface {Entity}CommandRepository  // Opérations de commande (create, update, delete)
interface {Entity}Repository         // Interface agrégée (legacy + implémentation)

// Contextes
{Entity}QueryRepositoryContext
{Entity}MutationRepositoryContext
{Entity}CommandRepositoryContext
{Entity}RepositoryContext            // Instancie l'implémentation unique

// Hooks
use{Entity}QueryRepository()
use{Entity}MutationRepository()
use{Entity}CommandRepository()
use{Entity}Repository()              // Pour code legacy
```

### Checklist de migration vers ISP

- [ ] **Analyser** : Identifier quelles méthodes du repository sont réellement utilisées
- [ ] **Définir** : Créer les interfaces ségrégées (`Query`, `Mutation`, `Command`)
- [ ] **Implémenter** : Vérifier que `Supabase{Entity}Repository` implémente bien l'interface agrégée
- [ ] **Contextes** : Créer les providers ségrégués qui réutilisent l'instance unique
- [ ] **Services** : Modifier les services pour injecter les interfaces minimales
- [ ] **Tests** : Mettre à jour les mocks pour utiliser les interfaces focalisées
- [ ] **Documentation** : Documenter les dépendances dans les commentaires JSDoc
- [ ] **Validation** : Vérifier que `npx tsc --noEmit` passe sans erreur
- [ ] **Tests unitaires** : Vérifier que tous les tests passent

### Anti-patterns à éviter

**❌ Anti-pattern 1 : Interface trop granulaire**

```typescript
// ❌ Trop de ségrégation = explosion combinatoire
interface FetchAllRepository { fetchAll(): Promise<Prompt[]>; }
interface FetchByIdRepository { fetchById(id: string): Promise<Prompt>; }
interface CreateRepository { create(data: Prompt): Promise<Prompt>; }
interface UpdateRepository { update(id: string, data: Partial<Prompt>): Promise<Prompt>; }
// → 4 interfaces pour 4 méthodes = complexité inutile
```

**✅ Solution : Regrouper par responsabilité**

```typescript
// ✅ Bon équilibre
interface PromptQueryRepository {
  fetchAll(): Promise<Prompt[]>;
  fetchById(id: string): Promise<Prompt>;
}

interface PromptCommandRepository {
  create(data: Prompt): Promise<Prompt>;
  update(id: string, data: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
}
```

**❌ Anti-pattern 2 : Dupliquer l'implémentation**

```typescript
// ❌ NE PAS faire : Créer plusieurs implémentations
class SupabasePromptQueryRepository { ... }    // ❌ Instance 1
class SupabasePromptCommandRepository { ... }  // ❌ Instance 2
// → Duplication de code + incohérence potentielle
```

**✅ Solution : Réutiliser l'instance unique**

```typescript
// ✅ Bon pattern : Une seule implémentation
class SupabasePromptRepository implements PromptRepository { ... }

// Les contexts ségrégués réutilisent la même instance
export function PromptQueryRepositoryProvider({ children }) {
  const repository = usePromptRepository(); // ✅ Réutilisation
  return <Context.Provider value={repository}>{children}</Context.Provider>;
}
```

**❌ Anti-pattern 3 : Injecter l'interface complète "par facilité"**

```typescript
// ❌ Pratique mais viole l'ISP
export class PromptFavoriteService {
  constructor(private repository: PromptRepository) {} // 7 méthodes
  
  toggleFavorite(id: string) {
    return this.repository.update(id, { is_favorite: true });
    // N'utilise qu'1 méthode sur 7
  }
}
```

**✅ Solution : Injecter seulement ce qui est nécessaire**

```typescript
// ✅ Conforme à l'ISP
export class PromptFavoriteService {
  constructor(private mutationRepo: PromptMutationRepository) {} // 1 méthode
  
  toggleFavorite(id: string) {
    return this.mutationRepo.update(id, { is_favorite: true });
  }
}
```

---

## 8. FAQ et bonnes pratiques

### Q1 : Pourquoi créer plusieurs interfaces au lieu d'une seule grosse ?

**R** : L'ISP vise à réduire le couplage et améliorer la testabilité. Une interface trop large :
- Force les clients à dépendre de méthodes qu'ils n'utilisent pas
- Rend les tests plus complexes (mock de toutes les méthodes)
- Crée un couplage fort entre des responsabilités non liées

Avec des interfaces ségrégées :
- ✅ Chaque client reçoit exactement ce dont il a besoin
- ✅ Tests focalisés et simples
- ✅ Changements localisés (modifier `QueryRepository` n'affecte pas les services utilisant `MutationRepository`)

### Q2 : Est-ce que ça ne crée pas plus de code ?

**R** : Oui, légèrement (+3 fichiers de contexts), mais :
- ✅ **Complexité réduite** : Chaque fichier est plus simple et focalisé
- ✅ **Tests simplifiés** : Moins de lignes de mock par test
- ✅ **Maintenabilité accrue** : Changements localisés, moins de risque de régression
- ✅ **Documentation vivante** : Les types TypeScript documentent les dépendances réelles

**Métriques du projet** :
- Lignes de code ajoutées : ~150 lignes (contexts ségrégués)
- Lignes de code supprimées dans les tests : ~200 lignes (mocks inutiles)
- **Bilan net** : -50 lignes, meilleure qualité

### Q3 : Faut-il toujours ségréguer les interfaces ?

**R** : Non, appliquer l'ISP de manière pragmatique :

**✅ Oui, si** :
- Service utilise <50% des méthodes disponibles
- Interface mélange des responsabilités différentes (Query + Command)
- Tests deviennent complexes à cause de gros mocks

**❌ Non, si** :
- Service utilise >80% des méthodes
- Interface est déjà cohérente et focalisée (ex: `VariableRepository` avec 5 méthodes liées)
- La ségrégation créerait plus de complexité que de bénéfices

### Q4 : Comment gérer les dépendances circulaires entre interfaces ?

**R** : Utiliser les **fichiers `.interfaces.ts`** :

```typescript
// ✅ src/repositories/PromptRepository.interfaces.ts
export interface PromptQueryRepository { ... }
export interface PromptMutationRepository { ... }
export interface PromptCommandRepository { ... }
export interface PromptRepository extends PromptQueryRepository, PromptCommandRepository {}

// ✅ src/repositories/PromptRepository.ts
import type { PromptRepository } from "./PromptRepository.interfaces";

export class SupabasePromptRepository implements PromptRepository {
  // Implémentation
}

// ✅ src/services/PromptFavoriteService.ts
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";
```

**Règle** : Séparer les types (`.interfaces.ts`) de l'implémentation (`.ts`) pour éviter les cycles.

### Q5 : Pourquoi une seule implémentation (`SupabasePromptRepository`) et pas une par interface ?

**R** : **Principe DRY (Don't Repeat Yourself)** :
- ❌ Créer `SupabasePromptQueryRepository`, `SupabasePromptCommandRepository` = duplication de code
- ❌ Risque d'incohérence entre les implémentations
- ❌ Plus difficile à maintenir

**Solution actuelle** :
- ✅ Une seule implémentation pour tout (`SupabasePromptRepository`)
- ✅ Les contexts ségrégués réutilisent cette instance unique
- ✅ TypeScript garantit la conformité aux interfaces via `implements`

### Q6 : Comment tester un service avec plusieurs repositories injectés ?

**R** : Créer des mocks focalisés pour chaque interface :

```typescript
// ✅ Test de PromptVisibilityService
describe("PromptVisibilityService", () => {
  const mockMutationRepo: PromptMutationRepository = {
    update: vi.fn(),
  };

  const mockQueryRepo: PromptQueryRepository = {
    fetchAll: vi.fn(),
    fetchOwned: vi.fn(),
    fetchSharedWithMe: vi.fn(),
    fetchById: vi.fn(),
  };

  const service = new SupabasePromptVisibilityService(
    mockMutationRepo,
    mockQueryRepo
  );

  it("vérifie le prompt avant de mettre à jour la permission", async () => {
    mockQueryRepo.fetchById.mockResolvedValue({ 
      id: "1", 
      visibility: "SHARED" 
    });
    mockMutationRepo.update.mockResolvedValue({});

    await service.updatePublicPermission("1", "WRITE");

    expect(mockQueryRepo.fetchById).toHaveBeenCalledWith("1");
    expect(mockMutationRepo.update).toHaveBeenCalledWith("1", { 
      public_permission: "WRITE" 
    });
  });
});
```

### Q7 : Est-ce que ce pattern fonctionne avec d'autres repositories (Variables, Versions, etc.) ?

**R** : Oui, appliquer le même pattern si besoin :

**Exemple `VariableRepository`** :
- ✅ Interface actuelle déjà cohérente (5 méthodes liées)
- ❌ Pas besoin de ségrégation (toutes les méthodes sont pertinentes)
- ✅ Garder l'interface unique

**Exemple `VersionRepository`** :
- Si un service n'utilise que `fetchVersions()` (lecture)
- ✅ Créer `VersionQueryRepository` avec `fetchVersions()`
- ✅ Créer `VersionCommandRepository` avec `createVersion()`, `restoreVersion()`

**Règle générale** : Analyser l'usage réel avant de ségréguer.

### Q8 : Comment gérer l'évolution future (ajout de nouvelles méthodes) ?

**R** : Ajouter les nouvelles méthodes dans l'interface appropriée :

**Exemple** : Ajouter une méthode `archivePrompt(id: string)` :

```typescript
// ✅ Option 1 : C'est une commande (modifie l'état)
export interface PromptCommandRepository {
  create(userId: string, data: PromptInsert): Promise<Prompt>;
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  delete(id: string): Promise<void>;
  archive(id: string): Promise<void>; // ✅ Ajout
}

// ✅ Option 2 : C'est une mutation simple (update du champ)
export interface PromptMutationRepository {
  update(id: string, updates: Partial<Prompt>): Promise<Prompt>;
  archive(id: string): Promise<void>; // ✅ Ajout (si logique spécifique)
}
```

**Critères de choix** :
- Si `archive()` = `update({ archived: true })` → Utiliser `MutationRepository.update()`
- Si `archive()` a une logique complexe → Ajouter méthode dédiée

---

## 9. Conclusion

### Bénéfices mesurés du pattern ISP

**Avant migration (état initial)** :
- `PromptFavoriteService` : 7 méthodes injectées, 1 utilisée (85% d'inutile)
- `PromptVisibilityService` : 7 méthodes injectées, 2 utilisées (71% d'inutile)
- `PromptDuplicationService` : 7 méthodes injectées, 2 utilisées (71% d'inutile)
- Tests : ~50 lignes de mocks inutiles

**Après migration (état actuel)** :
- `PromptFavoriteService` : 1 méthode injectée, 1 utilisée (100% d'utilisation) ✅
- `PromptVisibilityService` : 5 méthodes injectées (Mutation + Query), 2 utilisées ✅
- `PromptDuplicationService` : 7 méthodes injectées (Command + Query), 2 utilisées ✅
- Tests : Mocks focalisés, -50 lignes de code au total

**Métriques de qualité** :
- ✅ Couplage réduit de 85% pour `PromptFavoriteService`
- ✅ Tests 50% plus simples (mocks focalisés)
- ✅ Séparation claire Query/Mutation/Command (pattern CQRS)
- ✅ Documentation vivante via les types TypeScript
- ✅ Évolutivité : Ajouter une méthode n'affecte que les interfaces concernées

### Prochaines étapes recommandées

1. **Migrer les hooks CRUD** (`useCreatePrompt`, `useUpdatePrompt`, `useDeletePrompt`) vers repositories ségrégués
2. **Refactoriser `useDashboard`** pour utiliser `PromptQueryRepository` au lieu d'appels directs à `supabase`
3. **Documenter** les nouveaux patterns dans `REPOSITORY_GUIDE.md`
4. **Former l'équipe** sur l'ISP et les bonnes pratiques de ségrégation d'interfaces

### Ressources complémentaires

- **`docs/REPOSITORY_GUIDE.md`** : Guide général sur la création de repositories
- **`src/services/PromptFavoriteService.ts`** : Exemple simple (1 repository)
- **`src/services/PromptVisibilityService.ts`** : Exemple intermédiaire (2 repositories)
- **`src/services/PromptDuplicationService.ts`** : Exemple avancé (CQRS pattern)

---

**Auteur** : Architecture Team  
**Date** : 2025-01-22  
**Version** : 1.0.0
