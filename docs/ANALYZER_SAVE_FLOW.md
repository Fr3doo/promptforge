# Flux de Sauvegarde - Analyseur de Prompt

## Vue d'ensemble

Ce document décrit le flux complet de sauvegarde d'un prompt analysé par l'IA, incluant la création du prompt, la sauvegarde des variables détectées, et la création de la version initiale.

## Séquence de Sauvegarde

### 1. Validation des Données (Zod Schema)

Avant toute opération de sauvegarde, les données du prompt sont validées avec le schéma Zod `promptSchema` :

```typescript
promptSchema.parse({
  title: string,
  content: string,
  description: string,
  tags: string[],
  visibility: "PRIVATE" | "SHARED",
  status: "PUBLISHED" | "DRAFT",
  public_permission: "READ" | "WRITE"
});
```

**En cas d'échec** :
- Un toast d'erreur est affiché avec le message de validation
- La sauvegarde est annulée
- L'utilisateur reste sur la page de l'analyseur

### 2. Création du Prompt (Table `prompts`)

Le prompt est créé avec les métadonnées extraites par l'IA :

```typescript
createPrompt({
  title: result.metadata.objectifs?.[0] || "Prompt analysé",
  content: result.prompt_template,
  description: description_générée,
  tags: result.metadata.categories || [],
  version: "1.0.0",
  visibility: "PRIVATE",
  status: "PUBLISHED",
  public_permission: "READ"
});
```

**Construction de la description** :
La description est construite à partir des métadonnées de l'analyse :
- **Objectifs** : Listés avec des puces
- **Étapes** : Numérotées séquentiellement
- **Critères de qualité** : Listés avec des puces
- **Fallback** : Si aucune métadonnée n'est disponible, utilise le rôle

**En cas d'échec** :
- Toast d'erreur avec le message spécifique
- La sauvegarde s'arrête
- L'utilisateur peut corriger et réessayer

### 3. Sauvegarde des Variables (Table `variables`)

Si des variables ont été détectées (`result.variables.length > 0`), elles sont sauvegardées via `useBulkUpsertVariables` :

```typescript
saveVariables({
  promptId: newPrompt.id,
  variables: result.variables.map((v, index) => ({
    name: v.name,
    type: v.type?.toUpperCase() || "STRING",
    required: v.required ?? false,
    default_value: v.default_value || "",
    help: v.description || "",
    pattern: v.pattern || "",
    options: v.options || [],
    order_index: index
  }))
});
```

**Mapping des données** :
| Champ Analyseur | Champ Variable | Transformation |
|-----------------|----------------|----------------|
| `v.name` | `name` | Direct |
| `v.type` | `type` | `toUpperCase()` + cast |
| `v.required` | `required` | `?? false` |
| `v.default_value` | `default_value` | `\|\| ""` |
| `v.description` | `help` | Direct |
| `v.pattern` | `pattern` | `\|\| ""` |
| `v.options` | `options` | `\|\| []` |
| `index` | `order_index` | Position dans le tableau |

**En cas d'échec** :
- Toast d'erreur spécifique aux variables
- Le prompt reste créé (pas de rollback)
- L'utilisateur est redirigé (onClose)
- L'erreur est loggée pour débogage

### 4. Création de la Version Initiale (Table `versions`)

La version initiale 1.0.0 est créée via l'edge function `create-initial-version` :

```typescript
createInitialVersion({
  promptId: newPrompt.id,
  content: newPrompt.content,
  message: "Version initiale créée depuis l'analyseur"
});
```

**En cas d'échec** :
- Toast de succès avec warning ("La version initiale n'a pas pu être créée")
- Le prompt et les variables restent sauvegardés
- L'utilisateur est redirigé (onClose)
- L'erreur est loggée pour investigation

### 5. Confirmation et Fermeture

Si toutes les étapes réussissent :
- Toast de succès : "Prompt sauvegardé avec succès"
- Appel du callback `onClose?.()` pour fermer l'analyseur
- Rafraîchissement automatique de la liste des prompts (via React Query)

## Gestion des Erreurs

### Niveaux de Criticité

| Étape | Échec | Impact | Action |
|-------|-------|--------|--------|
| Validation Zod | ❌ Bloque tout | Données invalides | Toast + Annulation |
| Création prompt | ❌ Bloque tout | Rien n'est sauvegardé | Toast + Possibilité de réessayer |
| Sauvegarde variables | ⚠️ Continue | Prompt créé sans variables | Toast d'erreur + Fermeture |
| Création version | ⚠️ Continue | Prompt créé sans historique | Toast de warning + Fermeture |

### Logging

Toutes les erreurs sont capturées avec `captureException` pour traçabilité :

```typescript
captureException(error, "Échec sauvegarde variables depuis analyseur");
```

## Cas d'Usage

### Cas 1 : Prompt Simple (Sans Variables)

**Input** :
```
Analyseur détecte un prompt sans variables.
```

**Flux** :
1. ✅ Validation Zod
2. ✅ Création prompt
3. ⏭️ Saut de la sauvegarde variables (tableau vide)
4. ✅ Création version initiale
5. ✅ Confirmation et fermeture

### Cas 2 : Prompt Complexe (Avec Variables)

**Input** :
```
Analyseur détecte 3 variables : {{topic}}, {{tone}}, {{length}}
```

**Flux** :
1. ✅ Validation Zod
2. ✅ Création prompt
3. ✅ Sauvegarde des 3 variables
4. ✅ Création version initiale
5. ✅ Confirmation et fermeture

### Cas 3 : Échec Partiel (Variables Échouent)

**Input** :
```
Base de données indisponible pendant la sauvegarde des variables
```

**Flux** :
1. ✅ Validation Zod
2. ✅ Création prompt (ID: abc-123)
3. ❌ Sauvegarde variables (erreur réseau)
4. ⏭️ Saut de la création de version
5. ⚠️ Toast d'erreur + Fermeture

**Résultat** :
- Prompt créé et visible dans la liste
- Aucune variable attachée
- Aucune version historique
- Utilisateur peut ajouter manuellement les variables

### Cas 4 : Validation Échoue

**Input** :
```
Title vide ou trop long (> 255 caractères)
```

**Flux** :
1. ❌ Validation Zod échoue
2. ⏹️ Arrêt immédiat
3. Toast d'erreur : "Données invalides"
4. Utilisateur reste sur l'analyseur

## Tests Unitaires

Voir `src/components/__tests__/PromptAnalyzer.test.tsx` pour les tests couvrant :

- ✅ Sauvegarde complète avec variables et version
- ✅ Sauvegarde sans variables
- ✅ Gestion des erreurs de validation
- ✅ Échec de création prompt
- ✅ Échec de sauvegarde variables (continue quand même)
- ✅ Échec de création version (continue quand même)

## Références

- **Hooks utilisés** :
  - `useCreatePrompt` : [`src/hooks/usePrompts.ts`](../src/hooks/usePrompts.ts)
  - `useBulkUpsertVariables` : [`src/hooks/useVariables.ts`](../src/hooks/useVariables.ts)
  - `useCreateVersion` : [`src/hooks/useVersions.ts`](../src/hooks/useVersions.ts)

- **Schemas** :
  - `promptSchema` : [`src/lib/validation.ts`](../src/lib/validation.ts)

- **Edge Functions** :
  - `create-initial-version` : [`supabase/functions/create-initial-version/index.ts`](../supabase/functions/create-initial-version/index.ts)

## Améliorations Futures

1. **Rollback Atomique** : Implémenter une transaction pour annuler le prompt si les variables échouent
2. **Prévisualisation** : Permettre à l'utilisateur de vérifier/modifier avant sauvegarde
3. **Navigation Intelligente** : Rediriger vers l'éditeur du nouveau prompt au lieu de fermer
4. **Réessai Automatique** : Retry automatique en cas d'erreur réseau temporaire
5. **Métrics** : Tracker le taux de succès de chaque étape pour optimiser la fiabilité
