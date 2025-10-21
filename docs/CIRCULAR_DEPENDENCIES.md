# Détection des dépendances circulaires

## Objectif

Prévenir les importations circulaires qui peuvent causer des problèmes de :
- **Chargement** : Ordre d'exécution indéterminé
- **Maintenabilité** : Couplage fort entre modules
- **Performance** : Bundling inefficace
- **Bugs** : Valeurs undefined lors de l'initialisation

## Configuration ESLint

Le projet utilise `eslint-plugin-import-x` pour détecter automatiquement les cycles d'imports.

### Règles actives

```javascript
{
  "import/no-cycle": ["error", { 
    maxDepth: Infinity,  // Détecte les cycles à toute profondeur
    ignoreExternal: true  // Ignore les dépendances externes
  }],
  "import/no-self-import": "error"  // Interdit les imports de soi-même
}
```

## Cas détectés

### ❌ Import circulaire simple
```typescript
// componentA.ts
import { ComponentB } from './componentB';

// componentB.ts  
import { ComponentA } from './componentA'; // ❌ Erreur détectée
```

### ❌ Import circulaire indirect
```typescript
// moduleA.ts
import { moduleB } from './moduleB';

// moduleB.ts
import { moduleC } from './moduleC';

// moduleC.ts
import { moduleA } from './moduleA'; // ❌ Cycle détecté (A → B → C → A)
```

### ❌ Auto-import
```typescript
// utils.ts
import { helperFunction } from './utils'; // ❌ Import de soi-même interdit
```

## Comment résoudre

### 1. Extraction dans un module partagé

**Avant :**
```typescript
// userService.ts
import { formatDate } from './dateService';

// dateService.ts
import { getUserTimezone } from './userService'; // ❌ Cycle
```

**Après :**
```typescript
// userService.ts
import { formatDate } from './dateService';

// dateService.ts
import { getDefaultTimezone } from './timezoneConfig';

// timezoneConfig.ts
export const getDefaultTimezone = () => 'UTC';
```

### 2. Inversion de dépendance (Dependency Injection)

**Avant :**
```typescript
// orderService.ts
import { notifyUser } from './notificationService';

// notificationService.ts
import { getOrderDetails } from './orderService'; // ❌ Cycle
```

**Après :**
```typescript
// orderService.ts
export const createOrder = (notifyFn: (orderId: string) => void) => {
  // ...
  notifyFn(orderId);
};

// notificationService.ts
import { createOrder } from './orderService';

createOrder((orderId) => {
  const details = fetchOrderDetails(orderId);
  notifyUser(details);
});
```

### 3. Lazy imports (dynamic imports)

Pour les cas où la séparation est difficile :

```typescript
// componentA.ts
const loadComponentB = async () => {
  const { ComponentB } = await import('./componentB');
  return ComponentB;
};
```

**⚠️ À utiliser en dernier recours** : Ne résout pas le problème de conception sous-jacent.

## Intégration dans le workflow

### Local (Pre-commit)
```bash
npm run lint  # Déclenché automatiquement par Husky
```

### CI/CD (GitHub Actions)
```yaml
- name: Run linter
  run: npm run lint
```

Les cycles d'imports **empêchent** :
- ✋ Les commits (via hook pre-commit)
- ✋ Les pushs (via hook pre-push)  
- ✋ La fusion des PR (via CI)

## Bonnes pratiques

### ✅ Architecture en couches
```
src/
├── domain/        # Logique métier (ne dépend de rien)
├── repositories/  # Accès données (dépend de domain)
├── hooks/         # Hooks React (dépend de repositories)
└── components/    # UI (dépend de hooks)
```

Règle : Les couches supérieures peuvent importer les couches inférieures, **jamais l'inverse**.

### ✅ Barrel exports prudents
```typescript
// ❌ Éviter les barrel exports qui réexportent tout
export * from './moduleA';
export * from './moduleB'; // Risque de cycles

// ✅ Exports explicites
export { SpecificFunctionA } from './moduleA';
export { SpecificFunctionB } from './moduleB';
```

### ✅ Types partagés
```typescript
// types.ts (pas de logique, seulement des types)
export interface User {
  id: string;
  name: string;
}

// userService.ts et authService.ts peuvent importer types.ts sans risque
```

## Exemples du projet

### Architecture repository (✅ Bonne pratique)
```typescript
// components → hooks → repositories → supabase
// Flux unidirectionnel, pas de cycles
```

### Règle ESLint Supabase (✅ Complément)
La règle `no-restricted-imports` empêche les imports directs de Supabase, **en plus** de la détection de cycles.

## Désactivation temporaire

**⚠️ À utiliser uniquement si absolument nécessaire** :

```typescript
// eslint-disable-next-line import/no-cycle
import { problematicImport } from './circular';
```

**Meilleure approche** : Refactorer pour éliminer le cycle.

## Ressources

- [Documentation ESLint import/no-cycle](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-cycle.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Principes d'architecture du projet
- [REPOSITORY_GUIDE.md](./REPOSITORY_GUIDE.md) - Guide des repositories (exemple d'architecture sans cycles)

## Commandes utiles

```bash
# Vérifier les cycles manuellement
npm run lint

# Lister tous les imports d'un fichier
npm run lint -- --debug

# Vérifier avant commit
git commit  # Husky exécutera automatiquement le linter
```

---

**Questions ?** Consultez [CONTRIBUTING.md](../CONTRIBUTING.md) ou ouvrez une issue.
