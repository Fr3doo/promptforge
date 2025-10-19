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
import { renderHook } from "@testing-library/react";

it("returns expected value", () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe(expected);
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
3. **Descriptif**: Noms de tests clairs et explicites
4. **Minimal Mocking**: Mock uniquement ce qui est nécessaire
5. **Fast**: Les tests doivent s'exécuter rapidement

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
