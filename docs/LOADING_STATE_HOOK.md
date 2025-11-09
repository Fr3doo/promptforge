# Hook useLoadingState

## Objectif

Centraliser la gestion des états de chargement, erreur et vide pour éliminer la duplication dans les composants.

## Principe

Au lieu de gérer manuellement les conditions `if (isLoading)`, `if (error)`, `if (isEmpty)` dans chaque composant, le hook `useLoadingState` encapsule cette logique.

## Utilisation

### Exemple Simple

```typescript
import { useLoadingState } from "@/hooks/useLoadingState";
import { PromptListSkeleton } from "@/components/PromptCardSkeleton";
import { EmptyState } from "@/components/EmptyState";

function MyComponent() {
  const { data: prompts, isLoading } = usePrompts();

  const loadingState = useLoadingState({
    isLoading,
    data: prompts,
    loadingComponent: <PromptListSkeleton />,
    emptyComponent: <EmptyState title="Aucun prompt" />,
    isEmpty: (data) => data.length === 0,
  });

  if (loadingState.shouldRender) {
    return loadingState.content;
  }

  return <PromptList prompts={prompts} />;
}
```

### Exemple Avancé (avec gestion d'erreur)

```typescript
const loadingState = useLoadingState({
  isLoading,
  data: dashboardData,
  error,
  loadingComponent: <DashboardSkeleton />,
  errorComponent: (error) => <ErrorAlert message={error.message} />,
  emptyComponent: <EmptyDashboard />,
  isEmpty: (data) => !data?.recentPrompts?.length && !data?.favoritePrompts?.length,
});
```

## API

### Configuration

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `isLoading` | `boolean` | ✅ | Indique si le chargement est en cours |
| `data` | `T \| undefined` | ✅ | Données à afficher |
| `loadingComponent` | `ReactNode` | ✅ | Composant à afficher pendant le chargement |
| `error` | `Error \| null` | ❌ | Erreur éventuelle |
| `errorComponent` | `(error: Error) => ReactNode` | ❌ | Composant à afficher en cas d'erreur |
| `emptyComponent` | `ReactNode` | ❌ | Composant à afficher si les données sont vides |
| `isEmpty` | `(data: T) => boolean` | ❌ | Fonction pour déterminer si les données sont vides |

### Résultat

| Propriété | Type | Description |
|-----------|------|-------------|
| `shouldRender` | `boolean` | Indique si le contenu de fallback doit être rendu |
| `content` | `ReactNode` | Contenu de fallback à rendre |

## Priorité des États

1. **Loading** (priorité maximale)
2. **Error**
3. **Empty**
4. **Data** (pas de fallback)

Si `isLoading` est `true`, les états error et empty sont ignorés.

## Composants Refactorisés

- ✅ `Dashboard.tsx` : -68% de code
- ✅ `PromptList.tsx` : -77% de code

## Tests

Voir `src/hooks/__tests__/useLoadingState.test.tsx` pour les tests unitaires.

## Bénéfices

- ✅ **DRY** : Élimine la duplication de logique de conditions
- ✅ **Type-safe** : TypeScript générique
- ✅ **Cohérence** : Même comportement partout
- ✅ **Testabilité** : Hook testable indépendamment
