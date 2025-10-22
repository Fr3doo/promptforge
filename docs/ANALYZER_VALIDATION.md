# Validation de l'Analyseur de Prompts

Ce document décrit les contraintes de validation appliquées par l'edge function `analyze-prompt` lors de l'analyse automatique des prompts par l'IA.

## Objectif

L'analyseur de prompts utilise Lovable AI (Google Gemini) pour extraire automatiquement la structure d'un prompt (sections, variables, métadonnées). Pour garantir la qualité et la sécurité des données, des contraintes de validation sont appliquées avant et après l'appel à l'IA.

## Contraintes de Validation

### 1. Input (Prompt fourni par l'utilisateur)

| Contrainte | Limite | Message d'erreur |
|------------|--------|------------------|
| Contenu requis | Non vide | "Le contenu du prompt est requis et doit être une chaîne" |
| Longueur minimale | > 0 caractères (après trim) | "Le prompt ne peut pas être vide" |
| Longueur maximale | ≤ 50 000 caractères | "Le prompt ne peut pas dépasser 50000 caractères" |

### 2. Variables Extraites

| Contrainte | Limite | Message d'erreur |
|------------|--------|------------------|
| Nombre max | 50 variables | "Nombre maximum de variables dépassé (50)" |
| Nom requis | Non vide | "Variable {index}: nom requis" |
| Longueur nom | ≤ 100 caractères | "Variable {nom}: nom trop long (max 100 caractères)" |
| Format nom | `^[a-zA-Z0-9_-]+$` | "Variable {nom}: caractères invalides (seulement a-z, A-Z, 0-9, _, -)" |
| Description | ≤ 500 caractères | "Variable {nom}: description trop longue (max 500 caractères)" |
| Valeur par défaut | ≤ 1 000 caractères | "Variable {nom}: valeur par défaut trop longue (max 1000 caractères)" |
| Options | ≤ 50 options | "Variable {nom}: trop d'options (max 50)" |
| Longueur option | ≤ 100 caractères | "Variable {nom}: option trop longue (max 100 caractères)" |

### 3. Métadonnées

| Contrainte | Limite | Message d'erreur |
|------------|--------|------------------|
| Rôle | ≤ 500 caractères | "Rôle trop long (max 500 caractères)" |
| **Objectifs** | **≤ 500 caractères par objectif** | **"Objectif trop long (max 500 caractères)"** |
| Nombre objectifs | ≤ 20 objectifs | "Trop d'objectifs (max 20)" |
| Étapes | ≤ 500 caractères par étape | "Étape trop longue (max 500 caractères)" |
| Nombre étapes | ≤ 50 étapes | "Trop d'étapes (max 50)" |
| Catégories | ≤ 50 caractères par catégorie | "Catégorie trop longue (max 50 caractères)" |
| Nombre catégories | ≤ 20 catégories | "Trop de catégories (max 20)" |

### 4. Sections et Template

| Contrainte | Limite | Message d'erreur |
|------------|--------|------------------|
| Section | ≤ 10 000 caractères | "Section trop longue (max 10000 caractères)" |
| Template | ≤ 100 000 caractères | "Template trop long (max 100000 caractères)" |

## Limite Objectifs : 500 Caractères

### Historique

- **Version initiale** : 200 caractères
- **Version 1.1 (2025-01-18)** : Augmentation à 500 caractères

### Raison du changement

L'IA Lovable AI (Google Gemini) génère parfois des objectifs détaillés dépassant 200 caractères, ce qui provoquait des erreurs de validation. L'augmentation à 500 caractères offre un équilibre entre :

- **Flexibilité** : Permet à l'IA de générer des objectifs plus détaillés
- **Qualité** : Encourage la concision tout en restant informatif
- **Lisibilité** : Maintient des objectifs lisibles dans l'UI (composant `MetadataView`)

### Prompt système

Pour encourager la génération d'objectifs concis, le prompt système contient l'instruction suivante :

```
IMPORTANT : Pour les objectifs, sois concis et précis (maximum ~400 caractères par objectif). 
Privilégie la clarté et l'essentiel plutôt que l'exhaustivité.
```

Cela guide l'IA vers des objectifs de ~400 caractères, avec une marge de sécurité jusqu'à 500 caractères.

## Gestion des Erreurs

### Côté Backend (Edge Function)

Toutes les erreurs de validation sont levées avec `throw new Error(message)` et retournées au client avec :

- **Status 400** : Erreurs de validation input (prompt vide, trop long, etc.)
- **Status 500** : Erreurs internes ou de validation de la réponse IA

### Côté Frontend (Hook `usePromptAnalysis`)

Le hook affiche les messages d'erreur spécifiques via toast :

```typescript
const errorMessage = error.message || messages.errors.analysis.failed;
errorToast(messages.labels.error, errorMessage);
```

Cela garantit que l'utilisateur voit exactement quelle contrainte a été violée (ex: "Objectif trop long (max 500 caractères)").

## Ajustements Futurs

Si les limites actuelles s'avèrent trop strictes ou trop permissives :

1. **Analyser les logs** : Identifier les prompts qui échouent régulièrement
2. **Ajuster les limites** : Modifier les valeurs dans `validateAIResponse()` (lignes 28-128)
3. **Mettre à jour le prompt système** : Ajuster les instructions pour l'IA (lignes 178-183)
4. **Documenter le changement** : Ajouter une entrée dans ce document

## Tests

Pour valider les contraintes :

1. **Test manuel** : Créer un prompt avec des objectifs > 500 caractères
2. **Vérifier l'erreur** : Confirmer que le message "Objectif trop long (max 500 caractères)" s'affiche
3. **Test de succès** : Créer un prompt avec des objectifs < 500 caractères
4. **Affichage UI** : Vérifier que les objectifs s'affichent correctement dans `MetadataView`

## Références

- **Edge Function** : `supabase/functions/analyze-prompt/index.ts`
- **Hook Client** : `src/hooks/usePromptAnalysis.ts`
- **Composant UI** : `src/components/analyzer/MetadataView.tsx`
- **Repository** : `src/repositories/AnalysisRepository.ts`
