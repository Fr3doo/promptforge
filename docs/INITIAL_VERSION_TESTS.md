# Tests du Workflow de Version Initiale

## Vue d'Ensemble

Ce fichier contient des tests complets pour valider le comportement du workflow de création de version initiale dans différents scénarios de succès et d'échec.

## Fichier de Tests

**Localisation :** `src/hooks/__tests__/usePromptSave.initialVersion.test.tsx`

## Scénarios Testés

### Scénario 1: Création Complète avec Succès ✅

**Objectif :** Vérifier que tout le workflow fonctionne correctement

**Actions :**
1. Créer un prompt avec variables
2. Appeler l'edge function `create-initial-version`
3. Vérifier que la version initiale est créée

**Assertions :**
- ✅ Le prompt est créé avec les bonnes données
- ✅ Les variables sont sauvegardées
- ✅ L'edge function est appelée avec les bons paramètres
- ✅ Notification de succès affichée
- ✅ Navigation vers `/prompts?justCreated={id}`
- ✅ Pas de toast warning

```typescript
it("should create prompt, save variables, and create initial version successfully", async () => {
  // Mock successful edge function call
  const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
    data: {
      success: true,
      version: { id: "version-1", semver: "1.0.0" },
    },
    error: null,
  });

  // ... test implementation
  
  expect(mockCreatePrompt).toHaveBeenCalled();
  expect(mockSaveVariables).toHaveBeenCalled();
  expect(mockEdgeFunctionInvoke).toHaveBeenCalled();
  expect(mockNotifyPromptCreated).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith("/prompts?justCreated=prompt-123");
  expect(mockToastWarning).not.toHaveBeenCalled();
});
```

### Scénario 2: Échec Création Version Initiale (Non-Bloquant) ⚠️

**Objectif :** Vérifier que l'utilisateur n'est pas bloqué en cas d'échec

**Actions :**
1. Créer un prompt
2. L'edge function échoue
3. Vérifier le comportement de récupération

**Assertions :**
- ✅ Le prompt est créé malgré l'échec
- ✅ Les variables sont sauvegardées
- ✅ Toast warning affiché avec message clair
- ✅ Notification de succès pour le prompt
- ✅ Navigation effectuée normalement
- ✅ L'utilisateur peut utiliser le prompt

```typescript
it("should create prompt and save variables but handle version creation failure gracefully", async () => {
  // Mock edge function failure
  const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
    data: null,
    error: { message: "Failed to create version" },
  });

  // ... test implementation
  
  expect(mockToastWarning).toHaveBeenCalledWith(
    "Prompt créé",
    expect.objectContaining({
      description: expect.stringContaining(
        "La version initiale n'a pas pu être créée"
      ),
    })
  );
  expect(mockNotifyPromptCreated).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalled();
});
```

### Scénario 3: Erreur Réseau ❌

**Objectif :** Gérer les erreurs réseau sans bloquer l'utilisateur

**Actions :**
1. Créer un prompt
2. L'edge function lève une exception réseau
3. Vérifier la récupération

**Assertions :**
- ✅ Le prompt est créé
- ✅ L'exception est interceptée
- ✅ Toast warning affiché
- ✅ Navigation effectuée

```typescript
it("should handle network errors gracefully without blocking user", async () => {
  const mockEdgeFunctionInvoke = vi
    .fn()
    .mockRejectedValue(new Error("Network request failed"));

  // ... test implementation
  
  expect(mockToastWarning).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalled();
});
```

### Scénario 4: Version Déjà Existante (Idempotence) 🔁

**Objectif :** Vérifier que le retry ne crée pas de doublons

**Actions :**
1. Créer un prompt
2. L'edge function retourne `{ success: true, skipped: true }`
3. Vérifier le comportement

**Assertions :**
- ✅ Pas de toast warning (c'est un succès)
- ✅ Notification de succès normale
- ✅ Navigation normale
- ✅ Pas de duplication de version

```typescript
it("should handle already existing version gracefully", async () => {
  const mockEdgeFunctionInvoke = vi.fn().mockResolvedValue({
    data: {
      success: true,
      skipped: true,
      version: { id: "existing-version", semver: "1.0.0" },
    },
    error: null,
  });

  // ... test implementation
  
  expect(mockToastWarning).not.toHaveBeenCalled();
  expect(mockNotifyPromptCreated).toHaveBeenCalled();
});
```

### Scénario 5: Cohérence des Données ✅

**Objectif :** Garantir que les données restent cohérentes en cas d'échec partiel

**Actions :**
1. Créer un prompt avec variables
2. La version initiale échoue
3. Vérifier que prompt et variables sont cohérents

**Assertions :**
- ✅ Prompt créé avec toutes ses propriétés
- ✅ Variables sauvegardées correctement
- ✅ Pas de données corrompues
- ✅ Prompt utilisable

```typescript
it("should ensure data consistency when version creation fails", async () => {
  // ... test implementation
  
  expect(mockCreatePrompt).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Consistency Test",
      content: "Content with {{var1}}",
    }),
    expect.any(Object)
  );
  
  expect(mockSaveVariables).toHaveBeenCalledWith({
    promptId: "consistent-prompt",
    variables: expect.arrayContaining([
      expect.objectContaining({
        name: "var1",
        default_value: "test",
      }),
    ]),
  });
});
```

### Scénario 6: Variables Multiples 📊

**Objectif :** Vérifier que toutes les variables sont sauvegardées même en cas d'échec

**Actions :**
1. Créer un prompt avec 3 variables de types différents
2. La version initiale échoue
3. Vérifier que toutes les variables sont présentes

**Assertions :**
- ✅ Toutes les variables sont sauvegardées
- ✅ Les types sont préservés (STRING, NUMBER, BOOLEAN)
- ✅ Les propriétés sont correctes
- ✅ Toast warning affiché mais prompt utilisable

```typescript
it("should save all variables even when version creation fails", async () => {
  const variables = [
    { name: "var1", type: "STRING", required: true },
    { name: "var2", type: "NUMBER", default_value: "42" },
    { name: "var3", type: "BOOLEAN", default_value: "true" },
  ];

  // ... test implementation
  
  expect(mockSaveVariables).toHaveBeenCalledWith({
    promptId: "multi-var-prompt",
    variables: expect.arrayContaining([
      expect.objectContaining({ name: "var1", type: "STRING" }),
      expect.objectContaining({ name: "var2", type: "NUMBER" }),
      expect.objectContaining({ name: "var3", type: "BOOLEAN" }),
    ]),
  });
});
```

## Mocks Utilisés

### Supabase Edge Function

```typescript
const mockEdgeFunctionInvoke = vi.fn();
vi.spyOn(supabaseModule.supabase.functions, "invoke").mockImplementation(
  mockEdgeFunctionInvoke
);
```

**Réponses simulées :**
- Succès : `{ data: { success: true, version: {...} }, error: null }`
- Échec : `{ data: null, error: { message: "..." } }`
- Skipped : `{ data: { success: true, skipped: true }, error: null }`
- Exception : `Promise.reject(new Error("..."))`

### Toast Notifications

```typescript
const mockToastWarning = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    warning: mockToastWarning,
  },
}));
```

### Navigation

```typescript
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
```

### Mutations

```typescript
const mockCreatePrompt = vi.fn();
const mockSaveVariables = vi.fn();

vi.mock("@/hooks/usePrompts", () => ({
  useCreatePrompt: () => ({ mutate: mockCreatePrompt }),
}));

vi.mock("@/hooks/useVariables", () => ({
  useBulkUpsertVariables: () => ({ mutate: mockSaveVariables }),
}));
```

## Exécution des Tests

### Commande

```bash
npm run test src/hooks/__tests__/usePromptSave.initialVersion.test.tsx
```

### Résultat Attendu

```
PASS  src/hooks/__tests__/usePromptSave.initialVersion.test.tsx
  usePromptSave - Initial Version Workflow
    Scénario 1: Création Complète avec Succès
      ✓ should create prompt, save variables, and create initial version successfully
    Scénario 2: Échec Création Version Initiale (Non-Bloquant)
      ✓ should create prompt and save variables but handle version creation failure gracefully
    Scénario 3: Erreur Réseau lors de la Création de Version
      ✓ should handle network errors gracefully without blocking user
    Scénario 4: Version Déjà Existante (Idempotence)
      ✓ should handle already existing version gracefully
    Scénario 5: Cohérence des Données en Cas d'Échec Partiel
      ✓ should ensure data consistency when version creation fails
    Scénario 6: Variables Multiples avec Échec de Version
      ✓ should save all variables even when version creation fails

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

## Couverture

### Code Couvert

- ✅ `usePromptSave` - Logique de création de prompt
- ✅ Edge function `create-initial-version` (via mock)
- ✅ Gestion d'erreur non-bloquante
- ✅ Toast notifications
- ✅ Navigation
- ✅ Sauvegarde de variables

### Chemins de Code

- ✅ Succès complet (happy path)
- ✅ Échec edge function avec `error` object
- ✅ Échec edge function avec exception
- ✅ Version déjà existante (idempotence)
- ✅ Variables multiples
- ✅ Variables avec prompt

## Loi de Murphy Appliquée

**"Tout ce qui peut mal tourner va mal tourner"**

Ces tests couvrent tous les points de défaillance possibles :

1. ✅ **Échec de création de version** → Utilisateur pas bloqué
2. ✅ **Erreur réseau** → Récupération gracieuse
3. ✅ **Version en double** → Pas de corruption
4. ✅ **Échec partiel** → Données cohérentes
5. ✅ **Variables multiples** → Toutes sauvegardées
6. ✅ **Prompt sans variables** → Fonctionne quand même

## Intégration Continue

### Configuration Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      include: ['src/hooks/usePromptSave.ts'],
      threshold: {
        lines: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
});
```

### GitHub Actions

```yaml
- name: Run Initial Version Tests
  run: npm run test -- src/hooks/__tests__/usePromptSave.initialVersion.test.tsx
```

## Prochaines Étapes

### Tests d'Intégration

Tester le workflow complet avec une vraie edge function en environnement de test :

```typescript
// e2e test
it("should create prompt with real edge function", async () => {
  // Setup test database
  // Call real edge function
  // Verify database state
});
```

### Tests de Performance

Vérifier que le workflow reste rapide même avec beaucoup de variables :

```typescript
it("should handle 50 variables without timeout", async () => {
  const variables = Array.from({ length: 50 }, (_, i) => ({
    name: `var${i}`,
    type: "STRING",
    required: false,
  }));
  
  await savePrompt({ variables });
  // Should complete in < 5s
});
```

## Références

- [Tâche 27 - Ajustement de la séquence de version initiale](./INITIAL_VERSION_SEQUENCE.md)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Loi de Murphy](https://fr.wikipedia.org/wiki/Loi_de_Murphy)
