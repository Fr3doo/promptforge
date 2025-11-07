# Documentation : Sanitization des Noms de Variables

## 📋 Contexte

Ce document explique la logique de sanitization automatique des noms de variables dans la fonction edge `analyze-prompt`, implémentée pour résoudre un conflit entre les formats acceptés par l'IA et les contraintes de la base de données.

---

## 🎯 Problème Identifié

### Regex AI vs. Contrainte DB

Il existe une **incompatibilité de format** entre deux systèmes de validation :

| Système | Pattern | Accepte les tirets ? |
|---------|---------|---------------------|
| **AI Regex** (`VARIABLE_NAME_AI_REGEX`) | `/^[a-zA-Z0-9_-]+$/` | ✅ Oui |
| **DB Constraint** (`variables_name_format`) | `CHECK (name ~ '^[a-zA-Z0-9_]+$')` | ❌ Non |

### Conséquence

Sans sanitization, l'edge function `analyze-prompt` peut générer des variables avec des tirets (ex: `user-name`, `api-key`) qui sont **rejetées par la base de données** lors de l'insertion :

```sql
ERROR: new row for relation "variables" violates check constraint "variables_name_format"
DETAIL: Failing row contains (uuid, prompt_id, user-name, ...)
```

---

## ✅ Solution Implémentée

### Fonction `sanitizeVariableNames`

**Localisation** : `supabase/functions/analyze-prompt/index.ts` (lignes 171-193)

**Responsabilité** : Remplacer automatiquement tous les tirets (`-`) par des underscores (`_`) dans les noms de variables générés par l'IA.

```typescript
function sanitizeVariableNames(variables: any[]): any[] {
  if (!variables || !Array.isArray(variables)) return variables;
  
  return variables.map(v => {
    if (v.name && typeof v.name === 'string') {
      const originalName = v.name;
      const sanitizedName = v.name.replace(/-/g, '_');
      
      // Log uniquement si une modification a été faite
      if (originalName !== sanitizedName) {
        console.log(`[SANITIZE] Variable renommée: "${originalName}" → "${sanitizedName}"`);
      }
      
      return { ...v, name: sanitizedName };
    }
    return v;
  });
}
```

### Point d'Intégration

La sanitization est appelée **après la validation de la structure AI** et **avant la génération des exports** :

```typescript
// Ligne 498-503 dans analyze-prompt/index.ts
validateAIResponse(structured);
console.log(`Validation réussie (${structured.variables?.length || 0} variables)`);

// 6.1 Sanitize variable names (DB constraint compliance)
structured.variables = sanitizeVariableNames(structured.variables);

// 7. Generate exports...
```

---

## 🔍 Exemples de Transformation

| Nom Original (AI) | Nom Sanitizé (DB) |
|-------------------|-------------------|
| `user-name` | `user_name` |
| `api-key` | `api_key` |
| `very-long-variable-name` | `very_long_variable_name` |
| `username` | `username` _(inchangé)_ |
| `api_key` | `api_key` _(inchangé)_ |
| `-leading` | `_leading` |
| `trailing-` | `trailing_` |

---

## 🧪 Tests Unitaires

**Fichier** : `supabase/functions/analyze-prompt/sanitize.test.ts`

### Couverture de Tests

1. ✅ **Remplacement basique** : `user-name` → `user_name`
2. ✅ **Tirets multiples** : `very-long-var` → `very_long_var`
3. ✅ **Non-régression** : Variables sans tirets restent inchangées
4. ✅ **Préservation des propriétés** : `type`, `description`, `default_value`, `options` conservés
5. ✅ **Edge cases** : Tableau vide, `null`, `undefined`, tirets en début/fin
6. ✅ **Immutabilité** : Le tableau d'entrée n'est pas modifié

### Lancer les Tests

```bash
cd supabase/functions/analyze-prompt
deno test sanitize.test.ts
```

**Résultat attendu** : 11 tests passent ✅

---

## 📝 Workflow Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur envoie un prompt à analyze-prompt           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Lovable AI génère des variables (peut inclure tirets)   │
│    Exemple: user-name, api-key                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. validateAIResponse() vérifie la structure               │
│    ✅ Accepte user-name (VARIABLE_NAME_AI_REGEX OK)        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. sanitizeVariableNames() transforme les noms             │
│    user-name → user_name                                    │
│    api-key → api_key                                        │
│    [SANITIZE] Logs si transformation                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Génération des exports (JSON + Markdown)                │
│    Variables sanitizées incluses                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend sauvegarde les variables dans la DB            │
│    ✅ Respecte CHECK constraint (aucun tiret)              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### Regex AI (Edge Function)

**Fichier** : `supabase/functions/analyze-prompt/index.ts` (ligne 32)

```typescript
const VARIABLE_NAME_AI_REGEX = /^[a-zA-Z0-9_-]+$/;
```

**Pourquoi accepter les tirets ?**
- L'IA génère naturellement des noms avec tirets (convention kebab-case)
- Permettre les tirets en validation AI évite des erreurs prématurées
- La sanitization garantit la conformité DB en aval

### Contrainte DB

**Fichier** : `supabase/migrations/20251106101600_b7e3803b-7ef3-4923-a303-eeac8d693e3d.sql`

```sql
ALTER TABLE public.variables
ADD CONSTRAINT variables_name_format
CHECK (name ~ '^[a-zA-Z0-9_]+$');
```

**Pourquoi refuser les tirets ?**
- Conformité avec les conventions snake_case/camelCase
- Évite les ambiguïtés dans les templates (`{{user-name}}` vs `{{user_name}}`)
- Aligne avec le regex frontend (`VARIABLE_NAME_REGEX` dans `validation-limits.ts`)

### Regex Frontend

**Fichier** : `src/constants/regex-patterns.ts`

```typescript
export const VARIABLE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
```

**Différence importante** : Le frontend **n'accepte PAS les tirets** dès la saisie manuelle.

---

## 🔄 Synchronisation des Formats

| Système | Regex | Tirets | Rationale |
|---------|-------|--------|-----------|
| **Frontend Manual** | `/^[a-zA-Z][a-zA-Z0-9_]*$/` | ❌ | Saisie utilisateur guidée |
| **AI Validation** | `/^[a-zA-Z0-9_-]+$/` | ✅ | IA peut générer tirets |
| **Sanitization** | `replace(/-/g, '_')` | 🔄 | Conversion automatique |
| **DB Constraint** | `^[a-zA-Z0-9_]+$` | ❌ | Format final strict |

---

## 📊 Logs de Sanitization

Les transformations sont loggées dans les **Supabase Edge Function Logs** :

```
[SANITIZE] Variable renommée: "user-name" → "user_name"
[SANITIZE] Variable renommée: "api-key" → "api_key"
```

**Accès aux logs** :
1. Ouvrir Lovable Cloud Backend
2. Edge Functions → `analyze-prompt` → Logs
3. Rechercher `[SANITIZE]`

---

## 🚨 Points d'Attention

### 1. Collision Potentielle de Noms

**Scénario** : L'IA génère `user-name` ET `user_name` dans le même prompt

**Conséquence** : Après sanitization, les deux deviennent `user_name` → **Violation de contrainte UNIQUE**

**Mitigation actuelle** : 
- La contrainte `variables_prompt_id_name_key` (UNIQUE sur `prompt_id + name`) bloque l'insertion
- L'utilisateur reçoit une erreur explicite

**Amélioration future** : 
- Détecter les collisions post-sanitization dans `validateAIResponse()`
- Ajouter un suffixe (`user_name_1`, `user_name_2`) ou rejeter l'analyse

### 2. Synchronisation avec le Prompt Template

**Problème** : Le `prompt_template` généré par l'IA peut encore contenir `{{user-name}}` alors que la variable est renommée `user_name`.

**Solution actuelle** : 
- Le frontend utilise `useVariableDetection` qui détecte les `{{}}` dans le template
- Les noms sanitizés sont utilisés pour la substitution

**Vérification à faire** :
- Tester que `{{user-name}}` dans le template est bien remplacé par la valeur de `user_name`
- Si non, implémenter une sanitization du template également

### 3. Markdown Export

Le markdown généré inclut les noms **après sanitization** :

```markdown
### {{user_name}}
- **Type:** STRING
- **Description:** Nom de l'utilisateur
```

**Cohérence** : ✅ Le markdown reflète les noms tels qu'enregistrés en DB

---

## 🛠️ Maintenance

### Modifier la Logique de Sanitization

Si d'autres caractères doivent être sanitizés (ex: espaces, accents), modifier :

```typescript
// Ligne 182 dans analyze-prompt/index.ts
const sanitizedName = v.name
  .replace(/-/g, '_')    // Tirets → underscores
  .replace(/\s+/g, '_')  // Espaces → underscores (exemple)
  .toLowerCase();        // Minuscules (exemple)
```

### Ajouter des Tests

Créer de nouveaux tests dans `sanitize.test.ts` :

```typescript
Deno.test("sanitizeVariableNames - caractères spéciaux", () => {
  const input = [{ name: "user name", type: "STRING" }];
  const result = sanitizeVariableNames(input);
  assertEquals(result[0].name, "user_name");
});
```

---

## 📚 Références

- **Contraintes DB** : `docs/VARIABLE_DB_CONSTRAINTS.md`
- **Validation Frontend** : `src/constants/validation-limits.ts`
- **Edge Function** : `supabase/functions/analyze-prompt/index.ts`
- **Tests** : `supabase/functions/analyze-prompt/sanitize.test.ts`
- **Error Handling** : `src/lib/errorHandler.ts`

---

## 🎓 Conclusion

La sanitization automatique des tirets permet de **concilier la flexibilité de l'IA** (qui génère naturellement des formats variés) avec les **contraintes strictes de la base de données** (qui garantissent la cohérence des données).

Cette approche évite :
- ❌ Des erreurs d'insertion cryptiques pour l'utilisateur final
- ❌ Une complexification de la regex AI (qui limiterait les capacités de l'IA)
- ❌ Un assouplissement des contraintes DB (qui réduirait la qualité des données)

Et permet :
- ✅ Une expérience utilisateur fluide (analyse + sauvegarde sans erreur)
- ✅ Une séparation des responsabilités (AI génère, sanitization normalise, DB valide)
- ✅ Une traçabilité complète (logs `[SANITIZE]` pour débugger)
