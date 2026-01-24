# Tests des Edge Functions

## Vue d'ensemble

Ce document décrit les patterns de tests pour les Edge Functions du projet.

## Types de tests

### Tests unitaires (Deno)

**Fichiers :** `supabase/functions/<function-name>/*.test.ts`

- Testent des fonctions pures isolées
- N'effectuent pas d'appels réseau
- Utilisent `Deno.test` et les assertions de la bibliothèque standard

**Exemple :** `sanitize.test.ts` teste la fonction `sanitizeVariableNames()`

### Tests d'intégration (Deno)

**Fichiers :** `supabase/functions/<function-name>/*.integration.test.ts`

- Appellent réellement l'Edge Function déployée
- Valident le comportement end-to-end
- Nécessitent les variables d'environnement du `.env`

## Configuration requise

```bash
# .env (chargé automatiquement par dotenv)
VITE_SUPABASE_URL=https://blwjxiryohsrevcdynss.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Optionnel : pour les tests authentifiés
TEST_USER_JWT=eyJ...
```

## Exécution des tests

```bash
# Tests unitaires uniquement
deno test supabase/functions/analyze-prompt/sanitize.test.ts

# Tests d'intégration (nécessite Edge Function déployée)
deno test --allow-net --allow-env --allow-read supabase/functions/analyze-prompt/auth.integration.test.ts

# Tous les tests d'une fonction
deno test --allow-net --allow-env --allow-read supabase/functions/analyze-prompt/
```

## Pattern de test d'authentification

```typescript
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/analyze-prompt`;

Deno.test("function - rejects unauthenticated request", async () => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ /* ... */ }),
  });

  // IMPORTANT: Toujours consommer le body pour éviter les resource leaks
  const data = await response.json();

  assertEquals(response.status, 401);
  assertExists(data.error);
});
```

## Bonnes pratiques

### 1. Toujours consommer le body de la réponse

```typescript
// ✅ Correct
const data = await response.json();

// ✅ Correct (si pas besoin du contenu)
await response.text();

// ❌ Incorrect - peut causer des resource leaks
// response non consommée
```

### 2. Utiliser dotenv pour charger les variables d'environnement

```typescript
import "https://deno.land/std@0.224.0/dotenv/load.ts";
```

### 3. Nommer les fichiers de manière cohérente

| Type | Pattern | Exemple |
|------|---------|---------|
| Unitaire | `*.test.ts` | `sanitize.test.ts` |
| Intégration | `*.integration.test.ts` | `auth.integration.test.ts` |

### 4. Isoler les tests

Chaque test doit être indépendant et ne pas dépendre de l'ordre d'exécution.

### 5. Documenter les prérequis

```typescript
const TEST_USER_JWT = Deno.env.get("TEST_USER_JWT");

if (TEST_USER_JWT) {
  Deno.test("authenticated test", async () => { /* ... */ });
} else {
  console.log("⚠️ Skipping authenticated tests - TEST_USER_JWT not set");
}
```

## Tests existants

| Fonction | Fichier | Type | Description |
|----------|---------|------|-------------|
| `analyze-prompt` | `sanitize.test.ts` | Unitaire | Test de sanitization des noms de variables |
| `analyze-prompt` | `auth.integration.test.ts` | Intégration | Tests d'authentification JWT |

## Couverture des tests d'intégration pour `analyze-prompt`

### Tests d'authentification

| Scénario | Status attendu | Validé |
|----------|----------------|--------|
| Sans header Authorization | 401 | ✅ |
| Bearer token vide | 401 | ✅ |
| JWT invalide | 401 | ✅ |
| Token "undefined" | 401 | ✅ |
| Token "null" | 401 | ✅ |
| JWT forgé/expiré | 401 | ✅ |
| Token sans préfixe Bearer | 401 | ✅ |
| Token avec espaces uniquement | 401 | ✅ |

### Tests CORS

| Scénario | Status attendu | Validé |
|----------|----------------|--------|
| Requête OPTIONS (preflight) | 200 + headers CORS | ✅ |

### Tests avec authentification valide (nécessite TEST_USER_JWT)

| Scénario | Status attendu | Validé |
|----------|----------------|--------|
| Prompt vide | 400 | ⚠️ Optionnel |
| Champ promptContent manquant | 400 | ⚠️ Optionnel |

## Références

- [Supabase Edge Functions Testing](https://supabase.com/docs/guides/functions/unit-test)
- [Deno Testing Documentation](https://docs.deno.com/runtime/fundamentals/testing/)
- Memory: `security/analysis-edge-function-rate-limiting`
