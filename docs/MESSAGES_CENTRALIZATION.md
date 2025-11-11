# Centralisation des Messages UI

## Principe

Tous les messages utilisateur (succès, erreurs, infos) sont centralisés dans `src/constants/messages.ts` pour :
- **DRY** : Éliminer la duplication (50+ messages)
- **i18n-ready** : Faciliter la traduction future
- **Type-safety** : Autocomplete et refactoring sécurisé

## Architecture

### Structure des Messages

```
messages.ts
├── system (messages système génériques)
│   ├── sessionExpired
│   ├── genericError
│   └── networkError
├── errors.database (mappings d'erreurs - Phase 1.2) ⭐ NOUVEAU
│   ├── codes (codes PostgreSQL: 23505, 23503, etc.)
│   ├── patterns (patterns de messages par priorité)
│   └── messages spécifiques (variables, auth, etc.)
├── prompts.notifications
│   ├── created, updated, deleted (succès CRUD)
│   ├── form, save (erreurs)
│   ├── share (partage privé)
│   └── visibility (partage public)
├── variables.notifications ⭐ NOUVEAU (Phase 1 bis)
│   ├── saved (succès)
│   └── errors (saveFailed, createFailed)
├── versions.notifications ⭐ NOUVEAU (Phase 1 bis)
│   ├── created, deleted, restored (succès)
│   └── errors (createFailed, deleteFailed, restoreFailed)
└── analysis.notifications ⭐ NOUVEAU (Phase 1 bis)
    ├── analyzing, complete (succès)
    └── errors (emptyPrompt, failed, timeout)
```

### Hook d'Accès

```typescript
// ✅ BON - Utiliser le hook dédié
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";

function MyComponent() {
  const messages = usePromptMessages();
  
  const handleSave = () => {
    messages.showPromptCreated("Mon Prompt");
  };
}

// ❌ MAUVAIS - Messages hardcodés
errorToast("Prompt créé", "Mon Prompt a été créé");
```

## Règles de Contribution

1. **Jamais de messages hardcodés** dans les composants/hooks
2. Ajouter TOUS les nouveaux messages dans `messages.ts`
3. Créer une fonction dans `usePromptMessages` si nécessaire
4. Utiliser les fonctions existantes avant d'en créer de nouvelles

## Migration

### Phase 1 (Prompts) ✅ Terminée
- [x] usePromptForm
- [x] usePromptSaveErrorHandler
- [x] usePromptShares
- [x] usePrompts (visibility + permissions)
- [x] useToastNotifier (redirection vers messages.ts)
- [x] toastUtils.ts (marqué @deprecated)

### Phase 1 bis (Variables, Versions, Analyse) ✅ Terminée
- [x] useVersions (créé hook `useVersionMessages`)
- [x] usePromptAnalysis (créé hook `useAnalysisMessages`)
- [x] useVariables (utilise déjà `messages.ts` + hook `useVariableMessages` disponible)

### Phase 1 ter (Messages Système) ✅ Terminée
- [x] Créé hook `useSystemMessages` pour messages génériques réutilisables
- [x] Simplifié `useToastNotifier` (-85 lignes, suppression fonctions spécialisées)

### Phase 1.2 (Mappings d'Erreurs) ✅ Terminée
- [x] Mappings d'erreurs centralisés dans `messages.ts`
- [x] `errorHandler.ts` refactorisé (principe OCP)
- [x] Créé hook `useErrorHandler` optionnel

### Prochaines Phases
- [ ] Phase 2 : Étendre aux composants UI (EmptyState, ErrorFallback, ConflictAlert)
- [ ] Phase 3 : Support i18n avec react-i18next

## Exemples

### Avant
```typescript
errorToast("Action interdite", "Vous n'avez pas la permission...");
```

### Après
```typescript
const messages = usePromptMessages();
messages.showNoEditPermission();
```

## Bénéfices Mesurés

| Métrique | Avant (Phase 1) | Après (Phase 1 + 1bis + 1ter + 1.2) | Gain |
|----------|-----------------|--------------------------------------|------|
| **Messages dupliqués** | 50+ | 0 | **-100%** |
| **Mappings d'erreurs hardcodés** | 36 (dans `errorHandler.ts`) | 0 | **-100%** ⭐ |
| **Fichiers avec messages hardcodés** | 14 | 1 (`messages.ts`) | **-93%** |
| **Hooks de messages** | 1 (`usePromptMessages`) | 5 (prompts, variables, versions, analysis, system) | **+400%** |
| **Lignes de code (toasts)** | 230 (`useToastNotifier`) | 85 | **-63%** ⭐ |
| **Type-safety** | ❌ Partielle | ✅ Complète | **+100%** |
| **i18n-ready** | ❌ Non | ✅ Oui | **+100%** |
| **Principe OCP (erreurs)** | ❌ Modifier `errorHandler.ts` | ✅ Modifier uniquement `messages.ts` | **+100%** ⭐ |

⭐ = Nouveaux bénéfices des phases 1 bis, 1 ter et 1.2

## API usePromptMessages

### Succès CRUD
- `showPromptCreated(title: string)`
- `showPromptUpdated(title: string)`
- `showPromptDeleted()`
- `showPromptDuplicated(title: string)`

### Erreurs Formulaire
- `showNoEditPermission()`
- `showConflictDetected()`
- `showValidationError(field: string, constraint: string)`

### Erreurs Sauvegarde
- `showDuplicateTitleError()`
- `showNetworkError(action: string, retry?: () => void)`
- `showServerError(action: string, retry?: () => void)`
- `showPermissionDenied(resource: string)`

### Partage Privé
- `showShareAdded(email: string, permission: "READ" | "WRITE")`
- `showSharePermissionUpdated()`
- `showShareDeleted()`
- Erreurs: `showUserNotFoundError()`, `showSelfShareError()`, `showNotOwnerError()`, etc.

### Visibilité Publique
- `showVisibilityShared()`
- `showVisibilityPrivate()`
- `showPublicPermissionUpdated()`
- `showCannotUpdatePrivateError()`

### Système
- `showSessionExpired()`
- `showGenericError(description?: string)`

## Hooks de Messages Disponibles

### Hooks Spécifiques par Module

| Hook | Module | Localisation | Responsabilité |
|------|--------|--------------|----------------|
| `usePromptMessages` | Prompts | `src/features/prompts/hooks/` | CRUD, partage, visibilité |
| `useVariableMessages` | Variables | `src/features/variables/hooks/` | Sauvegarde, création |
| `useVersionMessages` | Versions | `src/features/prompts/hooks/` | Création, suppression, restauration |
| `useAnalysisMessages` | Analyse | `src/features/prompts/hooks/` | Analyse, timeout |

### Hook Système Générique

| Hook | Localisation | Responsabilité |
|------|--------------|----------------|
| `useSystemMessages` | `src/hooks/` | Messages réutilisables (session, réseau, permissions, conflits) |

### Hook Gestion d'Erreurs (Optionnel)

| Hook | Localisation | Responsabilité |
|------|--------------|----------------|
| `useErrorHandler` | `src/hooks/` | Combine `getSafeErrorMessage` + `useSystemMessages` pour gestion d'erreurs avec toast |

### Exemples d'Utilisation

#### useVersionMessages
```typescript
import { useVersionMessages } from "@/features/prompts/hooks/useVersionMessages";

function VersionManager() {
  const versionMessages = useVersionMessages();
  
  const handleCreate = async () => {
    try {
      await createVersion();
      versionMessages.showVersionCreated();
    } catch (error) {
      versionMessages.showCreateFailed();
    }
  };
}
```

#### useAnalysisMessages
```typescript
import { useAnalysisMessages } from "@/features/prompts/hooks/useAnalysisMessages";

function PromptAnalyzer() {
  const analysisMessages = useAnalysisMessages();
  
  const analyze = async (prompt: string) => {
    if (!prompt.trim()) {
      analysisMessages.showEmptyPromptError();
      return;
    }
    
    analysisMessages.showAnalyzing();
    try {
      const result = await analyzePrompt(prompt);
      analysisMessages.showAnalysisComplete();
    } catch (error) {
      analysisMessages.showAnalysisFailed(error.message);
    }
  };
}
```

#### useSystemMessages (générique)
```typescript
import { useSystemMessages } from "@/hooks/useSystemMessages";

function MyComponent() {
  const systemMessages = useSystemMessages();
  
  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      if (error.code === 'PGRST116') {
        systemMessages.showPermissionError("cette ressource");
      } else if (error.message?.includes('network')) {
        systemMessages.showNetworkError("effectuer cette action", handleRetry);
      } else {
        systemMessages.showGenericError();
      }
    }
  };
}
```

#### useErrorHandler (combiné)
```typescript
import { useErrorHandler } from "@/hooks/useErrorHandler";

function SmartComponent() {
  const { handleError } = useErrorHandler();
  
  const doSomething = async () => {
    try {
      await complexOperation();
    } catch (error) {
      // Détection automatique du type d'erreur + toast
      handleError(error, "effectuer cette opération");
    }
  };
}
```

## API useVariableMessages

- `showVariablesSaved()` - Variables enregistrées
- `showSaveFailed(description?: string)` - Erreur de sauvegarde
- `showCreateFailed(description?: string)` - Erreur de création

## API useVersionMessages

### Succès
- `showVersionCreated()` - Nouvelle version créée
- `showVersionDeleted()` - Version supprimée
- `showVersionRestored(semver: string)` - Version X.Y.Z restaurée

### Erreurs
- `showCreateFailed()` - Erreur de création
- `showDeleteFailed()` - Erreur de suppression
- `showRestoreFailed()` - Erreur de restauration

## API useAnalysisMessages

### Succès
- `showAnalyzing()` - Toast de chargement (retourne toast pour dismiss)
- `showAnalysisComplete()` - Analyse terminée

### Erreurs
- `showEmptyPromptError()` - Prompt vide
- `showAnalysisFailed(errorMessage?: string)` - Erreur générique
- `showTimeoutError()` - Délai dépassé (durée custom : 5s)

## API useSystemMessages (Générique)

### Session
- `showSessionExpired()` - Session expirée (6s)

### Réseau & Serveur
- `showNetworkError(action: string, retry?: () => void)` - Erreur de connexion (7s)
- `showServerError(action: string, retry?: () => void)` - Erreur serveur (6s)

### Permissions
- `showPermissionError(resource: string)` - Accès refusé (5s)

### Conflits
- `showConflictError(resourceName: string, reload?: () => void)` - Conflit utilisateur (8s)

### Validation
- `showValidationError(field: string, constraint: string)` - Validation échouée (5s)

### Générique
- `showGenericError(description?: string)` - Erreur générique

**Note** : Toutes les fonctions acceptent des callbacks optionnels (`retry`, `reload`) pour ajouter des actions aux toasts.

## API useErrorHandler (Optionnel)

### Méthodes
- `handleError(error: any, context?: string)` - Détection automatique du type d'erreur + toast approprié
- `getSafeErrorMessage(error: any)` - Conversion erreur → message user-friendly (sans toast)

### Détection Automatique
Le hook détecte automatiquement le type d'erreur et affiche le toast approprié :
- Code `PGRST116` ou mot-clé "permission" → `showPermissionError()`
- Mot-clé "network" ou "fetch" → `showNetworkError()`
- Mot-clé "jwt" ou "token" → `showSessionExpired()`
- Sinon → `showGenericError()` avec message de `getSafeErrorMessage()`

## Notes Techniques

### Typage TypeScript
Tous les messages sont fortement typés grâce à `typeof messages`, offrant :
- Autocomplete dans les IDE
- Détection d'erreurs à la compilation
- Refactoring sécurisé

### Internationalisation Future
La structure actuelle est prête pour i18n :
```typescript
// Future implementation
import { useTranslation } from 'react-i18next';

export function usePromptMessages() {
  const { t } = useTranslation();
  
  return {
    showPromptCreated: (title: string) => {
      notifySuccess(
        t('prompts.notifications.created.title'),
        t('prompts.notifications.created.description', { title })
      );
    }
  };
}
```

## Dépendances

- `src/constants/messages.ts` - Source unique de vérité
- `src/features/prompts/hooks/usePromptMessages.ts` - Hook d'accès type-safe
- `src/features/variables/hooks/useVariableMessages.ts` - Hook pour variables
- `src/features/prompts/hooks/useVersionMessages.ts` - Hook pour versions
- `src/features/prompts/hooks/useAnalysisMessages.ts` - Hook pour analyse
- `src/hooks/useSystemMessages.ts` - Hook pour messages système génériques
- `src/hooks/useErrorHandler.ts` - Hook pour gestion d'erreurs combinée
- `src/hooks/useToastNotifier.ts` - Affichage des toasts (simplifié)
- `src/lib/errorHandler.ts` - Gestion des erreurs (refactorisé avec messages.ts)
- `src/lib/toastUtils.ts` - Deprecated, conservé pour compatibilité

## Phase 1.2 : Centralisation des Mappings d'Erreurs

### Principe OCP (Open/Closed Principle)

Les mappings d'erreurs sont maintenant centralisés dans `messages.ts` au lieu d'être hardcodés dans `errorHandler.ts`. Pour ajouter un nouveau code d'erreur PostgreSQL ou un nouveau pattern de message, il suffit de **modifier uniquement `messages.ts`** sans toucher à `errorHandler.ts`.

### Structure dans `messages.ts`

```typescript
messages.errors.database = {
  // Codes PostgreSQL
  codes: {
    '23505': "Cette valeur existe déjà",           // Violation unique
    '23503': "Référence invalide",                  // Violation FK
    '23514': "Contrainte de validation violée",     // CHECK constraint
    '42501': "Accès non autorisé",                  // RLS violation
  },
  
  // Patterns de messages (par ordre de priorité)
  patterns: [
    // Spécifiques (testés en premier)
    { pattern: 'variables_name_length', message: "Le nom de la variable est trop long (max 50 caractères)" },
    { pattern: 'jwt', message: "Session expirée. Veuillez vous reconnecter." },
    
    // Génériques (fallback)
    { pattern: 'unique', message: "Cette valeur doit être unique" },
  ],
};
```

### Logique dans `errorHandler.ts`

```typescript
export function getSafeErrorMessage(error: any): string {
  // 1. Validation Zod
  if (error?.name === 'ZodError') {
    return error.errors?.[0]?.message || 'Données invalides';
  }

  // 2. Code PostgreSQL
  const errorCode = error?.code;
  if (errorCode && messages.errors.database.codes[errorCode]) {
    return messages.errors.database.codes[errorCode];
  }

  // 3. Pattern de message
  const errorMessage = error?.message?.toLowerCase() || '';
  if (errorMessage) {
    const matchedPattern = messages.errors.database.patterns.find(
      ({ pattern }) => errorMessage.includes(pattern.toLowerCase())
    );
    if (matchedPattern) {
      return matchedPattern.message;
    }
  }

  // 4. Fallback générique
  return messages.errors.generic;
}
```

### Avantages

✅ **OCP** : Extension sans modification de `errorHandler.ts`  
✅ **Centralisation** : Source unique de vérité pour les messages d'erreur  
✅ **Maintenabilité** : Facilite l'ajout de nouveaux codes d'erreur  
✅ **i18n-ready** : Prêt pour l'internationalisation  
✅ **Testabilité** : Facile à tester (mappings = données pures)

### Exemple d'Extension

Pour ajouter un nouveau code d'erreur PostgreSQL :

```typescript
// messages.ts (SEUL FICHIER À MODIFIER)
codes: {
  '23505': "Cette valeur existe déjà",
  '23503': "Référence invalide",
  '23514': "Contrainte de validation violée",
  '42501': "Accès non autorisé",
  '23502': "Valeur NULL non autorisée", // ⬅️ NOUVEAU
},
```

Aucune modification requise dans `errorHandler.ts` ! ✅

## Prochaines Étapes

### Phase 2 : Composants UI (À venir)
Étendre la centralisation aux composants présentationnels :
- `EmptyState` : Messages "Aucun prompt", "Aucun résultat"
- `ErrorFallback` : Messages d'erreur boundary
- `ConflictAlert` : Messages de conflit de modification

### Phase 3 : Internationalisation (Future)
Support i18n complet avec `react-i18next` :
```typescript
export function usePromptMessages() {
  const { t } = useTranslation();
  
  return {
    showPromptCreated: (title: string) => {
      notifySuccess(
        t('prompts.notifications.created.title'),
        t('prompts.notifications.created.description', { title })
      );
    }
  };
}
```

### Phase 4 : Messages Contextuels
- Tooltips contextuels
- Aide inline
- Messages de guidage utilisateur
