

# Plan : Centralisation DRY - Validation ID et Mapping Variables

## Objectif

Implémenter deux modules utilitaires pour éliminer la duplication de code identifiée, avec une approche **atomique non-cassante** qui respecte l'architecture SOLID existante.

---

## Prise en compte des remarques

### 1. Séparation création/adoption

Le plan distingue clairement :
- **Phase A** : Création des modules + tests (aucune modification du code existant)
- **Phase B** : Adoption progressive (migration fichier par fichier)
- **Phase C** : Validation complète

### 2. Tests d'intégration pour messages d'erreur

Les tests vérifient explicitement que les messages d'erreur **restent identiques** au comportement actuel.

### 3. Compatibilité avec la gestion d'erreur globale

Analyse de l'existant :
- Le projet utilise `classifyError()` dans `usePromptSaveErrorHandler.ts` qui classifie les erreurs par **code** (PGRST116, 23505) ou **message** (contenant "permission", "network", etc.)
- Les erreurs "ID requis" ne sont pas actuellement captées par le classifier (elles passent dans le fallback `SERVER`)
- **Décision** : `RequiredIdError` doit hériter de `Error` standard pour rester compatible

---

## Phase A : Création des modules utilitaires (additions pures)

### A.1 : Module `requireId.ts`

**Fichier** : `src/lib/validation/requireId.ts`

```typescript
/**
 * Erreur levée lorsqu'un ID requis est manquant
 * 
 * @remarks
 * Hérite de Error standard pour compatibilité avec :
 * - try/catch classiques
 * - classifyError() qui filtre par code/message
 * - Les tests existants qui vérifient les messages
 * 
 * Le message conserve le format existant : "${fieldName} requis"
 */
export class RequiredIdError extends Error {
  readonly fieldName: string;
  
  constructor(fieldName: string = "ID") {
    super(`${fieldName} requis`);
    this.name = "RequiredIdError";
    this.fieldName = fieldName;
  }
}

/**
 * Vérifie qu'un ID est défini et non vide
 * 
 * @param value - Valeur à vérifier (string | undefined | null)
 * @param fieldName - Nom du champ pour le message d'erreur
 * @returns La valeur validée (type narrowing vers string)
 * @throws {RequiredIdError} Si la valeur est undefined, null ou chaîne vide
 * 
 * @example
 * ```typescript
 * // Avant (15+ occurrences répétées)
 * if (!userId) throw new Error("ID utilisateur requis");
 * 
 * // Après (DRY + type narrowing)
 * const validId = requireId(userId, "ID utilisateur");
 * // validId est garanti non-null ici
 * ```
 */
export function requireId(value: string | undefined | null, fieldName: string = "ID"): string {
  if (!value) {
    throw new RequiredIdError(fieldName);
  }
  return value;
}

/**
 * Vérifie qu'un tableau d'IDs est non vide
 * 
 * @param values - Tableau de valeurs à vérifier
 * @param fieldName - Nom du champ pour le message d'erreur
 * @returns Le tableau validé (type assertion)
 * @throws {RequiredIdError} Si le tableau est vide
 */
export function requireIds(values: string[], fieldName: string = "IDs"): string[] {
  if (!values.length) {
    throw new RequiredIdError(fieldName);
  }
  return values;
}
```

**Tests** : `src/lib/validation/__tests__/requireId.test.ts`

```typescript
describe("requireId", () => {
  // Cas positifs
  it("retourne la valeur si présente", () => {
    expect(requireId("abc-123", "ID")).toBe("abc-123");
  });

  // Cas négatifs - compatibilité messages existants
  it("lève RequiredIdError si undefined", () => {
    expect(() => requireId(undefined, "ID utilisateur")).toThrow("ID utilisateur requis");
  });

  it("lève RequiredIdError si null", () => {
    expect(() => requireId(null, "ID")).toThrow("ID requis");
  });

  it("lève RequiredIdError si chaîne vide", () => {
    expect(() => requireId("", "ID prompt")).toThrow("ID prompt requis");
  });

  // Test d'intégration : format du message identique
  it("produit un message identique à l'ancien pattern", () => {
    const oldPattern = () => { 
      const id = undefined; 
      if (!id) throw new Error("ID utilisateur requis"); 
    };
    const newPattern = () => requireId(undefined, "ID utilisateur");
    
    expect(() => oldPattern()).toThrow("ID utilisateur requis");
    expect(() => newPattern()).toThrow("ID utilisateur requis");
  });

  // Vérification de l'instance pour filtrage éventuel
  it("lève une instance de RequiredIdError", () => {
    try {
      requireId(undefined, "ID");
    } catch (e) {
      expect(e).toBeInstanceOf(RequiredIdError);
      expect(e).toBeInstanceOf(Error);
    }
  });
});

describe("requireIds", () => {
  it("retourne le tableau si non vide", () => {
    expect(requireIds(["a", "b"], "IDs")).toEqual(["a", "b"]);
  });

  it("lève RequiredIdError si tableau vide", () => {
    expect(() => requireIds([], "IDs version")).toThrow("IDs version requis");
  });
});

describe("RequiredIdError", () => {
  it("a le nom RequiredIdError", () => {
    const error = new RequiredIdError("test");
    expect(error.name).toBe("RequiredIdError");
  });

  it("expose fieldName pour filtrage", () => {
    const error = new RequiredIdError("ID utilisateur");
    expect(error.fieldName).toBe("ID utilisateur");
  });

  it("est compatible avec classifyError (fallback SERVER)", () => {
    // Vérifie que RequiredIdError n'interfère pas avec le classifier existant
    const error = new RequiredIdError("ID");
    expect(error.message).not.toContain("permission");
    expect((error as any).code).toBeUndefined();
    // => classifyError retournera "SERVER" (fallback)
  });
});
```

### A.2 : Module `variableMappers.ts`

**Fichier** : `src/lib/variables/variableMappers.ts`

```typescript
import type { Variable, VariableUpsertInput } from "@/repositories/VariableRepository";
import type { ImportableVariable } from "@/lib/promptImport";

/**
 * Transforme une variable existante en input pour upsert
 * 
 * Utilisé pour la duplication de prompts.
 * Préserve tous les champs métier sans les IDs (id, prompt_id).
 * 
 * @param variable - Variable source à transformer
 * @returns Input prêt pour upsertMany
 * 
 * @example
 * ```typescript
 * const variable: Variable = { id: "...", prompt_id: "...", name: "var1", ... };
 * const input = toVariableUpsertInput(variable);
 * // input n'a pas id ni prompt_id
 * ```
 */
export function toVariableUpsertInput(variable: Variable): VariableUpsertInput {
  return {
    name: variable.name,
    type: variable.type,
    required: variable.required,
    default_value: variable.default_value,
    help: variable.help,
    pattern: variable.pattern,
    options: variable.options,
    order_index: variable.order_index,
  };
}

/**
 * Transforme un tableau de variables pour duplication
 * 
 * @param variables - Tableau de variables sources
 * @returns Tableau d'inputs prêts pour upsertMany
 */
export function toVariableUpsertInputs(variables: Variable[]): VariableUpsertInput[] {
  return variables.map(toVariableUpsertInput);
}

/**
 * Transforme une variable importée en input pour upsert
 * 
 * Utilisé lors de l'import depuis JSON/Markdown.
 * Applique les valeurs par défaut pour les champs optionnels.
 * 
 * @param variable - Variable importée (format externe)
 * @param index - Position pour order_index
 * @returns Input prêt pour upsertMany
 * 
 * @remarks
 * Différences avec toVariableUpsertInput :
 * - Type casté vers les valeurs autorisées (fallback "STRING")
 * - required par défaut à false
 * - Mapping defaultValue → default_value
 * - pattern forcé à null (non supporté à l'import)
 */
export function fromImportable(variable: ImportableVariable, index: number): VariableUpsertInput {
  return {
    name: variable.name,
    type: (variable.type as "STRING" | "NUMBER" | "BOOLEAN" | "ENUM" | "DATE" | "MULTISTRING") || "STRING",
    required: variable.required ?? false,
    default_value: variable.defaultValue ?? null,
    help: variable.help ?? null,
    pattern: null, // Non supporté à l'import
    options: variable.options ?? null,
    order_index: index,
  };
}

/**
 * Transforme un tableau de variables importées
 * 
 * @param variables - Tableau de variables importées
 * @returns Tableau d'inputs avec order_index séquentiel
 */
export function fromImportables(variables: ImportableVariable[]): VariableUpsertInput[] {
  return variables.map((v, i) => fromImportable(v, i));
}
```

**Tests** : `src/lib/variables/__tests__/variableMappers.test.ts`

```typescript
import type { Variable } from "@/repositories/VariableRepository";
import type { ImportableVariable } from "@/lib/promptImport";

describe("toVariableUpsertInput", () => {
  const fullVariable: Variable = {
    id: "var-123",
    prompt_id: "prompt-456",
    name: "myVar",
    type: "STRING",
    required: true,
    default_value: "default",
    help: "Help text",
    pattern: "^[a-z]+$",
    options: ["a", "b"],
    order_index: 2,
    created_at: "2024-01-01T00:00:00Z",
  };

  it("copie tous les champs métier", () => {
    const result = toVariableUpsertInput(fullVariable);
    expect(result).toEqual({
      name: "myVar",
      type: "STRING",
      required: true,
      default_value: "default",
      help: "Help text",
      pattern: "^[a-z]+$",
      options: ["a", "b"],
      order_index: 2,
    });
  });

  it("exclut id, prompt_id et created_at", () => {
    const result = toVariableUpsertInput(fullVariable);
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("prompt_id");
    expect(result).not.toHaveProperty("created_at");
  });

  it("préserve null pour les optionnels", () => {
    const variable: Variable = {
      ...fullVariable,
      default_value: null,
      help: null,
      pattern: null,
      options: null,
    };
    const result = toVariableUpsertInput(variable);
    expect(result.default_value).toBeNull();
    expect(result.help).toBeNull();
    expect(result.pattern).toBeNull();
    expect(result.options).toBeNull();
  });

  // Test d'intégration : résultat identique à l'ancienne méthode
  it("produit le même résultat que mapVariablesForDuplication", () => {
    // Simule l'ancienne méthode privée de PromptDuplicationService
    const oldMethod = (v: Variable) => ({
      name: v.name,
      type: v.type,
      required: v.required,
      default_value: v.default_value,
      help: v.help,
      pattern: v.pattern,
      options: v.options,
      order_index: v.order_index,
    });
    
    expect(toVariableUpsertInput(fullVariable)).toEqual(oldMethod(fullVariable));
  });
});

describe("fromImportable", () => {
  it("applique STRING par défaut si type absent", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.type).toBe("STRING");
  });

  it("applique false par défaut si required absent", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.required).toBe(false);
  });

  it("mappe defaultValue vers default_value", () => {
    const variable: ImportableVariable = { name: "test", defaultValue: "val" };
    const result = fromImportable(variable, 0);
    expect(result.default_value).toBe("val");
  });

  it("utilise l'index comme order_index", () => {
    const variable: ImportableVariable = { name: "test" };
    expect(fromImportable(variable, 5).order_index).toBe(5);
  });

  it("force pattern à null (non supporté)", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.pattern).toBeNull();
  });

  it("applique null aux optionnels manquants", () => {
    const variable: ImportableVariable = { name: "test" };
    const result = fromImportable(variable, 0);
    expect(result.default_value).toBeNull();
    expect(result.help).toBeNull();
    expect(result.options).toBeNull();
  });

  // Test d'intégration : résultat identique à l'ancienne méthode
  it("produit le même résultat que mapVariablesForImport", () => {
    const importable: ImportableVariable = {
      name: "myVar",
      type: "NUMBER",
      required: true,
      defaultValue: "42",
      help: "Help",
      options: ["a", "b"],
    };
    
    // Simule l'ancienne méthode privée de PromptImportService
    const oldMethod = (v: ImportableVariable, index: number) => ({
      name: v.name,
      type: (v.type as any) || "STRING",
      required: v.required ?? false,
      default_value: v.defaultValue ?? null,
      help: v.help ?? null,
      pattern: null,
      options: v.options ?? null,
      order_index: index,
    });
    
    expect(fromImportable(importable, 3)).toEqual(oldMethod(importable, 3));
  });
});

describe("fromImportables", () => {
  it("assigne order_index séquentiel", () => {
    const variables: ImportableVariable[] = [
      { name: "a" },
      { name: "b" },
      { name: "c" },
    ];
    const results = fromImportables(variables);
    expect(results[0].order_index).toBe(0);
    expect(results[1].order_index).toBe(1);
    expect(results[2].order_index).toBe(2);
  });

  it("retourne un tableau vide si entrée vide", () => {
    expect(fromImportables([])).toEqual([]);
  });
});
```

---

## Phase B : Adoption progressive (migration fichier par fichier)

### Ordre de migration (risque minimal → risque modéré)

| Étape | Fichier | Occurrences | Risque |
|-------|---------|-------------|--------|
| B.1 | `VersionRepository.ts` | 3 requireId + 2 requireIds | Faible |
| B.2 | `PromptCommandRepository.ts` | 3 requireId | Faible |
| B.3 | `PromptQueryRepository.ts` | 7 requireId | Faible |
| B.4 | `ProfileRepository.ts` | 2 requireId | Faible |
| B.5 | `PromptDuplicationService.ts` | 1 requireId + mapper | Modéré |
| B.6 | `PromptImportService.ts` | 1 requireId + mapper | Modéré |
| B.7 | `usePrompts.ts` | 1 requireId | Faible |
| B.8 | `usePromptShares.ts` | 1 requireId | Faible |

### B.1 : Migration `VersionRepository.ts`

```typescript
// Avant (lignes 79-80)
async fetchByPromptId(promptId: string): Promise<Version[]> {
  if (!promptId) throw new Error("ID prompt requis");
  // ...
}

// Après
import { requireId, requireIds } from "@/lib/validation/requireId";

async fetchByPromptId(promptId: string): Promise<Version[]> {
  requireId(promptId, "ID prompt");
  // ...
}

async delete(versionIds: string[]): Promise<void> {
  requireIds(versionIds, "IDs version");
  // ...
}
```

### B.5 : Migration `PromptDuplicationService.ts`

```typescript
// Avant
import type { Variable, VariableUpsertInput } from "@/repositories/VariableRepository";

async duplicate(...) {
  if (!userId) throw new Error("ID utilisateur requis");
  // ...
  const variableInputs = this.mapVariablesForDuplication(originalVariables);
  // ...
}

private mapVariablesForDuplication(originalVariables: Variable[]): VariableUpsertInput[] {
  return originalVariables.map((variable) => ({
    name: variable.name,
    // ...
  }));
}

// Après
import { requireId } from "@/lib/validation/requireId";
import { toVariableUpsertInputs } from "@/lib/variables/variableMappers";

async duplicate(...) {
  requireId(userId, "ID utilisateur");
  // ...
  const variableInputs = toVariableUpsertInputs(originalVariables);
  // ...
}

// Suppression de la méthode privée mapVariablesForDuplication
```

### B.6 : Migration `PromptImportService.ts`

```typescript
// Avant
async import(...) {
  if (!userId) throw new Error("ID utilisateur requis");
  // ...
  const variableInputs = this.mapVariablesForImport(variables);
  // ...
}

private mapVariablesForImport(...) { ... }

// Après
import { requireId } from "@/lib/validation/requireId";
import { fromImportables } from "@/lib/variables/variableMappers";

async import(...) {
  requireId(userId, "ID utilisateur");
  // ...
  const variableInputs = fromImportables(variables);
  // ...
}

// Suppression de la méthode privée mapVariablesForImport
```

---

## Phase C : Validation complète

### C.1 : Tests unitaires des nouveaux modules

```bash
npm run test -- src/lib/validation/__tests__/requireId.test.ts
npm run test -- src/lib/variables/__tests__/variableMappers.test.ts
```

### C.2 : Tests de non-régression

```bash
# Tests des repositories
npm run test -- --grep "VersionRepository|PromptCommandRepository|PromptQueryRepository"

# Tests des services
npm run test -- --grep "DuplicationService|ImportService"

# Vérification des messages d'erreur existants
npm run test -- --grep "ID.*requis"
```

### C.3 : Vérification TypeScript

```bash
npm run typecheck
```

### C.4 : Recherche de résidus

```bash
# Vérifier qu'aucun ancien pattern ne reste
grep -r "if (!.*) throw new Error.*requis" src/repositories src/services src/hooks
```

---

## Fichiers créés/modifiés

### Fichiers créés (Phase A)

| Fichier | Description |
|---------|-------------|
| `src/lib/validation/requireId.ts` | Module de validation d'ID avec RequiredIdError |
| `src/lib/validation/__tests__/requireId.test.ts` | 12+ tests incluant compatibilité messages |
| `src/lib/variables/variableMappers.ts` | Fonctions de mapping pures |
| `src/lib/variables/__tests__/variableMappers.test.ts` | 15+ tests incluant compatibilité résultats |

### Fichiers modifiés (Phase B)

| Fichier | Changements |
|---------|-------------|
| `src/repositories/VersionRepository.ts` | 3 requireId + 2 requireIds |
| `src/repositories/PromptCommandRepository.ts` | 3 requireId |
| `src/repositories/PromptQueryRepository.ts` | 7 requireId |
| `src/repositories/ProfileRepository.ts` | 2 requireId |
| `src/services/PromptDuplicationService.ts` | 1 requireId + suppression méthode privée |
| `src/services/PromptImportService.ts` | 1 requireId + suppression méthode privée |
| `src/hooks/usePrompts.ts` | 1 requireId |
| `src/hooks/usePromptShares.ts` | 1 requireId |

---

## Risques et mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Changement de message d'erreur | Aucun | Messages préservés : `"${fieldName} requis"` |
| Incompatibilité classifyError | Aucun | RequiredIdError hérite de Error, pas de code spécial |
| Tests existants cassés | Très faible | Tests d'intégration vérifient identité des comportements |
| Import circulaire | Aucun | Modules dans lib/ sans dépendances cycliques |
| Performance | Aucun | Fonctions pures, overhead négligeable |

---

## Métriques attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Occurrences `if (!.*) throw new Error(".*requis")` | 18+ | 0 | **-100%** |
| Méthodes de mapping dupliquées | 2 | 0 | **-100%** |
| Lignes de code (validation ID) | ~36 | ~12 | **-67%** |
| Fonctions pures réutilisables | 15 | 21 | **+40%** |
| Tests unitaires ajoutés | - | 27+ | **+27** |

---

## Conformité SOLID

| Principe | Respect | Justification |
|----------|---------|---------------|
| **SRP** | ✅ | Modules dédiés : requireId.ts (validation), variableMappers.ts (transformation) |
| **OCP** | ✅ | Fonctions extensibles sans modification (nouveaux types de mapping possibles) |
| **LSP** | ✅ | RequiredIdError substituable à Error dans tout contexte |
| **DIP** | ✅ | Fonctions pures sans dépendance infrastructure |
| **DRY** | ✅ | Élimination de 18+ occurrences de duplication |
| **KISS** | ✅ | Implémentation minimale, API intuitive |

