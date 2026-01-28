

# Plan : Documentation SRP + Migration useCreateVersion

## Objectif

1. **Mettre à jour `docs/SOLID_COMPLIANCE.md`** avec les extractions SRP des phases 1, 2 et 3
2. **Enrichir `docs/SRP_REFACTORING_SUMMARY.md`** avec les détails Phase 1 manquants
3. **Migrer `useCreateVersion`** pour utiliser `PromptMutationRepository.updateVersion` au lieu de `VersionRepository.updatePromptVersion` (déprecié)

---

## Analyse de l'existant

### SOLID_COMPLIANCE.md (lignes 17-83)
- Section SRP existante couvre le refactoring `usePromptSave` (7 hooks)
- Ne mentionne **pas** les extractions Phase 1, 2, 3
- Tableau des services métier incomplet (manque VersionDeletionService)

### SRP_REFACTORING_SUMMARY.md
- Phase 1 présente mais résumée (détails manquants pour VariableDiffCalculator, etc.)
- Phases 2 et 3 bien documentées
- Manque la liste des fichiers créés en Phase 1

### useCreateVersion (lignes 27-53)
- Appelle `versionRepository.updatePromptVersion()` (déprecié)
- Doit utiliser `promptMutationRepository.updateVersion()` conformément à Phase 2.3

---

## Étapes atomiques

### Étape 1 : Mettre à jour SOLID_COMPLIANCE.md

Ajouter une nouvelle section après le tableau des services métier (après ligne 63) :

```markdown
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
```

Mettre à jour le tableau des services (ligne 54-62) pour inclure :

| Service | Responsabilité |
|---------|---------------|
| `VersionDeletionService` | Suppression cascade de versions avec mise à jour prompt |

Ajouter dans l'historique des validations (après ligne 584) :

```markdown
| 2025-01 | SRP Phase 1 | Extraction VariableDiffCalculator, VersionDeletionService, décomposition TemplateInitializationService |
| 2025-01 | SRP Phase 2 | Extraction AnalysisErrorClassifier, ShareJoinResultMapper, ShareAuthorizationChecker, encapsulation VersionRepository |
| 2025-01 | SRP Phase 3 | Extraction useCountdown, variableFilters |
```

### Étape 2 : Compléter SRP_REFACTORING_SUMMARY.md

Ajouter les fichiers créés Phase 1 (après ligne 183) :

```markdown
### Phase 1 (4 fichiers + 2 tests)

| Fichier | Description |
|---------|-------------|
| `src/repositories/variable/VariableDiffCalculator.ts` | Calculateur de diff variables |
| `src/repositories/variable/__tests__/VariableDiffCalculator.test.ts` | Tests du calculateur |
| `src/services/VersionDeletionService.ts` | Service suppression cascade |
| `src/services/__tests__/VersionDeletionService.test.ts` | Tests du service |
| `src/contexts/VersionDeletionServiceContext.tsx` | Contexte React pour injection |
```

Mettre à jour les métriques (ligne 233-238) :

```markdown
| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Lignes de code dupliquées | ~120 | ~20 | **-83%** |
| Fonctions pures testables | 3 | 15 | **+400%** |
| Couverture tests SRP | - | 55+ tests | **100%** |
| Hooks avec logique inline | 4 | 0 | **-100%** |
| Services avec injection DI | 3 | 6 | **+100%** |
```

### Étape 3 : Migrer useCreateVersion

**Fichier modifié** : `src/hooks/useVersions.ts`

Changements :
1. Ajouter import `usePromptMutationRepository`
2. Remplacer `versionRepository.updatePromptVersion()` par `promptMutationRepository.updateVersion()`

```typescript
// Avant (lignes 27-41)
export function useCreateVersion() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const versionRepository = useVersionRepository();

  return useMutation({
    mutationFn: async (version: VersionInsert) => {
      const data = await versionRepository.create(version);
      await versionRepository.updatePromptVersion(version.prompt_id, version.semver);
      return data;
    },
    // ...
  });
}

// Après
export function useCreateVersion() {
  const queryClient = useQueryClient();
  const versionMessages = useVersionMessages();
  const versionRepository = useVersionRepository();
  const promptMutationRepository = usePromptMutationRepository();

  return useMutation({
    mutationFn: async (version: VersionInsert) => {
      const data = await versionRepository.create(version);
      await promptMutationRepository.updateVersion(version.prompt_id, version.semver);
      return data;
    },
    // ...
  });
}
```

---

## Fichiers impactés

| Action | Fichier |
|--------|---------|
| Modifier | `docs/SOLID_COMPLIANCE.md` |
| Modifier | `docs/SRP_REFACTORING_SUMMARY.md` |
| Modifier | `src/hooks/useVersions.ts` |

---

## Validation

1. **Documentation** : Vérifier la cohérence des tableaux et références croisées
2. **Migration** : Exécuter les tests existants de `useVersions`
3. **TypeScript** : `npm run typecheck` pour valider les imports
4. **Tests** : `npm run test` pour non-régression

---

## Risques et mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Régression useCreateVersion | Faible | Tests existants + même comportement |
| Contexte manquant | Très faible | PromptMutationRepositoryProvider déjà dans AppProviders |
| Incohérence documentation | Aucune | Mise à jour atomique des deux fichiers |

---

## Section technique : Détails de migration useCreateVersion

### Vérification des dépendances

`PromptMutationRepositoryProvider` est déjà dans `AppProviders.tsx`, donc le hook `usePromptMutationRepository()` est disponible partout où `useVersionRepository()` l'est.

### Comportement identique

Les deux méthodes effectuent la même opération :
```sql
UPDATE prompts SET version = $semver WHERE id = $promptId
```

La seule différence est l'encapsulation correcte : `PromptMutationRepository` gère la table `prompts`, `VersionRepository` gère la table `versions`.

