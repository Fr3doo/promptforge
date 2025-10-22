# Guide de Tests - Bonnes Pratiques

## Normalisation des Données

### Champ Description

**Convention : Utiliser `null` pour les descriptions vides dans les tests**

```typescript
// ✅ Correct - Correspond à la normalisation
const mockPrompt = {
  title: "Test Prompt",
  description: null,  // Description vide
  content: "Content",
};

// ❌ Incorrect - Éviter dans les mocks de données
const mockPrompt = {
  title: "Test Prompt", 
  description: "",  // Sera transformé en null par le schéma
  content: "Content",
};
```

**Exception** : Les tests de validation peuvent utiliser `""` pour vérifier la transformation :

```typescript
it("should transform empty description to null", () => {
  const input = { description: "" };
  const result = promptSchema.safeParse(input);
  
  expect(result.data.description).toBeNull();
});
```

### Tests de Composants UI

Les composants reçoivent `null` mais affichent `""` :

```typescript
it("should display empty string for null description", () => {
  const prompt = { description: null };
  
  render(<PromptForm prompt={prompt} />);
  
  const input = screen.getByLabelText("Description");
  expect(input).toHaveValue(""); // UI affiche ""
});
```

## Cohérence des Tests

### Mock de Prompts

Toujours utiliser le même format pour les mocks :

```typescript
const createMockPrompt = (overrides = {}) => ({
  id: "prompt-123",
  title: "Mock Prompt",
  description: null,  // Toujours null par défaut
  content: "Mock content",
  tags: [],
  visibility: "PRIVATE" as const,
  owner_id: "user-123",
  version: "1.0.0",
  status: "PUBLISHED" as const,
  is_favorite: false,
  public_permission: "READ" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});
```

### Tests de Sauvegarde

Vérifier que `null` est bien envoyé à la base :

```typescript
it("should save null for empty description", async () => {
  const { result } = renderHook(() => usePromptForm());
  
  act(() => {
    result.current.setTitle("Title");
    result.current.setDescription("");  // UI utilise ""
    result.current.setContent("Content");
  });
  
  await result.current.handleSave();
  
  // Vérifier que null est envoyé
  expect(mockCreatePrompt).toHaveBeenCalledWith(
    expect.objectContaining({
      description: null,  // Et non ""
    })
  );
});
```

## Tests de Migration de Données

Si des données existantes contiennent `""`, elles seront normalisées lors de la prochaine sauvegarde :

```typescript
it("should normalize existing empty string descriptions", async () => {
  // Données existantes avec chaîne vide
  const existingPrompt = { description: "" };
  
  // Après validation par le schéma
  const validated = promptSchema.parse(existingPrompt);
  
  expect(validated.description).toBeNull();
});
```

## Tests de Brouillons (Draft)

Les brouillons peuvent utiliser `""` car ils sont en mémoire locale avant validation :

```typescript
it("should save draft with empty description", () => {
  const draft = {
    title: "Draft",
    description: "",  // OK pour les brouillons
    content: "Content",
    tags: [],
  };
  
  saveDraft(draft);
  const loaded = loadDraft();
  
  expect(loaded.description).toBe(""); // Pas encore normalisé
});
```

Mais lors de la sauvegarde finale, la normalisation s'applique :

```typescript
it("should normalize draft description on save", async () => {
  const draft = loadDraft(); // { description: "" }
  
  await savePrompt(draft);
  
  // Le schéma transforme en null
  expect(savedData.description).toBeNull();
});
```

## Vérification de Cohérence

### Checklist pour les nouveaux tests

- [ ] Les mocks utilisent `null` pour les descriptions vides
- [ ] Les tests de composants vérifient l'affichage de `""`
- [ ] Les tests de sauvegarde vérifient l'envoi de `null`
- [ ] Les tests de validation vérifient la transformation `"" → null`
- [ ] Les tests de chargement gèrent `description ?? ""`

### Tests d'Intégration

Tester le cycle complet :

```typescript
it("should handle description normalization throughout lifecycle", async () => {
  // 1. Création avec description vide
  const { result } = renderHook(() => usePromptForm());
  
  act(() => {
    result.current.setDescription("");
  });
  
  // 2. Validation transforme en null
  const validated = promptSchema.parse({
    description: result.current.description,
  });
  expect(validated.description).toBeNull();
  
  // 3. Sauvegarde envoie null
  await result.current.handleSave();
  expect(mockSave).toHaveBeenCalledWith(
    expect.objectContaining({ description: null })
  );
  
  // 4. Rechargement affiche ""
  const prompt = { description: null };
  act(() => {
    result.current.loadPrompt(prompt);
  });
  expect(result.current.description).toBe("");
});
```

## Références

- [Normalisation de la description](./DESCRIPTION_NORMALIZATION.md)
- [Schéma de validation](../src/lib/validation.ts)
- [Tests de validation](../src/lib/__tests__/validation.test.ts)
