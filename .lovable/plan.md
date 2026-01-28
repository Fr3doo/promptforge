

# Plan : Suppression de `VersionRepository.updatePromptVersion`

## Objectif

Supprimer la méthode dépréciée `updatePromptVersion` de `VersionRepository` en migrant d'abord les derniers usages vers `PromptMutationRepository.updateVersion`.

---

## Analyse des usages actuels

| Fichier | Usage | Action requise |
|---------|-------|----------------|
| `src/services/VersionDeletionService.ts` | Appels lignes 130, 134 | ⚠️ Migrer vers PromptMutationRepository |
| `src/hooks/useVersions.ts` | ✅ Déjà migré | Aucune |
| `src/repositories/VersionRepository.ts` | Définition interface + implémentation | Supprimer |
| Tests et mocks | 6 fichiers avec mocks | Mettre à jour |
| Documentation | 2 fichiers | Mettre à jour |

---

## Étapes atomiques

### Étape 1 : Migrer `VersionDeletionService`

**Fichier** : `src/services/VersionDeletionService.ts`

Changements :
1. Ajouter import de `PromptMutationRepository`
2. Modifier le constructeur pour accepter les deux repositories
3. Remplacer les appels `versionRepository.updatePromptVersion()` par `promptMutationRepository.updateVersion()`

```typescript
// Avant
export class DefaultVersionDeletionService implements VersionDeletionService {
  constructor(private readonly versionRepository: VersionRepository) {}
  
  // ... utilise versionRepository.updatePromptVersion()
}

// Après
import type { PromptMutationRepository } from "@/repositories/PromptRepository.interfaces";

export class DefaultVersionDeletionService implements VersionDeletionService {
  constructor(
    private readonly versionRepository: VersionRepository,
    private readonly promptMutationRepository: PromptMutationRepository
  ) {}
  
  // ... utilise promptMutationRepository.updateVersion()
}
```

---

### Étape 2 : Mettre à jour le contexte `VersionDeletionServiceContext`

**Fichier** : `src/contexts/VersionDeletionServiceContext.tsx`

Changements :
1. Ajouter import de `usePromptMutationRepository`
2. Injecter le repository dans le constructeur du service

```typescript
// Avant
const versionRepository = useVersionRepository();
return new DefaultVersionDeletionService(versionRepository);

// Après
const versionRepository = useVersionRepository();
const promptMutationRepository = usePromptMutationRepository();
return new DefaultVersionDeletionService(versionRepository, promptMutationRepository);
```

---

### Étape 3 : Supprimer `updatePromptVersion` de `VersionRepository`

**Fichier** : `src/repositories/VersionRepository.ts`

Changements :
1. Supprimer la méthode de l'interface (lignes 56-70)
2. Supprimer l'implémentation dans `SupabaseVersionRepository` (lignes 116-118)

```typescript
// Supprimer de l'interface VersionRepository :
/**
 * @deprecated Utiliser PromptMutationRepository.updateVersion() à la place
 */
updatePromptVersion(promptId: string, semver: string): Promise<void>;

// Supprimer de SupabaseVersionRepository :
async updatePromptVersion(promptId: string, semver: string): Promise<void> {
  return qb.updateWhere("prompts", "id", promptId, { version: semver });
}
```

---

### Étape 4 : Mettre à jour les tests

**Fichiers impactés** :

| Fichier | Changements |
|---------|-------------|
| `src/services/__tests__/VersionDeletionService.test.ts` | Ajouter mock `PromptMutationRepository`, adapter les assertions |
| `src/repositories/__tests__/VersionRepository.test.ts` | Supprimer les tests de `updatePromptVersion` |
| `src/hooks/__tests__/useOptimisticLocking.test.tsx` | Supprimer `updatePromptVersion` du mock |

**Exemple pour VersionDeletionService.test.ts** :

```typescript
// Avant
const mockVersionRepository = {
  // ...
  updatePromptVersion: vi.fn(),
};

// Après
const mockVersionRepository = {
  // ... sans updatePromptVersion
};

const mockPromptMutationRepository = {
  updateVersion: vi.fn(),
  // autres méthodes si nécessaire
};

const service = new DefaultVersionDeletionService(
  mockVersionRepository,
  mockPromptMutationRepository
);

// Assertions
expect(mockPromptMutationRepository.updateVersion).toHaveBeenCalledWith("prompt-1", "1.5.0");
```

---

### Étape 5 : Mettre à jour la documentation

**Fichiers impactés** :

| Fichier | Changements |
|---------|-------------|
| `docs/PHASE_5_MIGRATION_AUTH_REPO_PATTERN.md` | Supprimer `updatePromptVersion` de l'interface exemple |
| `docs/SRP_REFACTORING_SUMMARY.md` | Marquer la migration comme **complète** |

---

## Résumé des fichiers

| Action | Fichier |
|--------|---------|
| Modifier | `src/services/VersionDeletionService.ts` |
| Modifier | `src/contexts/VersionDeletionServiceContext.tsx` |
| Modifier | `src/repositories/VersionRepository.ts` |
| Modifier | `src/services/__tests__/VersionDeletionService.test.ts` |
| Modifier | `src/repositories/__tests__/VersionRepository.test.ts` |
| Modifier | `src/hooks/__tests__/useOptimisticLocking.test.tsx` |
| Modifier | `docs/PHASE_5_MIGRATION_AUTH_REPO_PATTERN.md` |
| Modifier | `docs/SRP_REFACTORING_SUMMARY.md` |

---

## Validation

1. **TypeScript** : `npm run typecheck` - aucune erreur de type
2. **Tests** : `npm run test` - tous les tests passent
3. **Recherche** : `grep -r "updatePromptVersion"` - aucun résultat (sauf dans l'historique git)

---

## Risques et mitigations

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Contexte PromptMutation manquant | Très faible | Déjà présent dans AppProviders, vérifié |
| Régression VersionDeletionService | Faible | Tests existants adaptés |
| Usages cachés | Très faible | Recherche exhaustive effectuée |

---

## Bénéfices attendus

1. **Encapsulation respectée** : `VersionRepository` ne modifie plus la table `prompts`
2. **Interface simplifiée** : Suppression de la méthode dépréciée
3. **SRP complet** : Chaque repository gère uniquement sa table

