# Guide de Tests - PromptForge

## Types de tests

### Tests unitaires (Vitest)
Testent les fonctions et hooks isolément.

**Lancer les tests:**
```bash
npm run test          # Mode watch
npm run test:ui       # Interface graphique
npm run test:coverage # Avec couverture
```

## Structure

```
src/
  hooks/
    __tests__/
      usePrompts.test.ts
      useVariableManager.test.tsx
      useVariableDetection.test.tsx
  features/
    prompts/
      components/
        __tests__/
          PromptCard.test.tsx
  lib/
    __tests__/
      validation.test.ts
  test/
    setup.ts
    utils.tsx
```

## Conventions

- Fichiers de test : `*.test.ts` ou `*.spec.ts`
- Mocks dans `__mocks__/`
- Helpers dans `test/utils.tsx`

## Couverture cible

- Fonctions critiques : 90%+
- Composants UI : 70%+
- Hooks React Query : 80%+

## Écrire un nouveau test

### Test unitaire
```typescript
import { describe, it, expect } from "vitest";

describe("MyFunction", () => {
  it("should do something", () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### Test composant
```typescript
import { render, screen } from "@/test/utils";

it("renders component", () => {
  render(<MyComponent />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

### Test hook
```typescript
import { renderHook, act, waitFor } from "@testing-library/react";

it("returns expected value", () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe(expected);
});

// Avec modification d'état
it("updates state correctly", async () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.updateValue("new value");
  });
  
  await waitFor(() => {
    expect(result.current.value).toBe("new value");
  });
});
```

## Mocking

### Supabase Client
```typescript
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));
```

### Hooks personnalisés
```typescript
vi.mock("../useToastNotifier", () => ({
  useToastNotifier: () => ({
    notifySuccess: vi.fn(),
    notifyInfo: vi.fn(),
    notifyError: vi.fn(),
    notifyWarning: vi.fn(),
  }),
}));

vi.mock("../useVariableDetection", () => ({
  useVariableDetection: (content: string) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.add(match[1]);
    }
    return { detectedNames: Array.from(matches) };
  },
}));
```

### React Query
Utiliser le wrapper dans `src/test/utils.tsx` pour tous les tests de composants.

## Scripts disponibles

- `npm run test` - Lance les tests en mode watch
- `npm run test:ui` - Interface graphique pour les tests
- `npm run test:coverage` - Génère le rapport de couverture

## CI/CD

Les tests s'exécutent automatiquement via GitHub Actions sur chaque push et PR.

## Debugging

Pour débugger un test:
```bash
npm run test:ui
```

Puis ouvrir l'interface web pour inspecter les tests individuellement.

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Isolation**: Chaque test doit être indépendant
3. **Descriptif**: Noms de tests clairs et explicites (utiliser "devrait" en français)
4. **Minimal Mocking**: Mock uniquement ce qui est nécessaire
5. **Fast**: Les tests doivent s'exécuter rapidement
6. **Couverture complète**: Tester les cas nominaux ET les cas d'erreur
7. **Tests asynchrones**: Toujours utiliser `waitFor` pour les opérations async

## Tests du système de partage

### Tests de permissions
```bash
npm run test -- usePromptPermission
```

Vérifie que les permissions sont calculées correctement selon :
- La propriété du prompt
- Les partages privés
- Le partage public
- L'ordre de priorité (propriétaire > partage privé > partage public)

### Tests de l'interface de partage
```bash
npm run test -- SharePromptDialog
```

Vérifie que :
- Les partages sont affichés correctement
- Les ajouts/suppressions fonctionnent
- Les erreurs sont gérées
- Le bouton "Arrêter tous les partages" fonctionne

### Tests de détection de conflits
```bash
npm run test -- useConflictDetection
```

Vérifie que :
- Les conflits sont détectés automatiquement
- La vérification périodique fonctionne (toutes les 30 secondes)
- Le reset du conflit fonctionne
- La détection est désactivable

### Tests du composant d'alerte de conflit
```bash
npm run test -- ConflictAlert
```

Vérifie que :
- Le message de conflit est affiché
- Le bouton "Recharger" appelle le bon callback
- Le bouton "Continuer" est optionnel
- Le formatage de date fonctionne

## Exemples de tests complets

### Hook avec détection de pattern (useVariableDetection)
```typescript
describe("useVariableDetection", () => {
  it("devrait détecter une variable simple", () => {
    const content = "Hello {{name}}!";
    const { result } = renderHook(() => useVariableDetection(content));
    expect(result.current.detectedNames).toEqual(["name"]);
  });

  it("devrait détecter plusieurs variables", () => {
    const content = "Hello {{firstName}} {{lastName}}!";
    const { result } = renderHook(() => useVariableDetection(content));
    expect(result.current.detectedNames).toHaveLength(2);
    expect(result.current.detectedNames).toContain("firstName");
    expect(result.current.detectedNames).toContain("lastName");
  });

  it("ne devrait détecter qu'une seule fois les variables dupliquées", () => {
    const content = "{{name}} is {{name}} and {{name}}!";
    const { result } = renderHook(() => useVariableDetection(content));
    expect(result.current.detectedNames).toEqual(["name"]);
  });
});
```

### Hook avec état et notifications (useVariableManager)
```typescript
describe("useVariableManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait ajouter de nouvelles variables détectées", async () => {
    const { result } = renderHook(() =>
      useVariableManager({
        content: "Hello {{name}}!",
        initialVariables: [],
      })
    );

    act(() => {
      result.current.addVariablesFromContent();
    });

    await waitFor(() => {
      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("name");
    });
  });

  it("devrait supprimer les variables qui ne sont plus dans le contenu", async () => {
    const { result, rerender } = renderHook(
      ({ content }) => useVariableManager({ content, initialVariables: mockVars }),
      { initialProps: { content: "{{var1}} {{var2}}" } }
    );

    rerender({ content: "{{var1}}" }); // Supprimer var2

    await waitFor(() => {
      expect(result.current.variables).toHaveLength(1);
      expect(result.current.variables[0].name).toBe("var1");
    });
  });
});
```

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
