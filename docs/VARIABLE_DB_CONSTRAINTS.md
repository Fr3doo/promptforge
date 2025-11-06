# Contraintes de Validation Server-Side pour les Variables

## Vue d'Ensemble

La table `public.variables` applique des **contraintes au niveau de la base de données** pour garantir l'intégrité des données, même en cas de modification directe (scripts, clients tiers, bugs frontend).

Ces contraintes complètent les validations client-side (Zod) et edge function (analyze-prompt).

## Contraintes CHECK

| Contrainte | Description | Limite | Code Erreur |
|------------|-------------|--------|-------------|
| `variables_name_length` | Longueur du nom | 1-100 caractères | 23514 (check_violation) |
| `variables_name_format` | Format du nom | `[a-zA-Z0-9_]+` (pas de tirets) | 23514 |
| `variables_default_value_length` | Longueur de la valeur par défaut | ≤ 1000 caractères | 23514 |
| `variables_help_length` | Longueur du texte d'aide | ≤ 500 caractères | 23514 |
| `variables_pattern_length` | Longueur du pattern regex | ≤ 200 caractères | 23514 |

## Triggers de Validation

### 1. `validate_variable_options_trigger`

**Objectif** : Valider les options des variables de type ENUM.

**Règles** :
- Maximum 50 options par variable
- Chaque option ≤ 100 caractères

**Message d'erreur** :
- `"Le nombre d'options ne peut pas dépasser 50 (actuel: X)"`
- `"Chaque option ne peut pas dépasser 100 caractères"`

**Code** :
```sql
CREATE OR REPLACE FUNCTION public.validate_variable_options()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier le nombre d'options (≤ 50)
  IF NEW.options IS NOT NULL AND array_length(NEW.options, 1) > 50 THEN
    RAISE EXCEPTION 'Le nombre d''options ne peut pas dépasser 50 (actuel: %)', 
      array_length(NEW.options, 1)
    USING ERRCODE = '23514';
  END IF;

  -- Vérifier la longueur de chaque option (≤ 100 caractères)
  IF NEW.options IS NOT NULL THEN
    PERFORM 1
    FROM unnest(NEW.options) AS opt
    WHERE char_length(opt) > 100
    LIMIT 1;

    IF FOUND THEN
      RAISE EXCEPTION 'Chaque option ne peut pas dépasser 100 caractères'
      USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
```

### 2. `validate_variables_count_trigger`

**Objectif** : Limiter le nombre de variables par prompt.

**Règles** :
- Maximum 50 variables par prompt

**Message d'erreur** :
- `"Un prompt ne peut pas avoir plus de 50 variables (actuel: X)"`

**Code** :
```sql
CREATE OR REPLACE FUNCTION public.validate_variables_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Compter les variables existantes pour ce prompt
  SELECT COUNT(*) INTO current_count
  FROM public.variables
  WHERE prompt_id = NEW.prompt_id;

  -- Sur INSERT : vérifier si on dépasse la limite
  IF TG_OP = 'INSERT' AND current_count >= 50 THEN
    RAISE EXCEPTION 'Un prompt ne peut pas avoir plus de 50 variables (actuel: %)', 
      current_count
    USING ERRCODE = '23514';
  END IF;

  -- Sur UPDATE : vérifier si le prompt_id change et dépasse la limite
  IF TG_OP = 'UPDATE' AND NEW.prompt_id <> OLD.prompt_id THEN
    SELECT COUNT(*) INTO current_count
    FROM public.variables
    WHERE prompt_id = NEW.prompt_id;

    IF current_count >= 50 THEN
      RAISE EXCEPTION 'Un prompt ne peut pas avoir plus de 50 variables (actuel: %)', 
        current_count
      USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
```

## Gestion des Erreurs

Les erreurs de contraintes DB sont mappées vers des messages utilisateur dans `src/lib/errorHandler.ts` :

```typescript
const ERROR_PATTERN_MESSAGES = [
  // Variables validation constraints
  { pattern: 'variables_name_length', message: 'Le nom de la variable ne peut pas dépasser 100 caractères' },
  { pattern: 'variables_name_format', message: 'Le nom de la variable ne peut contenir que des lettres, chiffres et underscores' },
  { pattern: 'variables_default_value_length', message: 'La valeur par défaut ne peut pas dépasser 1000 caractères' },
  { pattern: 'variables_help_length', message: "Le texte d'aide ne peut pas dépasser 500 caractères" },
  { pattern: 'variables_pattern_length', message: 'Le pattern ne peut pas dépasser 200 caractères' },
  { pattern: "nombre d'options ne peut pas dépasser", message: "Le nombre d'options ne peut pas dépasser 50" },
  { pattern: 'option ne peut pas dépasser 100', message: 'Chaque option ne peut pas dépasser 100 caractères' },
  { pattern: 'ne peut pas avoir plus de 50 variables', message: 'Un prompt ne peut pas avoir plus de 50 variables' },
  // ...
];
```

## Synchronisation avec Frontend

Les limites sont **synchronisées** avec `src/constants/validation-limits.ts` :

```typescript
export const VARIABLE_LIMITS = {
  MAX_COUNT: 50,
  NAME: { MIN: 1, MAX: 100 },
  DESCRIPTION: { MAX: 500 },
  DEFAULT_VALUE: { MAX: 1000 },
  PATTERN: { MAX: 200 },
  OPTIONS: { MAX_COUNT: 50, MAX_LENGTH: 100 },
};
```

## Migration des Données Existantes

**État avant migration** (vérification effectuée) :
- 48 variables totales dans la base
- **0 violation de contrainte détectée**
- Migration **sans risque** ✅

**Requête de vérification utilisée** :
```sql
SELECT 
  COUNT(*) FILTER (WHERE char_length(name) > 100) as name_too_long,
  COUNT(*) FILTER (WHERE name !~ '^[a-zA-Z0-9_]+$') as name_invalid_format,
  COUNT(*) FILTER (WHERE char_length(COALESCE(default_value, '')) > 1000) as default_too_long,
  COUNT(*) FILTER (WHERE char_length(COALESCE(help, '')) > 500) as help_too_long,
  COUNT(*) FILTER (WHERE char_length(COALESCE(pattern, '')) > 200) as pattern_too_long,
  COUNT(*) FILTER (WHERE array_length(options, 1) > 50) as too_many_options
FROM public.variables;
```

## Tests

Les contraintes sont testées dans :

### Tests Unitaires (`src/repositories/__tests__/VariableRepository.test.ts`)

```typescript
describe('Database constraint validation', () => {
  // Tests pour contraintes de nom
  it('should reject variable with name > 100 characters');
  it('should reject variable with invalid name format (spaces)');
  it('should reject variable with invalid name format (hyphens)');
  
  // Tests pour contraintes de longueur
  it('should reject variable with default_value > 1000 characters');
  it('should reject variable with help > 500 characters');
  it('should reject variable with pattern > 200 characters');
  
  // Tests pour contraintes d'options
  it('should reject variable with > 50 options');
  it('should reject variable with option > 100 characters');
  
  // Tests pour contrainte de nombre
  it('should reject creating > 50 variables for a prompt');
});
```

### Tests Manuels SQL

Des scripts SQL de test complets sont disponibles pour valider chaque contrainte directement dans Supabase SQL Editor. Consultez la Phase 4.1 du plan d'implémentation.

## Points d'Attention

### 1. Format du Nom de Variable

**⚠️ Importante différence de regex** :
- **Frontend** (`src/lib/validation.ts`): `/^[a-zA-Z0-9_]+$/` (pas de tirets)
- **Edge Function** (`analyze-prompt`): `/^[a-zA-Z0-9_-]+$/` (tirets autorisés)
- **Base de données**: `^[a-zA-Z0-9_]+$` (pas de tirets - aligné sur frontend)

**Impact** : Si l'edge function `analyze-prompt` génère des noms avec tirets, ils seront rejetés par la DB. La fonction doit sanitizer les tirets en les remplaçant par des underscores.

**Recommandation** : Vérifier et corriger `analyze-prompt/index.ts` :
```typescript
structured.variables.forEach((v: any) => {
  v.name = v.name.replace(/-/g, '_');  // Remplacer tirets par underscores
});
```

### 2. Limitation Race Condition

Le trigger `validate_variables_count_trigger` vérifie le nombre de variables **avant** l'insertion. Dans le cas (rare) d'insertions parallèles dans une même transaction, une race condition théorique pourrait permettre de dépasser la limite.

**Probabilité** : Très faible (requiert transactions concurrentes exactement synchronisées).

**Impact** : Faible (maximum 1-2 variables de plus que la limite).

**Solution si nécessaire** : Utiliser un trigger `AFTER INSERT` avec contrainte différée.

## Maintenance

**Pour ajouter une nouvelle contrainte** :
1. Créer une migration SQL avec la contrainte/trigger
2. Ajouter un message d'erreur dans `src/constants/messages.ts` → `errors.database`
3. Ajouter un pattern dans `ERROR_PATTERN_MESSAGES` de `src/lib/errorHandler.ts`
4. Ajouter des tests dans `src/repositories/__tests__/VariableRepository.test.ts`
5. Mettre à jour cette documentation

**Pour modifier une limite existante** :
1. Mettre à jour `src/constants/validation-limits.ts`
2. Créer une migration SQL pour modifier la contrainte
3. Mettre à jour les tests unitaires
4. Vérifier les données existantes pour détecter les violations potentielles
5. Mettre à jour cette documentation

## Historique

| Date | Version | Changement |
|------|---------|------------|
| 2025-01-06 | 1.0 | Implémentation initiale avec 5 contraintes CHECK + 2 triggers |

## Références

- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/database-linter)
- `docs/VARIABLE_UPSERT_SECURITY.md` : Documentation sur la sécurité des opérations upsert
