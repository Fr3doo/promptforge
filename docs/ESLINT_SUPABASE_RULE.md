# Règle ESLint : Interdiction d'import direct de Supabase

## Objectif

Cette règle garantit le respect du **principe d'inversion de dépendance (DIP)** de SOLID en interdisant l'import direct du client Supabase en dehors des couches de services.

## Règle ESLint

```javascript
"no-restricted-imports": [
  "error",
  {
    patterns: [
      {
        group: ["**/integrations/supabase/client"],
        message: "Import direct de Supabase interdit ! Utilisez les repositories."
      }
    ]
  }
]
```

## Fichiers autorisés

Seuls ces fichiers peuvent importer directement `supabase` :

- `src/repositories/**/*.ts` - Repositories (PromptRepository, VariableRepository)
- `src/contexts/**/*RepositoryContext.tsx` - Contextes de repositories
- `supabase/functions/**/*.ts` - Edge functions Supabase
- `src/hooks/useAuth.tsx` - Hook d'authentification

## Utilisation correcte

### ❌ INTERDIT

```typescript
// Dans un composant ou hook custom
import { supabase } from "@/integrations/supabase/client";

function MyComponent() {
  const fetchData = async () => {
    const { data } = await supabase.from("prompts").select("*");
  };
}
```

### ✅ CORRECT

```typescript
// Utiliser les repositories via les contextes
import { usePromptRepository } from "@/contexts/PromptRepositoryContext";

function MyComponent() {
  const repository = usePromptRepository();
  
  const fetchData = async () => {
    const data = await repository.fetchAll();
  };
}
```

## Pourquoi cette règle ?

### 1. **Inversion de dépendance (DIP)**
Les composants et hooks dépendent d'**abstractions** (interfaces de repositories) et non d'**implémentations** concrètes (Supabase).

### 2. **Testabilité**
Les repositories peuvent être facilement mockés dans les tests :

```typescript
// Test avec mock
const mockRepository: PromptRepository = {
  fetchAll: vi.fn().mockResolvedValue([]),
  // ...
};
```

### 3. **Flexibilité**
Possibilité de changer de backend (Supabase → Firebase → API REST) sans toucher aux composants.

### 4. **Centralisation de la logique**
Toute la logique d'accès aux données est dans les repositories, évitant la duplication.

## Architecture recommandée

```
┌─────────────────────────────────────┐
│     Composants / Hooks              │
│  (utilisent les repositories)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Repository Contexts             │
│  (fournissent les repositories)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Repositories                    │
│  (implémentent les interfaces)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Supabase Client                 │
│  (couche d'accès bas niveau)        │
└─────────────────────────────────────┘
```

## Créer un nouveau repository

**📖 Consultez le guide complet :** [REPOSITORY_GUIDE.md](./REPOSITORY_GUIDE.md)

Le guide détaillé couvre :
- Architecture et principes SOLID
- Conventions de nommage complètes
- Templates de code avec exemples réels
- Stratégies de tests
- Gestion des relations entre entités
- Checklist de revue de code

### Résumé rapide

1. **Définir l'interface** dans `src/repositories/{Entity}Repository.ts`
2. **Implémenter avec Supabase** dans le même fichier
3. **Créer le contexte** dans `src/contexts/{Entity}RepositoryContext.tsx`
4. **Ajouter le provider** à `src/main.tsx`
5. **Utiliser dans les composants** via `use{Entity}Repository()`
6. **Écrire les tests** dans `src/repositories/__tests__/`

## Désactiver temporairement la règle

Si vous avez une raison **exceptionnelle** et **documentée** d'importer Supabase directement :

```typescript
// eslint-disable-next-line no-restricted-imports
import { supabase } from "@/integrations/supabase/client";

// JUSTIFICATION: Migration temporaire vers le nouveau repository
// TODO: Refactoriser pour utiliser MyRepository (ticket #123)
```

⚠️ **Cette pratique doit rester exceptionnelle et temporaire.**

## Vérifier les violations

### Localement

```bash
npm run lint
```

### En CI/CD

Les GitHub Actions exécutent automatiquement ESLint. Les PR avec des violations seront bloquées.

## Ressources

- [SOLID - Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture du projet

## Questions fréquentes

### Q: Puis-je utiliser `supabase.auth` dans mes composants ?

**R:** Non. Utilisez le hook `useAuth()` qui encapsule l'authentification.

### Q: Que faire pour les edge functions ?

**R:** Les edge functions peuvent importer Supabase directement car elles font partie de la couche backend.

### Q: Comment tester du code qui utilise les repositories ?

**R:** Utilisez des mocks :

```typescript
const mockRepository: PromptRepository = {
  fetchAll: vi.fn().mockResolvedValue([]),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  duplicate: vi.fn(),
  toggleFavorite: vi.fn(),
  toggleVisibility: vi.fn(),
};
```

### Q: La règle s'applique-t-elle aux fichiers de test ?

**R:** Oui. Les tests doivent également utiliser les repositories pour refléter l'usage réel. Mockez les repositories, pas Supabase directement.

---

**Dernière mise à jour :** $(date)
**Responsable :** Équipe Architecture
