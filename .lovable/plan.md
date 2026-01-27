
# Plan Phase 3 : Améliorations mineures (🟡 Sévérité Faible)

## Objectif

Extraire de la logique réutilisable depuis les hooks existants pour améliorer la maintenabilité et la testabilité, sans modifier le comportement externe.

---

## Principes directeurs

| Principe | Application |
|----------|-------------|
| **SRP** | Chaque fonction a une seule responsabilité |
| **DIP** | Fonctions pures injectables |
| **KISS** | Pas de sur-ingénierie, extraction minimale |
| **DRY** | Code réutilisable dans d'autres contextes |

---

## Phase 3.1 : Extraction du hook `useCountdown`

### Analyse de l'existant

Le hook `usePromptAnalysis.ts` (lignes 31-57) contient une logique de countdown inline :

```typescript
// Lignes 24, 31-57 actuelles
const countdownRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  if (!isRateLimited || rateLimitRetryAfter <= 0) {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    return;
  }

  countdownRef.current = setInterval(() => {
    setRateLimitRetryAfter((prev) => {
      if (prev <= 1) {
        setIsRateLimited(false);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => { /* cleanup */ };
}, [isRateLimited, rateLimitRetryAfter > 0]);
```

**Problème SRP** : Logique de timer mélangée avec la logique d'analyse.

### Étapes atomiques

#### 3.1.1 - Créer le hook `useCountdown`

**Nouveau fichier** : `src/hooks/useCountdown.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountdownOptions {
  /** Callback appelé quand le countdown atteint 0 */
  onComplete?: () => void;
}

interface UseCountdownReturn {
  /** Secondes restantes */
  remaining: number;
  /** Countdown actif */
  isActive: boolean;
  /** Démarre le countdown avec un nombre de secondes */
  start: (seconds: number) => void;
  /** Arrête le countdown sans reset */
  stop: () => void;
  /** Reset à 0 et arrête */
  reset: () => void;
}

/**
 * Hook réutilisable pour gérer un countdown en secondes.
 * Fonction pure avec callback optionnel à la fin.
 * 
 * @example
 * ```typescript
 * const { remaining, isActive, start } = useCountdown({
 *   onComplete: () => setIsRateLimited(false)
 * });
 * 
 * // Démarrer countdown de 60s
 * start(60);
 * ```
 */
export function useCountdown(options: UseCountdownOptions = {}): UseCountdownReturn
```

**Implémentation** :
- `start(seconds)` : Initialise `remaining` et active le countdown
- `stop()` : Arrête l'intervalle sans reset de `remaining`
- `reset()` : Stop + remet `remaining` à 0
- `onComplete` : Appelé quand `remaining` atteint 0
- Nettoyage automatique via `useEffect` cleanup

#### 3.1.2 - Écrire les tests du hook

**Nouveau fichier** : `src/hooks/__tests__/useCountdown.test.tsx`

| Test | Description |
|------|-------------|
| `start(60)` | Initialise `remaining` à 60, `isActive` à true |
| Décrémentation | Décrémente chaque seconde (timer simulé via `vi.useFakeTimers()`) |
| `stop()` | Arrête le countdown, préserve `remaining` |
| `reset()` | Remet `remaining` à 0, `isActive` à false |
| `onComplete` | Callback appelé quand atteint 0 |
| Nouveau `start()` | Réinitialise un countdown en cours |
| Cleanup | Pas de memory leak sur unmount |

#### 3.1.3 - Refactorer `usePromptAnalysis` pour utiliser `useCountdown`

**Fichier modifié** : `src/hooks/usePromptAnalysis.ts`

Changements :
1. Supprimer `countdownRef` (ligne 24)
2. Supprimer le `useEffect` countdown (lignes 31-57)
3. Ajouter import et instanciation de `useCountdown`
4. Modifier le case `RATE_LIMIT` pour utiliser `countdown.start()`
5. Exposer `countdown.remaining` comme `rateLimitRetryAfter`

```typescript
// Avant (lignes 21-24)
const [isRateLimited, setIsRateLimited] = useState(false);
const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState(0);
const [rateLimitReason, setRateLimitReason] = useState<'minute' | 'daily'>('minute');
const countdownRef = useRef<NodeJS.Timeout | null>(null);

// Après
const [isRateLimited, setIsRateLimited] = useState(false);
const [rateLimitReason, setRateLimitReason] = useState<'minute' | 'daily'>('minute');
const countdown = useCountdown({
  onComplete: () => setIsRateLimited(false)
});
```

```typescript
// Avant (case RATE_LIMIT, lignes 101-111)
case "RATE_LIMIT":
  setIsRateLimited(true);
  setRateLimitRetryAfter(classified.retryAfter ?? 60);
  // ...

// Après
case "RATE_LIMIT":
  setIsRateLimited(true);
  countdown.start(classified.retryAfter ?? 60);
  // ...
```

```typescript
// Return (ligne 149)
// Avant
rateLimitRetryAfter,

// Après
rateLimitRetryAfter: countdown.remaining,
```

#### 3.1.4 - Vérifier la non-régression

- Exécuter `usePromptAnalysis.test.tsx` (7 tests existants)
- Aucun test ne doit échouer
- Le comportement externe est identique

---

## Phase 3.2 : Simplification du diffing dans `useVariableManager`

### Analyse de l'existant

Le hook `useVariableManager.ts` (lignes 29-40) contient une logique de synchronisation :

```typescript
// Synchronize variables with detected names in content
useEffect(() => {
  setVariables(prevVariables => {
    const validVariables = prevVariables.filter(v => detectedNames.includes(v.name));
    if (validVariables.length !== prevVariables.length) {
      return validVariables;
    }
    return prevVariables;
  });
}, [detectedNames]);
```

**Problème SRP** : Logique de filtrage inline, difficile à tester indépendamment.

### Étapes atomiques

#### 3.2.1 - Créer les fonctions pures de filtrage

**Nouveau fichier** : `src/lib/variables/variableFilters.ts`

```typescript
import type { Variable } from "@/features/prompts/types";

/**
 * Filtre les variables pour ne garder que celles présentes dans la liste de noms valides.
 * Fonction **pure** pour testabilité maximale.
 * 
 * @param variables - Variables existantes à filtrer
 * @param validNames - Noms de variables détectés dans le contenu
 * @returns Variables filtrées (préservant la référence si aucun changement)
 */
export function filterValidVariables(
  variables: Variable[],
  validNames: string[]
): Variable[] {
  return variables.filter(v => validNames.includes(v.name));
}

/**
 * Vérifie si un filtrage est nécessaire (optimisation pour éviter les re-renders inutiles).
 * 
 * @param variables - Variables existantes
 * @param validNames - Noms de variables détectés
 * @returns true si au moins une variable doit être supprimée
 */
export function needsFiltering(
  variables: Variable[],
  validNames: string[]
): boolean {
  return variables.some(v => !validNames.includes(v.name));
}
```

#### 3.2.2 - Écrire les tests des fonctions pures

**Nouveau fichier** : `src/lib/variables/__tests__/variableFilters.test.ts`

| Test | Description |
|------|-------------|
| `filterValidVariables` liste vide | Retourne `[]` |
| `filterValidVariables` tous valides | Retourne toutes les variables |
| `filterValidVariables` certains invalides | Retourne uniquement les valides |
| `filterValidVariables` aucun valide | Retourne `[]` |
| `needsFiltering` tous présents | Retourne `false` |
| `needsFiltering` certains absents | Retourne `true` |
| `needsFiltering` liste vide | Retourne `false` |

#### 3.2.3 - Refactorer `useVariableManager` pour utiliser les fonctions

**Fichier modifié** : `src/hooks/useVariableManager.ts`

```typescript
// Ajout import
import { filterValidVariables, needsFiltering } from "@/lib/variables/variableFilters";

// Remplacement useEffect (lignes 29-40)
useEffect(() => {
  setVariables(prevVariables => {
    if (!needsFiltering(prevVariables, detectedNames)) {
      return prevVariables;
    }
    return filterValidVariables(prevVariables, detectedNames);
  });
}, [detectedNames]);
```

#### 3.2.4 - Vérifier la non-régression

- Exécuter `useVariableManager.test.tsx` (16 tests existants)
- Tous les tests doivent passer
- Comportement identique

---

## Résumé des fichiers

| Action | Fichier | Phase |
|--------|---------|-------|
| Créer | `src/hooks/useCountdown.ts` | 3.1 |
| Créer | `src/hooks/__tests__/useCountdown.test.tsx` | 3.1 |
| Créer | `src/lib/variables/variableFilters.ts` | 3.2 |
| Créer | `src/lib/variables/__tests__/variableFilters.test.ts` | 3.2 |
| Modifier | `src/hooks/usePromptAnalysis.ts` | 3.1 |
| Modifier | `src/hooks/useVariableManager.ts` | 3.2 |

---

## Ordre d'implémentation recommandé

1. **Phase 3.1** - `useCountdown` (indépendant)
2. **Phase 3.2** - `variableFilters` (indépendant)

Ces deux phases sont complètement indépendantes et peuvent être implémentées en parallèle.

---

## Validation après chaque étape

```bash
npm run test           # Tous les tests passent
npm run lint           # Aucune erreur ESLint  
npm run typecheck      # Aucune erreur TypeScript
```

---

## Risques et mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Régression countdown | Faible | Tests existants + nouveaux tests |
| Régression filtrage variables | Faible | 16 tests existants couvrent les scénarios |
| Timer memory leak | Très faible | Cleanup explicite dans useCountdown |

---

## Documentation à mettre à jour

Après Phase 3 :
- `docs/SOLID_COMPLIANCE.md` : Ajouter section SRP Phase 3
- `docs/SRP_REFACTORING_SUMMARY.md` : Historique complet du refactoring

---

## Section technique : Détails d'implémentation

### useCountdown - Gestion du timer

```typescript
useEffect(() => {
  if (!isActive || remaining <= 0) {
    clearTimer();
    if (isActive && remaining === 0) {
      setIsActive(false);
      onComplete?.();
    }
    return;
  }

  intervalRef.current = setInterval(() => {
    setRemaining((prev) => Math.max(0, prev - 1));
  }, 1000);

  return clearTimer;
}, [isActive, remaining, onComplete, clearTimer]);
```

Points techniques :
- `Math.max(0, prev - 1)` évite les valeurs négatives
- Cleanup via `clearInterval` dans le return
- `onComplete` appelé une seule fois quand `remaining` atteint 0
- `isActive` permet de différencier "en pause" vs "terminé"

### variableFilters - Optimisation

```typescript
// needsFiltering vérifie s'il y a du travail à faire
// Évite de créer un nouveau tableau si rien ne change
if (!needsFiltering(prevVariables, detectedNames)) {
  return prevVariables; // Même référence = pas de re-render
}
return filterValidVariables(prevVariables, detectedNames);
```

Cette séparation permet :
1. D'éviter les allocations inutiles
2. De préserver la référence React pour optimiser les re-renders
3. De tester chaque fonction indépendamment
