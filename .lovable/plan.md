
# Plan : Documentation DRY et Analyse des duplications restantes

## Partie 1 : Documentation des nouveaux modules dans SOLID_COMPLIANCE.md

### Ajouts à la section SRP (Extractions)

Ajouter dans le tableau des phases SRP :

| Phase | Sévérité | Extraction | Fichier |
|-------|----------|------------|---------|
| DRY.1 | 🟢 Transverse | requireId, requireIds | `src/lib/validation/requireId.ts` |
| DRY.2 | 🟢 Transverse | variableMappers | `src/lib/variables/variableMappers.ts` |

### Nouvelle section : Principe DRY - Centralisation des opérations récurrentes

```markdown
## 6. DRY - Don't Repeat Yourself

> "Chaque connaissance doit avoir une représentation unique, non ambiguë, au sein d'un système."

### Etat : Conforme

### Modules de centralisation

#### 6.1 Validation d'ID : requireId.ts

**Fichier** : `src/lib/validation/requireId.ts`

**Probleme resolu** : 18+ occurrences du pattern `if (!id) throw new Error("... requis")` dans repositories et services.

**API** :
- `requireId(value, fieldName)` : Valide un ID string, retourne la valeur (type narrowing)
- `requireIds(values, fieldName)` : Valide un tableau non vide
- `RequiredIdError` : Classe d'erreur pour filtrage

**Pattern d'utilisation** :
// Avant (repetitif)
if (!userId) throw new Error("ID utilisateur requis");
await repository.fetchById(userId);

// Apres (DRY + type narrowing)
const validId = requireId(userId, "ID utilisateur");
await repository.fetchById(validId); // validId: string garanti

**Fichiers migres** :
- VersionRepository (3 occurrences)
- PromptCommandRepository (3 occurrences)
- PromptQueryRepository (7 occurrences)
- ProfileRepository (2 occurrences)
- PromptDuplicationService (1 occurrence)
- PromptImportService (1 occurrence)
- usePrompts (1 occurrence)
- usePromptShares (1 occurrence)

#### 6.2 Mapping de variables : variableMappers.ts

**Fichier** : `src/lib/variables/variableMappers.ts`

**Probleme resolu** : Duplication de logique de transformation entre `PromptDuplicationService.mapVariablesForDuplication()` et `PromptImportService.mapVariablesForImport()`.

**API** :
- `toVariableUpsertInput(variable)` : Transforme Variable -> VariableUpsertInput (pour duplication)
- `toVariableUpsertInputs(variables)` : Version tableau
- `fromImportable(variable, index)` : Transforme ImportableVariable -> VariableUpsertInput (avec defaults)
- `fromImportables(variables)` : Version tableau avec order_index sequentiel

**Separation des responsabilites** :
- `toVariableUpsertInput` : Copie directe des champs metier (duplication)
- `fromImportable` : Applique des valeurs par defaut (import JSON/Markdown)

**Services migres** :
- PromptDuplicationService : suppression methode privee mapVariablesForDuplication
- PromptImportService : suppression methode privee mapVariablesForImport
```

### Mise à jour de l'historique des validations

Ajouter une nouvelle ligne :

| Date | Validation | Changements |
|------|------------|-------------|
| 2025-01 | DRY Phase 1 | Centralisation requireId (18 occurrences), variableMappers (2 services) |

---

## Partie 2 : Analyse des duplications restantes

### Duplication 1 : Vérification d'authentification dans les hooks (PRIORITE MOYENNE)

**Pattern identifie** : `if (!user) throw new Error("...")` repete 9 fois dans 3 fichiers

**Fichiers concernes** :
- `usePrompts.ts` : 5 occurrences (usePrompts, useOwnedPrompts, useSharedWithMePrompts, useCreatePrompt, useDuplicatePrompt)
- `usePromptShares.ts` : 3 occurrences
- `useDashboard.ts` : 1 occurrence

**Messages d'erreur inconsistants** :
- "Utilisateur non authentifie"
- "Non authentifie"
- "SESSION_EXPIRED"
- "User not authenticated"

**Solution proposee** : Creer `requireAuthUser(user, context?)` dans `src/lib/validation/requireAuth.ts`

```typescript
export class AuthRequiredError extends Error {
  constructor(context?: string) {
    super(context ? `${context}: authentification requise` : "Authentification requise");
    this.name = "AuthRequiredError";
  }
}

export function requireAuthUser<T extends { id: string }>(
  user: T | null | undefined, 
  context?: string
): T {
  if (!user) throw new AuthRequiredError(context);
  return user;
}
```

**Impact** : 9 occurrences -> 0, messages uniformises

---

### Duplication 2 : Pattern onSuccess/onError dans mutations (PRIORITE BASSE)

**Pattern identifie** : Structure repetitive dans useMutation callbacks

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["prompts"] });
  successToast(messages.success.xxx);
},
onError: (error) => {
  errorToast(messages.labels.error, getSafeErrorMessage(error));
},
```

**Occurrences** : 12+ dans usePrompts.ts, useVersions.ts, usePromptShares.ts, useVariables.ts

**Risque de refactoring** : MODERE - Le pattern est similaire mais pas identique (queryKeys differents, messages differents)

**Solution proposee** : NON RECOMMANDE pour l'instant
- Les differences entre callbacks sont significatives
- Abstraire ajouterait de la complexite sans gain majeur
- Preferer la consistance manuelle

---

### Duplication 3 : queryClient.invalidateQueries patterns (PRIORITE BASSE)

**Pattern identifie** : Certaines mutations invalident plusieurs queries avec pattern repetitif

```typescript
// useVersions.ts - repete 3 fois
queryClient.invalidateQueries({ queryKey: ["versions", promptId] });
queryClient.invalidateQueries({ queryKey: ["prompts", promptId] });
queryClient.invalidateQueries({ queryKey: ["prompts"] });
```

**Solution potentielle** : Creer `invalidatePromptRelated(queryClient, promptId)`

**Recommandation** : REPORTER - Impact faible, risque de sur-abstraction

---

### Duplication 4 : Import toastUtils deprecated (PRIORITE MOYENNE)

**Constat** : `src/lib/toastUtils.ts` est marque `@deprecated` mais encore utilise dans 6 fichiers

**Fichiers utilisant encore toastUtils** :
- `usePrompts.ts` : successToast, errorToast
- `PromptAnalyzer.tsx` : successToast, errorToast
- `ExportActions.tsx` : successToast
- `MobileExportActions.tsx` : successToast
- `useLowQuotaNotification.ts` : warningToast

**Solution proposee** : Migrer vers `usePromptMessages()` ou creer des hooks specialises par domaine

---

## Synthese et priorisation

| Duplication | Priorite | Impact DRY | Effort | Recommandation |
|-------------|----------|------------|--------|----------------|
| Verification auth hooks | Moyenne | -9 occurrences | Faible | Implementer requireAuthUser |
| toastUtils deprecated | Moyenne | Consistance | Moyen | Migrer progressivement |
| onSuccess/onError pattern | Basse | Lisibilite | Eleve | Reporter |
| invalidateQueries pattern | Basse | -6 lignes | Faible | Reporter |

---

## Plan d'action recommande

### Court terme (immediate)
1. Mettre a jour `docs/SOLID_COMPLIANCE.md` avec la documentation des modules DRY
2. Ajouter une reference dans `docs/SRP_REFACTORING_SUMMARY.md`

### Moyen terme (prochaine iteration)
3. Creer `requireAuthUser` pour uniformiser les verifications d'authentification
4. Migrer les usages de toastUtils deprecated vers hooks specialises

### Long terme (si necessaire)
5. Evaluer l'abstraction des patterns invalidateQueries si la complexite augmente

---

## Fichiers a modifier

| Fichier | Action |
|---------|--------|
| `docs/SOLID_COMPLIANCE.md` | Ajouter section DRY + modules requireId et variableMappers |
| `docs/SRP_REFACTORING_SUMMARY.md` | Ajouter reference aux extractions DRY |
| `.lovable/plan.md` | Archiver le plan DRY execute |

---

## Metriques DRY actuelles

| Metrique | Avant | Apres | Amelioration |
|----------|-------|-------|--------------|
| Occurrences `if (!id) throw` dans repos/services | 18+ | 0 | -100% |
| Methodes de mapping dupliquees | 2 | 0 | -100% |
| Fonctions pures dans lib/ | 19 | 25 | +32% |
| Tests unitaires modules utilitaires | 12 | 39 | +225% |
| Occurrences `if (!user) throw` dans hooks | 9 | 9 | A traiter |
