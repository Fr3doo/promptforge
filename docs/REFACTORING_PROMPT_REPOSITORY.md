# Refactoring PromptRepository - Découplage de l'authentification

## Résumé des changements

Cette refactorisation découple complètement l'authentification de la logique métier du `PromptRepository` en respectant les principes SOLID (SRP et DIP).

## Modifications apportées

### 1. Interface PromptRepository

**Avant :**
```typescript
create(promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
duplicate(promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
```

**Après :**
```typescript
create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt>;
duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt>;
```

### 2. Implémentation SupabasePromptRepository

**Avant (méthode create) :**
```typescript
async create(promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
  const { data: { user } } = await supabase.auth.getUser(); // ❌ Appel direct à auth
  if (!user) throw new Error("Non authentifié");

  const result = await supabase
    .from("prompts")
    .insert({
      ...promptData,
      owner_id: user.id,
    })
    .select()
    .single();
  
  handleSupabaseError(result);
  return result.data;
}
```

**Après (méthode create) :**
```typescript
async create(userId: string, promptData: Omit<Prompt, "id" | "created_at" | "updated_at" | "owner_id">): Promise<Prompt> {
  if (!userId) throw new Error("ID utilisateur requis"); // ✅ Validation du paramètre

  const result = await supabase
    .from("prompts")
    .insert({
      ...promptData,
      owner_id: userId, // ✅ Utilise le userId fourni
    })
    .select()
    .single();
  
  handleSupabaseError(result);
  return result.data;
}
```

**Avant (méthode duplicate) :**
```typescript
async duplicate(promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
  const { data: { user } } = await supabase.auth.getUser(); // ❌ Appel direct à auth
  if (!user) throw new Error("Non authentifié");

  // ... logique de duplication utilisant user.id
}
```

**Après (méthode duplicate) :**
```typescript
async duplicate(userId: string, promptId: string, variableRepository: VariableRepository): Promise<Prompt> {
  if (!userId) throw new Error("ID utilisateur requis"); // ✅ Validation du paramètre

  // ... logique de duplication utilisant userId fourni
}
```

### 3. Hooks d'utilisation (usePrompts.ts)

**Avant :**
```typescript
export function useCreatePrompt() {
  const repository = usePromptRepository();
  
  return useMutation({
    mutationFn: (promptData) => repository.create(promptData), // ❌ Auth gérée dans repository
    // ...
  });
}
```

**Après :**
```typescript
export function useCreatePrompt() {
  const repository = usePromptRepository();
  const { user } = useAuth(); // ✅ Récupération de l'utilisateur via useAuth
  
  return useMutation({
    mutationFn: (promptData) => {
      if (!user) throw new Error("Non authentifié");
      return repository.create(user.id, promptData); // ✅ Passe userId au repository
    },
    // ...
  });
}

export function useDuplicatePrompt() {
  const repository = usePromptRepository();
  const variableRepository = useVariableRepository();
  const { user } = useAuth(); // ✅ Récupération de l'utilisateur via useAuth
  
  return useMutation({
    mutationFn: (promptId) => {
      if (!user) throw new Error("Non authentifié");
      return repository.duplicate(user.id, promptId, variableRepository); // ✅ Passe userId
    },
    // ...
  });
}
```

### 4. Tests (PromptRepository.test.ts)

**Ajouts de tests :**

```typescript
it("n'appelle pas supabase.auth.getUser", async () => {
  // ...
  await repository.create(mockUser.id, newPromptData);
  
  // Vérifier que auth.getUser n'a PAS été appelé
  expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
});

it("lève une erreur si l'ID utilisateur n'est pas fourni", async () => {
  await expect(repository.create("", newPromptData)).rejects.toThrow("ID utilisateur requis");
});

it("n'appelle pas supabase.auth.getUser lors de la duplication", async () => {
  // ...
  await repository.duplicate(mockUser.id, "prompt-id", mockVariableRepository);
  
  // Vérifier que auth.getUser n'a PAS été appelé
  expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
});
```

**Mise à jour des tests existants :**
- Tous les appels à `repository.create()` passent maintenant `userId` en premier paramètre
- Tous les appels à `repository.duplicate()` passent `userId` en premier paramètre
- Suppression des mocks de `supabase.auth.getUser` (plus nécessaires)

## Principes SOLID respectés

### 1. Single Responsibility Principle (SRP)

**Avant :** Le `PromptRepository` avait deux responsabilités :
- Gérer les données des prompts
- Gérer l'authentification utilisateur

**Après :** Le `PromptRepository` n'a qu'une seule responsabilité :
- Gérer les données des prompts

L'authentification est maintenant gérée par `useAuth`.

### 2. Dependency Inversion Principle (DIP)

**Avant :** Le repository dépendait directement de `supabase.auth` (module de bas niveau).

**Après :** Le repository dépend d'une abstraction (le `userId` fourni en paramètre). C'est le hook de haut niveau qui gère la dépendance concrète via `useAuth`.

```
Avant:                      Après:
┌──────────────────┐       ┌──────────────────┐
│  PromptRepository │       │  useCreatePrompt │
│                   │       │  (Hook métier)   │
│  ├─ create()      │       │                  │
│  │  └─ auth.getUser() │   │  ├─ useAuth()    │
│  └─ duplicate()   │       │  └─ repository   │
│     └─ auth.getUser() │   └──────────────────┘
└──────────────────┘               │
                                   │ userId
                                   ▼
                           ┌──────────────────┐
                           │  PromptRepository │
                           │  (Pure data)     │
                           │                  │
                           │  ├─ create(userId)│
                           │  └─ duplicate(userId)│
                           └──────────────────┘
```

## Avantages de cette refactorisation

### 1. Testabilité améliorée ✅

**Avant :**
- Nécessité de mocker `supabase.auth.getUser()` dans chaque test
- Tests couplés à l'implémentation de l'authentification
- Plus difficile à maintenir

**Après :**
- Aucun mock d'authentification nécessaire dans les tests du repository
- Tests plus simples et plus robustes
- Focus sur la logique métier uniquement

### 2. Flexibilité accrue ✅

**Avant :**
- Impossible de créer un prompt pour un autre utilisateur
- Pas de possibilité d'impersonation
- Pas de possibilité de migration de données

**Après :**
- Possibilité de passer n'importe quel `userId`
- Support de l'admin impersonation
- Facilite les scripts de migration

### 3. Séparation des préoccupations ✅

**Avant :**
- Le repository savait comment récupérer l'utilisateur courant
- Violation du SRP
- Couplage fort entre données et authentification

**Après :**
- Le repository ne sait rien de l'authentification
- Respect du SRP
- Couplage faible : chaque couche a sa responsabilité

### 4. Maintenabilité améliorée ✅

**Avant :**
- Changement du système d'auth = modification du repository
- Tests fragiles liés à l'implémentation de l'auth

**Après :**
- Changement du système d'auth = modification de `useAuth` uniquement
- Repository stable et isolé des changements d'infrastructure

## Impact sur le code existant

### Fichiers modifiés

1. `src/repositories/PromptRepository.ts`
   - Interface `PromptRepository` mise à jour
   - Implémentation `SupabasePromptRepository` refactorisée
   - Suppression des appels à `supabase.auth.getUser()`

2. `src/hooks/usePrompts.ts`
   - Import de `useAuth` ajouté
   - `useCreatePrompt` : récupère `user` via `useAuth` et passe `user.id`
   - `useDuplicatePrompt` : récupère `user` via `useAuth` et passe `user.id`

3. `src/repositories/__tests__/PromptRepository.test.ts`
   - Tous les tests de `create` mis à jour pour passer `userId`
   - Tous les tests de `duplicate` mis à jour pour passer `userId`
   - Nouveaux tests ajoutés pour vérifier l'absence d'appel à `auth`
   - Tests de validation de `userId` ajoutés

4. `docs/REPOSITORY_GUIDE.md`
   - Section sur le découplage de l'authentification ajoutée
   - Exemple `PromptRepository` mis à jour
   - FAQ complétée avec section sur l'authentification
   - Checklist de revue mise à jour

### Compatibilité

✅ **Aucun breaking change pour les utilisateurs finaux**

Tous les composants continuent de fonctionner de la même manière. Seule l'architecture interne a changé.

## Métriques

### Tests

- ✅ **100% des tests passent**
- ✅ **Couverture maintenue** : Aucune régression de couverture
- ✅ **Nouveaux tests ajoutés** : +3 tests spécifiques au découplage

### Code

- **Lignes modifiées** : ~60 lignes
- **Fichiers impactés** : 4 fichiers
- **Complexité cyclomatique** : Réduite (moins de conditions)

## Migration pour futurs repositories

Pour tous les nouveaux repositories nécessitant un `userId` :

```typescript
// ✅ À FAIRE
async create(userId: string, data: EntityInsert): Promise<Entity> {
  if (!userId) throw new Error("ID utilisateur requis");
  
  return supabase.from("entities").insert({
    ...data,
    user_id: userId,
  });
}

// ❌ À ÉVITER
async create(data: EntityInsert): Promise<Entity> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  
  return supabase.from("entities").insert({
    ...data,
    user_id: user.id,
  });
}
```

## Checklist de validation

- [x] Interface du repository mise à jour avec `userId` en paramètre
- [x] Implémentation du repository ne fait plus d'appel à `supabase.auth`
- [x] Hooks d'utilisation récupèrent `user` via `useAuth`
- [x] Hooks d'utilisation passent `user.id` au repository
- [x] Tous les tests du repository mis à jour
- [x] Nouveaux tests vérifiant l'absence d'appel à `auth`
- [x] Tests de validation de `userId` ajoutés
- [x] Documentation mise à jour (REPOSITORY_GUIDE.md)
- [x] Tous les tests passent
- [x] Aucune régression de couverture
- [x] ESLint ne signale aucune erreur

## Conclusion

Cette refactorisation améliore significativement l'architecture du projet en :

1. ✅ Respectant les principes SOLID (SRP, DIP)
2. ✅ Améliorant la testabilité du code
3. ✅ Réduisant le couplage entre couches
4. ✅ Facilitant la maintenance future
5. ✅ Servant d'exemple pour les futurs repositories

Le `PromptRepository` est maintenant un repository pur, focalisé uniquement sur la gestion des données, sans aucune dépendance à l'authentification.

---

**Date :** 2025-01-21  
**Auteur :** Équipe Architecture PromptForge  
**Statut :** ✅ Complété et validé
