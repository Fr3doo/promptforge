# Système de Validation Modulaire

## Principe OCP (Open/Closed Principle)

Le système de validation est **ouvert à l'extension** (ajout de nouveaux validateurs) mais **fermé à la modification** (pas besoin de modifier le code existant).

## Architecture

### Types de Base

- **`Validator<T>`** : Interface pour un validateur (1 règle = 1 validateur)
- **`ValidationContext`** : Métadonnées pour validations contextuelles
- **`ValidationResult`** : Résultat d'une validation
- **`CompositeValidationResult`** : Résultat d'une composition de validateurs

### Validateurs Disponibles

| Validateur | Usage |
|------------|-------|
| `createZodValidator` | Adaptateur pour schémas Zod existants |
| `createRequiredValidator` | Champs obligatoires |
| `createLengthValidator` | Contraintes de longueur |
| `createUniqueValidator` | Unicité dans une liste |
| `createConditionalValidator` | Validations conditionnelles |
| `createAsyncValidator` | Validations asynchrones (API, DB) |

### Presets

- **`promptValidators`** : Validateurs pour prompts
- **`tagValidators`** : Validateurs pour tags
- **`variableValidators`** : Validateurs pour variables (à venir)

## Utilisation

### Exemple Simple : Validation avec preset

```typescript
import { useFormValidation } from "@/features/prompts/hooks/useFormValidation";

function MyForm() {
  const { validationErrors, validate, isFormValid } = useFormValidation(formData);
  
  // Utilise automatiquement les validateurs par défaut
}
```

### Exemple Avancé : Validateurs Custom

```typescript
import { useFormValidation } from "@/features/prompts/hooks/useFormValidation";
import { createRequiredValidator } from "@/features/prompts/validation/validators/required-field-validator";
import { createAsyncValidator } from "@/features/prompts/validation/validators/async-validator";

function MyForm() {
  const customValidators = {
    title: [
      // Ajouter une validation custom : titre unique en DB
      createAsyncValidator(
        "unique-title",
        async (title) => {
          const exists = await checkTitleExists(title);
          return !exists;
        },
        "Un prompt avec ce titre existe déjà"
      ),
    ],
  };
  
  const { validationErrors, validate } = useFormValidation(formData, {
    customValidators,
  });
}
```

### Exemple Expert : Validation Conditionnelle

```typescript
import { createConditionalValidator } from "@/features/prompts/validation/validators/conditional-validator";
import { createRequiredValidator } from "@/features/prompts/validation/validators/required-field-validator";

// Description obligatoire SI le prompt est public
const descriptionRequired = createConditionalValidator(
  "description-if-public",
  (context) => context?.formData?.visibility === "SHARED",
  createRequiredValidator("description", "La description est requise pour les prompts publics")
);

const { validationErrors } = useFormValidation(formData, {
  customValidators: {
    description: [descriptionRequired],
  },
  context: { formData }, // Passer formData pour la condition
});
```

## Création de Validateurs Custom

### Validateur Synchrone

```typescript
import type { Validator } from "@/features/prompts/validation/types";

const myValidator: Validator<string> = {
  name: "my-custom-validator",
  priority: 5,
  validate: (value) => {
    if (value.includes("forbidden")) {
      return {
        isValid: false,
        error: "Mot interdit détecté",
        field: "content",
      };
    }
    return { isValid: true };
  },
};
```

### Validateur Asynchrone

```typescript
import { createAsyncValidator } from "@/features/prompts/validation/validators/async-validator";

const uniqueTitleValidator = createAsyncValidator(
  "unique-title",
  async (title: string) => {
    const { data } = await supabase
      .from("prompts")
      .select("id")
      .eq("title", title)
      .single();
    
    return !data; // true si titre unique
  },
  "Un prompt avec ce titre existe déjà",
  { debounceMs: 500 } // Debounce pour limiter les appels API
);
```

## Priorité des Validateurs

Les validateurs s'exécutent par ordre de priorité (1 = haute, 10 = basse) :

1. **Champs requis** (priority: 1, stopOnFailure: true)
2. **Format Zod** (priority: 2-3)
3. **Unicité** (priority: 4)
4. **Conditionnels** (priority: 5-7)
5. **Asynchrones** (priority: 8-10)

## Tests

Voir :
- `src/features/prompts/validation/__tests__/validators.test.ts`
- `src/features/prompts/validation/__tests__/composition.test.ts`

## Bénéfices

- ✅ **OCP** : Extensible sans modifier le code
- ✅ **SRP** : 1 validateur = 1 responsabilité
- ✅ **Réutilisable** : Validateurs indépendants du contexte
- ✅ **Testable** : Tests unitaires isolés
- ✅ **Type-safe** : TypeScript générique
- ✅ **Performance** : Priorité + stopOnFailure pour optimisation
