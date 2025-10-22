# Normalisation du champ Description

## Décision

**Utiliser `null` pour les descriptions vides plutôt que des chaînes vides.**

## Raisons

1. **Sémantique en base de données** : `null` représente explicitement l'absence de valeur, alors qu'une chaîne vide représente une valeur présente mais vide. Pour un champ optionnel comme `description`, `null` est plus approprié.

2. **Optimisation du stockage** : `null` ne stocke pas de données, ce qui réduit légèrement la taille des enregistrements en base.

3. **Standard SQL/PostgreSQL** : La norme pour les champs optionnels en SQL est d'utiliser `NULL` plutôt que des chaînes vides.

4. **Éviter les conversions multiples** : Avec un format unique, on évite les conversions `null ↔ ""` dispersées dans le code.

## Implémentation

### Schéma de validation (`src/lib/validation.ts`)

```typescript
description: z.string()
  .trim()
  .max(3000, 'La description ne peut pas dépasser 3000 caractères')
  .transform(val => val === '' ? null : val)
  .nullable()
  .optional()
```

Le schéma transforme automatiquement les chaînes vides en `null`.

### Types TypeScript (`src/features/prompts/types.ts`)

```typescript
export interface PromptFormData {
  title: string;
  description: string | null;  // Explicitement null pour les valeurs vides
  content: string;
  visibility: "PRIVATE" | "SHARED";
  tags: string[];
}
```

### Composants UI

Les composants affichent une chaîne vide pour `null` en utilisant l'opérateur de coalescence nulle :

```typescript
// Affichage
<Textarea value={description ?? ""} />

// Initialisation
setDescription(prompt.description ?? "")
```

### Sauvegarde

La sauvegarde envoie `null` directement sans conversion supplémentaire :

```typescript
const promptData: PromptFormData = {
  title: validatedPromptData.title,
  description: validatedPromptData.description ?? null,  // Déjà transformé par le schéma
  content: validatedPromptData.content,
  tags: validatedPromptData.tags,
  visibility: validatedPromptData.visibility,
};
```

## Migrations nécessaires

Aucune migration de base de données n'est nécessaire car :
- La colonne `description` accepte déjà `NULL` (type `text | null`)
- Les données existantes avec des chaînes vides seront automatiquement normalisées lors de la prochaine sauvegarde

## Tests

Les tests doivent utiliser `null` pour les descriptions vides :

```typescript
// ✅ Correct
const mockPrompt = {
  title: "Test",
  description: null,  // Pas de description
  content: "Content",
};

// ❌ Incorrect (à éviter)
const mockPrompt = {
  title: "Test",
  description: "",  // Sera converti en null par le schéma
  content: "Content",
};
```

## Impact sur le code existant

Cette normalisation impacte :
- ✅ `src/lib/validation.ts` - Schéma de validation
- ✅ `src/features/prompts/types.ts` - Types TypeScript
- ✅ `src/hooks/usePromptSave.ts` - Suppression des conversions manuelles
- ✅ `src/features/prompts/hooks/usePromptForm.ts` - Utilisation de `??` au lieu de `||`
- ✅ `src/features/prompts/hooks/useAutoSave.ts` - Conservation de la conversion pour rétrocompatibilité

## Avantages

1. **Code plus propre** : Pas de conversions dispersées
2. **Type safety** : TypeScript force l'utilisation correcte de `null`
3. **Cohérence** : Un seul format dans toute l'application
4. **Performance** : Moins de transformations de données
5. **Maintenabilité** : Plus facile de comprendre l'intention du code

## Cas particuliers

### Comparaison avec des valeurs initiales

```typescript
// Comparer en normalisant les deux côtés
const hasChanged = description !== (prompt.description ?? "")
```

### Affichage conditionnel

```typescript
// Afficher uniquement si présent
{description && <p>{description}</p>}

// Ou avec coalescence
<p>{description ?? "Aucune description"}</p>
```

## Références

- [PostgreSQL NULL handling](https://www.postgresql.org/docs/current/functions-comparison.html)
- [Zod transform documentation](https://zod.dev/?id=transform)
- [TypeScript Nullish Coalescing](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing)
