

# Plan corrigé : Implémentation de `requireAuthUser`

## Objectif

Créer un module `src/lib/validation/requireAuthUser.ts` pour centraliser les vérifications d'authentification, en intégrant les corrections critiques suggérées.

---

## Corrections intégrées suite à la revue

### 1. Type narrowing avec `NonNullable<T>` (correction obligatoire)

**Problème identifié** : La signature `<T>(user: T | undefined | null): T` peut inférer `T = User | null`, rendant le type narrowing inefficace.

**Solution** :
```typescript
export function requireAuthUser<T>(
  user: T,
  message: string = "Utilisateur non authentifié"
): NonNullable<T> {
  if (user === undefined || user === null) {
    throw new UnauthenticatedError(message);
  }
  return user;
}
```

Ainsi, si `T = User | null`, `NonNullable<T> = User` → **narrowing garanti**.

### 2. Target TypeScript ES2020 (vérification OK)

Le fichier `tsconfig.app.json` montre `"target": "ES2020"`, donc l'extension de `Error` fonctionne correctement avec `instanceof`. Pas de workaround nécessaire.

### 3. Exclusion des retries pour `UnauthenticatedError`

**Problème potentiel** : Les mutations utilisent `shouldRetryMutation` qui pourrait retenter une erreur d'authentification.

**Solution** : Ajouter `UnauthenticatedError` et les messages d'auth dans les patterns non-rejouables de `isRetryableError()`.

```typescript
// Dans src/lib/network.ts - UNRETRYABLE_MESSAGE_PATTERNS
const UNRETRYABLE_MESSAGE_PATTERNS = [
  // ... existants ...
  'session_expired',        // Auth expiré
  'non authentifié',        // Auth manquant (FR)
  'not authenticated',      // Auth manquant (EN)
];
```

Et/ou vérifier le nom de l'erreur :
```typescript
// Dans isRetryableError()
if (error?.name === 'UnauthenticatedError') return false;
```

---

## Phase A : Création du module (additions pures)

### A.1 : Module `requireAuthUser.ts`

**Fichier** : `src/lib/validation/requireAuthUser.ts`

```typescript
/**
 * Erreur levée lorsqu'un utilisateur authentifié est requis mais absent.
 *
 * @remarks
 * Hérite de Error standard pour compatibilité avec :
 * - try/catch classiques
 * - classifyError() qui filtre par code/message
 * - Les gestionnaires onError qui vérifient error.message === "SESSION_EXPIRED"
 *
 * Le message est personnalisable pour conserver les codes d'erreur
 * spécifiques utilisés par certains hooks (ex: "SESSION_EXPIRED").
 */
export class UnauthenticatedError extends Error {
  constructor(message: string = "Utilisateur non authentifié") {
    super(message);
    this.name = "UnauthenticatedError";
  }
}

/**
 * Vérifie qu'un utilisateur est authentifié.
 *
 * @param user - Objet utilisateur à valider
 * @param message - Message ou code d'erreur à utiliser si l'utilisateur est absent
 * @returns L'utilisateur validé avec type narrowing (NonNullable<T>)
 * @throws {UnauthenticatedError} Si l'utilisateur est undefined ou null
 *
 * @example
 * ```typescript
 * // Avant (9 occurrences répétées)
 * if (!user) throw new Error("Utilisateur non authentifié");
 *
 * // Après (DRY + type narrowing garanti)
 * const validUser = requireAuthUser(user);
 * // validUser: User (pas User | null)
 *
 * // Avec message personnalisé (pour compatibilité SESSION_EXPIRED)
 * requireAuthUser(user, "SESSION_EXPIRED");
 * ```
 */
export function requireAuthUser<T>(
  user: T,
  message: string = "Utilisateur non authentifié"
): NonNullable<T> {
  if (user === undefined || user === null) {
    throw new UnauthenticatedError(message);
  }
  return user;
}
```

### A.2 : Tests unitaires

**Fichier** : `src/lib/validation/__tests__/requireAuthUser.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { requireAuthUser, UnauthenticatedError } from "../requireAuthUser";

describe("requireAuthUser", () => {
  // Cas positifs
  it("retourne l'utilisateur si présent", () => {
    const user = { id: "user-123", email: "test@example.com" };
    expect(requireAuthUser(user)).toBe(user);
  });

  it("préserve le type de l'objet utilisateur (générique)", () => {
    type CustomUser = { id: string; role: "admin" | "user" };
    const user: CustomUser = { id: "user-123", role: "admin" };
    const result = requireAuthUser(user);
    // TypeScript vérifie que result est CustomUser
    expect(result.role).toBe("admin");
  });

  // Cas négatifs
  it("lève UnauthenticatedError si undefined", () => {
    expect(() => requireAuthUser(undefined)).toThrow(UnauthenticatedError);
    expect(() => requireAuthUser(undefined)).toThrow("Utilisateur non authentifié");
  });

  it("lève UnauthenticatedError si null", () => {
    expect(() => requireAuthUser(null)).toThrow(UnauthenticatedError);
  });

  // Compatibilité messages existants
  it("utilise le message par défaut 'Utilisateur non authentifié'", () => {
    expect(() => requireAuthUser(null)).toThrow("Utilisateur non authentifié");
  });

  it("préserve le message SESSION_EXPIRED pour les handlers onError", () => {
    expect(() => requireAuthUser(null, "SESSION_EXPIRED")).toThrow("SESSION_EXPIRED");
  });

  it("produit un message identique à l'ancien pattern", () => {
    const oldPattern = () => { 
      const user = null; 
      if (!user) throw new Error("SESSION_EXPIRED"); 
    };
    const newPattern = () => requireAuthUser(null, "SESSION_EXPIRED");
    
    expect(() => oldPattern()).toThrow("SESSION_EXPIRED");
    expect(() => newPattern()).toThrow("SESSION_EXPIRED");
  });

  // Instance et héritage
  it("lève une instance de UnauthenticatedError", () => {
    try {
      requireAuthUser(null);
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(UnauthenticatedError);
      expect(e).toBeInstanceOf(Error);
    }
  });

  it("a le nom UnauthenticatedError", () => {
    try {
      requireAuthUser(null);
    } catch (e) {
      expect((e as Error).name).toBe("UnauthenticatedError");
    }
  });

  // Type narrowing vérifié (compile-time)
  it("effectue le type narrowing vers NonNullable<T>", () => {
    type User = { id: string } | null;
    const maybeUser: User = { id: "123" };
    const user = requireAuthUser(maybeUser);
    // Si ce test compile, le narrowing fonctionne
    expect(user.id).toBe("123");
  });
});

describe("UnauthenticatedError", () => {
  it("hérite correctement de Error", () => {
    const error = new UnauthenticatedError();
    expect(error instanceof Error).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it("utilise 'Utilisateur non authentifié' par défaut", () => {
    const error = new UnauthenticatedError();
    expect(error.message).toBe("Utilisateur non authentifié");
  });

  it("accepte un message personnalisé", () => {
    const error = new UnauthenticatedError("SESSION_EXPIRED");
    expect(error.message).toBe("SESSION_EXPIRED");
  });
});
```

---

## Phase A.3 : Mise à jour du module network.ts

**Fichier** : `src/lib/network.ts`

Ajouter l'exclusion des erreurs d'authentification des retries :

```typescript
// Ligne 47-48 : Ajouter les patterns d'authentification
const UNRETRYABLE_MESSAGE_PATTERNS = [
  'row-level security',
  'permission denied',
  'unauthorized',
  'invalid',
  'constraint',
  'violat',
  'not found',
  'already exists',
  'duplicate',
  'session_expired',      // NOUVEAU: Auth expiré
  'non authentifié',      // NOUVEAU: Auth manquant (FR)
  'not authenticated',    // NOUVEAU: Auth manquant (EN)
];

// Ligne 70-71 : Ajouter la vérification du nom d'erreur
export function isRetryableError(error: any): boolean {
  // 1. Erreurs de validation Zod → NON-REJOUABLE
  if (error?.name === 'ZodError') return false;
  
  // 1b. Erreurs d'authentification → NON-REJOUABLE (NOUVEAU)
  if (error?.name === 'UnauthenticatedError') return false;

  // ... reste inchangé
}
```

---

## Phase B : Migration incrémentale des hooks

### Ordre de migration (risque minimal → risque modéré)

| Étape | Fichier | Occurrences | Messages à préserver |
|-------|---------|-------------|---------------------|
| B.1 | `useDashboard.ts` | 1 | `"User not authenticated"` |
| B.2 | `usePrompts.ts` | 5 | `"Utilisateur non authentifié"`, `"Non authentifié"` |
| B.3 | `usePromptShares.ts` | 3 | `"SESSION_EXPIRED"` (critique) |

### B.1 : Migration `useDashboard.ts`

```typescript
// Avant (ligne 27)
if (!user) throw new Error("User not authenticated");

// Après
import { requireAuthUser } from "@/lib/validation/requireAuthUser";
// ...
queryFn: async (): Promise<DashboardStats> => {
  requireAuthUser(user, "User not authenticated");
  // user est maintenant garanti non-null
  const recentPrompts = await queryRepository.fetchRecent(user.id, 7, 5);
  // ...
}
```

### B.2 : Migration `usePrompts.ts`

```typescript
// Avant - 3 occurrences identiques (lignes 26, 42, 58)
if (!user) throw new Error("Utilisateur non authentifié");

// Après
import { requireAuthUser } from "@/lib/validation/requireAuthUser";

// usePrompts (ligne 26)
queryFn: () => {
  requireAuthUser(user); // Message par défaut
  return queryRepository.fetchAll(user.id);
}

// useOwnedPrompts (ligne 42)
queryFn: () => {
  requireAuthUser(user);
  return queryRepository.fetchOwned(user.id);
}

// useSharedWithMePrompts (ligne 58)
queryFn: () => {
  requireAuthUser(user);
  return queryRepository.fetchSharedWithMe(user.id);
}

// Avant - mutations (lignes 88, 194)
if (!user) throw new Error("Non authentifié");

// Après
mutationFn: (promptData) => {
  requireAuthUser(user, "Non authentifié");
  return commandRepository.create(user.id, promptData);
}
```

### B.3 : Migration `usePromptShares.ts` (critique)

```typescript
// Avant (lignes 38, 86, 118)
if (!user) throw new Error("SESSION_EXPIRED");

// Après
import { requireAuthUser } from "@/lib/validation/requireAuthUser";

// useAddPromptShare (ligne 38)
mutationFn: async ({ email, permission }) => {
  requireAuthUser(user, "SESSION_EXPIRED");
  // user garanti non-null, handlers onError préservés
  // ...
}

// useUpdatePromptShare (ligne 86)
mutationFn: async ({ shareId, permission }) => {
  requireAuthUser(user, "SESSION_EXPIRED");
  // ...
}

// useDeletePromptShare (ligne 118)
mutationFn: (shareId) => {
  requireAuthUser(user, "SESSION_EXPIRED");
  return repository.deleteShare(shareId, user.id);
}
```

---

## Phase C : Validation

### C.1 : Tests unitaires

```bash
npm run test src/lib/validation/__tests__/requireAuthUser.test.ts
```

### C.2 : Tests de non-régression

```bash
# Tests complets (vitest ne supporte pas --grep comme Jest)
npm run test

# Ou avec vitest pattern matching
npm run test -- usePrompts
npm run test -- usePromptShares
npm run test -- useDashboard
```

### C.3 : Vérification TypeScript

```bash
npm run typecheck
```

### C.4 : Recherche exhaustive de résidus

```bash
# Patterns variés à vérifier
grep -rE "if\s*\(\s*!user\s*\)" src/hooks
grep -rE "throw new Error.*authentif" src/hooks
grep -rE "throw new Error.*SESSION" src/hooks
```

---

## Fichiers créés/modifiés

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `src/lib/validation/requireAuthUser.ts` | Module avec UnauthenticatedError + requireAuthUser |
| `src/lib/validation/__tests__/requireAuthUser.test.ts` | 12+ tests unitaires |

### Fichiers modifiés

| Fichier | Changements |
|---------|-------------|
| `src/lib/network.ts` | Exclure UnauthenticatedError des retries |
| `src/hooks/useDashboard.ts` | 1 migration |
| `src/hooks/usePrompts.ts` | 5 migrations |
| `src/hooks/usePromptShares.ts` | 3 migrations |

---

## Documentation

### Mise à jour `docs/SOLID_COMPLIANCE.md`

Ajouter dans la section DRY (6.3) :

```markdown
#### 6.3 Validation d'authentification : requireAuthUser.ts

**Fichier** : `src/lib/validation/requireAuthUser.ts`

**Problème résolu** : 9 occurrences du pattern `if (!user) throw new Error("...")`
avec messages inconsistants dans les hooks.

**API** :
- `requireAuthUser<T>(user, message?)` : Valide un utilisateur, retourne NonNullable<T>
- `UnauthenticatedError` : Classe d'erreur pour filtrage

**Type narrowing garanti** :
```typescript
const user: User | null = getUser();
const validUser = requireAuthUser(user); // validUser: User (pas User | null)
```

**Fichiers migrés** :
- useDashboard (1 occurrence)
- usePrompts (5 occurrences)
- usePromptShares (3 occurrences)

**Intégration retries** :
- UnauthenticatedError exclue des retries dans `isRetryableError()`
```

---

## Risques et mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Type narrowing inefficace | ~~Moyenne~~ **Aucun** | Corrigé avec `NonNullable<T>` |
| instanceof cassé | Aucun | Target ES2020 compatible |
| Retries sur erreur auth | ~~Possible~~ **Aucun** | Exclusion explicite dans network.ts |
| Messages d'erreur modifiés | Aucun | Paramètre message préservé |
| Tests grep incorrects | ~~Possible~~ **Aucun** | Utilisation de vitest pattern matching |

---

## Métriques attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Occurrences `if (!user) throw` | 9 | 0 | **-100%** |
| Messages d'erreur auth différents | 4 | 1 fonction | **Centralisé** |
| Type narrowing garanti | Non | Oui | **NonNullable<T>** |
| Retries sur erreur auth | Possible | Exclu | **Sécurisé** |

