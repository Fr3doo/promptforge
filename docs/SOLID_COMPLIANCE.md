# Conformité SOLID - État du projet PromptForge

> Documentation de l'architecture SOLID du projet, des patterns utilisés et des améliorations potentielles.

## Vue d'ensemble

| Principe | État | Conformité |
|----------|------|------------|
| **SRP** - Single Responsibility | ✅ Conforme | 100% |
| **OCP** - Open/Closed | ✅ Conforme | 100% |
| **LSP** - Liskov Substitution | ✅ Conforme | 100% |
| **ISP** - Interface Segregation | ✅ Conforme | 100% |
| **DIP** - Dependency Inversion | ✅ Conforme | 100% |

---

## 1. SRP - Single Responsibility Principle

> "Une classe ne devrait avoir qu'une seule raison de changer."

### État : ✅ Conforme

### Justification architecturale

#### Refactoring usePromptSave

Le hook `usePromptSave` a été décomposé en 7 hooks spécialisés :

| Hook | Responsabilité unique |
|------|----------------------|
| `usePromptValidation` | Validation Zod des données du formulaire |
| `usePromptPermissionCheck` | Vérification des droits d'accès utilisateur |
| `useConflictHandler` | Détection des conflits (optimistic locking) |
| `usePromptMutations` | Opérations CRUD avec notifications |
| `useInitialVersionCreator` | Création de la version initiale 1.0.0 |
| `usePromptSaveErrorHandler` | Classification et affichage des erreurs |
| `useRetryCounter` | Limitation des tentatives de retry (Loi de Murphy) |

**Métriques d'amélioration :**
- Avant : ~251 lignes, complexité cyclomatique >15
- Après : ~90 lignes, composition de hooks ciblés

#### Séparation Query/Command/Mutation

Les repositories sont séparés selon le pattern CQS (Command Query Separation) :

```
SupabasePromptQueryRepository   → 8 méthodes de lecture
SupabasePromptCommandRepository → 3 méthodes d'écriture (create, update, delete)
```

#### Services métier isolés

Chaque service a une responsabilité unique :

| Service | Responsabilité |
|---------|---------------|
| `TemplateInitializationService` | Initialisation des templates pour nouveaux utilisateurs |
| `PromptDuplicationService` | Duplication de prompts avec leurs variables |
| `PromptFavoriteService` | Gestion de l'état favori |
| `PromptVisibilityService` | Changement de visibilité (PRIVATE/SHARED) |
| `PromptImportService` | Import de prompts depuis JSON/Markdown |
| `VersionDeletionService` | Suppression cascade de versions avec mise à jour prompt |

#### Extractions SRP - Phases 1, 2 et 3

Le projet a subi un refactoring SRP systématique en 3 phases :

| Phase | Sévérité | Extraction | Fichier |
|-------|----------|------------|---------|
| 1.1 | 🔴 Haute | VariableDiffCalculator | `src/repositories/variable/VariableDiffCalculator.ts` |
| 1.2 | 🔴 Haute | VersionDeletionService | `src/services/VersionDeletionService.ts` |
| 1.3 | 🔴 Haute | TemplateInitializationService (décomposition) | `src/services/TemplateInitializationService.ts` |
| 2.1 | 🟠 Moyenne | AnalysisErrorClassifier | `src/lib/analysis/AnalysisErrorClassifier.ts` |
| 2.2 | 🟠 Moyenne | ShareJoinResultMapper | `src/lib/mappers/ShareJoinResultMapper.ts` |
| 2.3 | 🟠 Moyenne | Encapsulation VersionRepository | `PromptMutationRepository.updateVersion` |
| 2.4 | 🟠 Moyenne | ShareAuthorizationChecker | `src/lib/authorization/ShareAuthorizationChecker.ts` |
| 3.1 | 🟡 Faible | useCountdown | `src/hooks/useCountdown.ts` |
| 3.2 | 🟡 Faible | variableFilters | `src/lib/variables/variableFilters.ts` |

**Patterns établis :**
- **Classifier** : Fonctions pures pour classification d'erreurs
- **Mapper** : Fonctions pures pour transformation de données
- **Checker** : Fonctions assertion pour autorisation
- **Hook réutilisable** : Logique React encapsulée

### Pattern appliqué

```typescript
// ❌ Avant : Hook monolithique
function usePromptSave() {
  // Validation + Permission + Conflict + Mutation + Error handling
  // 251 lignes, difficile à tester
}

// ✅ Après : Composition de hooks spécialisés
function usePromptSave() {
  const { validate } = usePromptValidation();
  const { checkPermission } = usePromptPermissionCheck();
  const { checkConflict } = useConflictHandler();
  const { createPrompt, updatePrompt } = usePromptMutations();
  const { handleError } = usePromptSaveErrorHandler();
  // Orchestration simple ~80 lignes
}
```

---

## 2. OCP - Open/Closed Principle

> "Les entités logicielles doivent être ouvertes à l'extension, fermées à la modification."

### État : ✅ Conforme

### Justification architecturale

#### Schémas Zod extensibles

```typescript
// Ajouter une règle de validation = modifier uniquement le schéma
const promptSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  // Ajouter un nouveau champ ici sans modifier le code consommateur
});
```

#### Système de validation modulaire

Les validateurs sont composables via `compose()` :

```typescript
// src/features/prompts/validation/compose.ts
const titleValidator = compose(
  requiredField("title"),
  lengthValidator({ min: 1, max: 100 })
);

// Extension : ajouter un nouveau validateur sans modifier les existants
const enhancedTitleValidator = compose(
  titleValidator,
  customPatternValidator(/^[A-Z]/) // Nouveau validateur
);
```

#### Pattern Repository

Nouvelles sources de données = nouvelle implémentation sans modifier le code consommateur :

```typescript
// Production
const repository = new SupabasePromptQueryRepository();

// Tests
const repository = createMockPromptQueryRepository();

// Future : autre backend
const repository = new FirebasePromptQueryRepository();
```

Le code métier (hooks, services) dépend des **interfaces**, pas des implémentations.

---

## 3. LSP - Liskov Substitution Principle

> "Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme."

### État : ✅ Conforme

### Justification architecturale

#### Pattern d'injection via Context

Toutes les implémentations sont substituables :

```typescript
// Production : instanciation par défaut
<PromptQueryRepositoryProvider>
  <App />
</PromptQueryRepositoryProvider>

// Tests : injection de mock
<PromptQueryRepositoryProvider repository={mockRepository}>
  <ComponentUnderTest />
</PromptQueryRepositoryProvider>
```

#### Interfaces sans héritage

Le projet utilise des **interfaces TypeScript** plutôt que des classes abstraites, minimisant les risques de violation LSP.

#### Documentation des préconditions

Toutes les interfaces de la couche données documentent leurs contrats via `@throws` :

| Interface | Méthodes documentées | Couverture |
|-----------|---------------------|------------|
| `PromptQueryRepository` | 8 méthodes | ✅ 100% |
| `PromptCommandRepository` | 3 méthodes | ✅ 100% |
| `PromptMutationRepository` | 1 méthode | ✅ 100% |
| `VersionRepository` | 7 méthodes | ✅ 100% |
| `AuthRepository` | 6 méthodes | ✅ 100% |
| `ProfileRepository` | 2 méthodes | ✅ 100% |
| `VariableRepository` | 5 méthodes | ✅ 100% |
| `AnalysisRepository` | 1 méthode | ✅ 100% |
| `PasswordCheckRepository` | 2 méthodes | ✅ 100% |
| `EdgeFunctionRepository` | 2 méthodes | ✅ 100% |
| `PromptShareRepository` | 7 méthodes | ✅ 100% |
| `PromptUsageRepository` | 1 méthode | ✅ 100% |
| `VariableSetRepository` | 1 méthode | ✅ 100% |

**Total : 46 méthodes documentées avec préconditions, postconditions et exceptions.**

#### Script de validation automatique

Un script `scripts/validate-lsp-annotations.ts` vérifie automatiquement que toutes les interfaces de repository ont des annotations `@throws` documentées :

```bash
npx ts-node scripts/validate-lsp-annotations.ts
```

Sortie attendue :
```
🔍 Validation des annotations @throws LSP

📋 Couverture par interface:

   Interface                          | Méthodes | Couverture
   -----------------------------------|----------|------------
   ✅ PromptQueryRepository            |        8 |     100.0%
   ✅ PromptCommandRepository          |        3 |     100.0%
   ...

📊 Résumé de la couverture LSP:

   Total méthodes: 46
   Documentées:    46
   Manquantes:     0
   Couverture:     100.0%

✅ Toutes les interfaces sont correctement documentées!
```

Exemple de contrat documenté :

```typescript
interface PromptQueryRepository {
  /**
   * @param userId - Identifiant de l'utilisateur (requis, non vide)
   * @throws {Error} Si userId est vide ou undefined
   * @throws {Error} Si la requête échoue
   */
  fetchOwned(userId: string): Promise<Prompt[]>;
}
```

Toute implémentation **doit** respecter ces contrats pour être substituable.

---

## 4. ISP - Interface Segregation Principle

> "Les clients ne devraient pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas."

### État : ✅ Conforme

### Justification architecturale

#### Ségrégation des interfaces Prompt

```
PromptQueryRepository     → 8 méthodes (lecture seule)
PromptCommandRepository   → 3 méthodes (écriture complète)
PromptMutationRepository  → 1 méthode  (update uniquement)
```

#### Consommation ciblée

Chaque consommateur reçoit uniquement l'interface dont il a besoin :

| Consommateur | Interface utilisée | Méthodes exposées |
|--------------|-------------------|-------------------|
| `usePrompts` | `PromptQueryRepository` | fetchAll, fetchOwned, etc. |
| `PromptDuplicationService` | `PromptCommandRepository` | create, update, delete |
| `PromptFavoriteService` | `PromptMutationRepository` | update uniquement |
| `PromptVisibilityService` | `PromptMutationRepository` | update uniquement |

#### Contextes séparés

Chaque interface a son propre contexte React :

```typescript
// Contextes séparés pour injection ciblée
PromptQueryRepositoryContext     → usePromptQueryRepository()
PromptCommandRepositoryContext   → usePromptCommandRepository()
PromptMutationRepositoryContext  → usePromptMutationRepository()
```

### Diagramme ISP

```
┌─────────────────────────────────────────────────────────────┐
│                    PromptRepository                          │
│  (interface agrégée pour implémentation unique)              │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ PromptQuery     │  │ PromptCommand   │  │ PromptMutation  │
│ Repository      │  │ Repository      │  │ Repository      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ fetchAll        │  │ create          │  │ update          │
│ fetchOwned      │  │ update          │  └─────────────────┘
│ fetchSharedWith │  │ delete          │          ▲
│ fetchById       │  └─────────────────┘          │
│ fetchRecent     │          ▲                    │
│ fetchFavorites  │          │                    │
│ fetchPublic     │          │                    │
│ countPublic     │          │                    │
└─────────────────┘          │                    │
         ▲                   │                    │
         │                   │                    │
         │      ┌────────────┴────────────┐       │
         │      │ SupabasePromptCommand   │───────┘
         │      │ Repository              │
         │      │ (implémente les 2)      │
         │      └─────────────────────────┘
         │
┌────────┴────────────────┐
│ SupabasePromptQuery     │
│ Repository              │
└─────────────────────────┘
```

---

## 5. DIP - Dependency Inversion Principle

> "Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions."

### État : ✅ 100% Conforme

### Justification architecturale

#### Couche d'abstraction complète

```
┌─────────────────────────────────────────────────────────────┐
│                     COUCHE PRÉSENTATION                      │
│  (Pages, Components, Hooks)                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ dépend de
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     COUCHE ABSTRACTION                       │
│  (Interfaces: PromptQueryRepository, AuthRepository, etc.)   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ implémente
                              │
┌─────────────────────────────────────────────────────────────┐
│                     COUCHE INFRASTRUCTURE                    │
│  (SupabasePromptQueryRepository, SupabaseAuthRepository)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ utilise
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE CLIENT                          │
│  (src/integrations/supabase/client.ts)                       │
└─────────────────────────────────────────────────────────────┘
```

#### Repositories avec injection via Context

| Domaine | Interface | Implémentation | Context |
|---------|-----------|----------------|---------|
| Auth | `AuthRepository` | `SupabaseAuthRepository` | `AuthRepositoryContext` |
| Profile | `ProfileRepository` | `SupabaseProfileRepository` | `ProfileRepositoryContext` |
| Prompt Query | `PromptQueryRepository` | `SupabasePromptQueryRepository` | `PromptQueryRepositoryContext` |
| Prompt Command | `PromptCommandRepository` | `SupabasePromptCommandRepository` | `PromptCommandRepositoryContext` |
| Version | `VersionRepository` | `SupabaseVersionRepository` | `VersionRepositoryContext` |
| Variable | `VariableRepository` | `SupabaseVariableRepository` | `VariableRepositoryContext` |
| Analysis | `AnalysisRepository` | `EdgeFunctionAnalysisRepository` | `AnalysisRepositoryContext` |

#### Correction récente : useOptimisticLocking

```typescript
// ❌ Avant : Import dynamique direct (violation DIP)
const { SupabasePromptQueryRepository } = await import("...");
const repository = new SupabasePromptQueryRepository();

// ✅ Après : Injection via contexte
const promptQueryRepository = usePromptQueryRepository();
const serverPrompt = await promptQueryRepository.fetchById(promptId);
```

---

## Améliorations potentielles

### Court terme

| Amélioration | Principe | Statut |
|--------------|----------|--------|
| Annotations `@throws` sur PromptRepository | LSP | ✅ Fait |
| Annotations `@throws` sur VersionRepository | LSP | ✅ Fait |
| Annotations `@throws` sur AuthRepository | LSP | ✅ Fait |
| Annotations `@throws` sur ProfileRepository | LSP | ✅ Fait |
| Annotations `@throws` sur VariableRepository | LSP | ✅ Fait |
| Annotations `@throws` sur AnalysisRepository | LSP | ✅ Fait |
| Annotations `@throws` sur PasswordCheckRepository | LSP | ✅ Fait |
| Annotations `@throws` sur EdgeFunctionRepository | LSP | ✅ Fait |
| Annotations `@throws` sur PromptShareRepository | LSP | ✅ Fait |
| Annotations `@throws` sur PromptUsageRepository | LSP | ✅ Fait |
| Annotations `@throws` sur VariableSetRepository | LSP | ✅ Fait |
| Script de validation LSP automatique | LSP | ✅ Fait |
| Documentation des invariants de domaine | LSP | Basse priorité |

### Moyen terme

| Amélioration | Principe | Description |
|--------------|----------|-------------|
| Event sourcing pour versions | SRP | Séparer la gestion d'état de la persistance |
| Validation schemas partagés | DRY | Centraliser les schémas Zod client/edge |

---

## Références

- [REPOSITORY_PATTERNS.md](./REPOSITORY_PATTERNS.md) - Patterns d'injection de dépendances
- [SRP_REFACTORING_SUMMARY.md](./SRP_REFACTORING_SUMMARY.md) - Historique du refactoring SRP
- [ERROR_HANDLING_ARCHITECTURE.md](./ERROR_HANDLING_ARCHITECTURE.md) - Architecture de gestion d'erreurs

---

## Patterns de résilience

### Loi de Murphy - Limitation des retries

Le hook `useRetryCounter` implémente une protection contre les boucles de retry infinies :

```typescript
// Pattern d'utilisation dans usePromptSave
const { canRetry, incrementAndRetry, reset } = useRetryCounter();

const savePrompt = async (data) => {
  reset(); // Nouvelle tentative utilisateur
  
  // ... validation et sauvegarde
  
  if (error) {
    handleError(error, "UPDATE", {
      retry: () => incrementAndRetry(() => savePrompt(data)),
      canRetry: canRetry(), // false après MAX_ATTEMPTS (3)
    });
  }
};
```

**Configuration :** `RETRY_CONFIG.MAX_ATTEMPTS = 3` dans `src/lib/network.ts`

### Clarification LSP - Préconditions vs RLS

Les préconditions documentées dans les interfaces (`@throws` si userId est vide) vérifient les **formats** des paramètres, pas l'**existence en base**. La validation d'existence est déléguée à la RLS PostgreSQL :

```typescript
// Interface (LSP) - Vérifie le format
interface PromptQueryRepository {
  /** @throws {Error} Si userId est vide ou undefined */
  fetchOwned(userId: string): Promise<Prompt[]>;
}

// Implémentation - RLS vérifie l'existence/permissions
class SupabasePromptQueryRepository {
  async fetchOwned(userId: string) {
    if (!userId) throw new Error("userId is required");
    // RLS: owner_id = auth.uid() vérifie automatiquement
    return supabase.from("prompts").select("*").eq("owner_id", userId);
  }
}
```

Cette séparation des responsabilités respecte le SRP tout en garantissant la substituabilité (LSP).

---

## Loi de Déméter - QueryBuilder injectable

### Problème identifié

Les repositories contenaient des chaînes d'appels répétitives vers l'API Supabase :

```typescript
// ❌ Avant : Chaîne de 6 appels, couplage fort
const result = await supabase
  .from("prompts")
  .select("*")
  .eq("owner_id", userId)
  .order("updated_at", { ascending: false })
  .limit(10);
handleSupabaseError(result);
return result.data;
```

### Solution : QueryBuilder injectable

Un QueryBuilder centralisé dans `src/lib/supabaseQueryBuilder.ts` encapsule les patterns Supabase :

```typescript
// ✅ Après : API déclarative, 1 appel
import { qb } from "@/lib/supabaseQueryBuilder";

return qb.selectMany<Prompt>("prompts", {
  filters: { eq: { owner_id: userId } },
  order: { column: "updated_at", ascending: false },
  limit: 10,
});
```

### Méthodes exposées

| Méthode | Pattern Supabase | Usage |
|---------|------------------|-------|
| `selectMany<T>` | `.select().eq().order().limit()` | Listes filtrées |
| `selectOne<T>` | `.select().eq().maybeSingle()` | Enregistrement optionnel |
| `selectOneRequired<T>` | `.select().eq().single()` | Enregistrement obligatoire |
| `selectFirst<T>` | `.select(columns).eq().limit(1).maybeSingle()` | Premier enregistrement |
| `selectManyByIds<T>` | `.select().in("id")` | Batch fetch par IDs |
| `selectWithJoin<T>` | `.select("col, rel:fk (*)")` | Jointures relationnelles |
| `countRows` | `.select("*", { count: "exact", head: true })` | Comptage |
| `insertOne<T>` | `.insert().select().single()` | Création avec retour |
| `insertWithoutReturn` | `.insert(data)` | Insertion sans retour |
| `insertMany` | `.insert()` | Batch insert |
| `updateById<T>` | `.update().eq("id").select().single()` | Mise à jour par ID |
| `updateWhere` | `.update(data).eq(column, value)` | Mise à jour par colonne |
| `deleteById` | `.delete().eq("id")` | Suppression unitaire |
| `deleteByIds` | `.delete().in("id")` | Suppression par liste |
| `deleteWhere` | `.delete().eq(column, value)` | Suppression par colonne |
| `upsertMany<T>` | `.upsert().select().order()` | Upsert atomique |

### Injectabilité pour tests

```typescript
// Production : client global par défaut
import { qb } from "@/lib/supabaseQueryBuilder";

// Tests : client fake injecté
const fakeClient = createMockClient({ data: mockData, error: null });
const testQb = createSupabaseQueryBuilder(fakeClient);
```

### Gestion des cas limites

| Cas | Comportement |
|-----|--------------|
| `eq: { col: undefined }` | Ignoré (pas d'appel `.eq()`) |
| `in: { col: [] }` | Ignoré (pas de requête vide) |
| `isNull: ["col"]` | Applique `.is(col, null)` |
| `insertMany([])` | No-op (pas d'appel réseau) |
| `deleteByIds([])` | No-op (pas d'appel réseau) |

### Statut de migration des repositories

| Repository | Méthodes | Statut | Notes |
|------------|----------|--------|-------|
| `PromptCommandRepository` | 3 | ✅ Migré | insertOne, updateById, deleteByIds |
| `ProfileRepository` | 2 | ✅ Migré | selectOne, updateById |
| `VersionRepository` | 7 | ✅ Migré | selectMany, selectOne, insertOne, updateById, deleteById |
| `VariableRepository` | 5 | ✅ Migré | selectMany, insertOne, updateById, deleteWhere, upsertMany |
| `PromptQueryRepository` | 8 | ✅ Migré | selectMany, selectOneRequired, selectWithJoin, countRows |
| `PromptShareRepository` | 6/7 | ✅ Migré | 6 méthodes via qb, getUserByEmail reste RPC direct |

**Total : 31 méthodes migrées sur 32 (97%)**

Appels Supabase directs restants (intentionnels) :
- `AuthRepository` : Opérations auth core (signIn, signUp, signOut, etc.)
- `PromptShareRepository.getUserByEmail` : Appel RPC (`supabase.rpc`)

### Bénéfices

| Aspect | Avant | Après |
|--------|-------|-------|
| Loi de Déméter | Chaînes 4-6 appels | Appel unique |
| Couplage Supabase | Fort (dans chaque repo) | Centralisé |
| Testabilité | Mock global | Injection client fake |
| Gestion erreurs | `handleSupabaseError` répété | Centralisé dans QB |
| Migration future | Réécrire tous les repos | Modifier le QueryBuilder |
| Réduction code | ~150 lignes/repo | ~90 lignes/repo (-40%) |

---

## Historique des validations

| Date | Validation | Changements |
|------|------------|-------------|
| 2025-01 | Phase 12 SRP | Refactoring usePromptSave en 6 hooks |
| 2025-01 | Phase 10 DIP | Migration vers Query/Command repositories |
| 2025-01 | Correction DIP | useOptimisticLocking via contexte |
| 2025-01 | LSP | Ajout annotations @throws interfaces Prompt/Version |
| 2025-01 | LSP 100% | Annotations @throws sur toutes les interfaces (32 méthodes) |
| 2025-01 | LSP complet | Couverture étendue à 46 méthodes (13 interfaces) + script validation |
| 2025-01 | Murphy | Ajout useRetryCounter pour limiter les tentatives de retry (MAX_ATTEMPTS=3) |
| 2025-01 | QueryBuilder 100% | Migration complète de tous les repositories vers qb (31/32 méthodes) |
| 2025-01 | SRP Phase 1 | Extraction VariableDiffCalculator, VersionDeletionService, décomposition TemplateInitializationService |
| 2025-01 | SRP Phase 2 | Extraction AnalysisErrorClassifier, ShareJoinResultMapper, ShareAuthorizationChecker, encapsulation VersionRepository |
| 2025-01 | SRP Phase 3 | Extraction useCountdown, variableFilters |
