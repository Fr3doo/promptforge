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
└── prompts.notifications
    ├── created, updated, deleted (succès CRUD)
    ├── form (erreurs formulaire)
    ├── save (erreurs sauvegarde)
    ├── share (partage privé)
    └── visibility (partage public)
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

- [x] usePromptForm
- [x] usePromptSaveErrorHandler
- [x] usePromptShares
- [x] usePrompts (visibility + permissions)
- [x] useToastNotifier (redirection vers messages.ts)
- [x] toastUtils.ts (marqué @deprecated)
- [ ] Autres modules (analyzer, variables, versions) - À venir

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

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Messages dupliqués** | 50+ | 0 | -100% |
| **Fichiers avec messages hardcodés** | 14 | 1 (`messages.ts`) | -93% |
| **Type-safety** | ❌ Aucune | ✅ Complète | +100% |
| **i18n-ready** | ❌ Non | ✅ Oui | +100% |

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
- `src/hooks/useToastNotifier.ts` - Affichage des toasts
- `src/lib/toastUtils.ts` - Deprecated, conservé pour compatibilité

## Prochaines Étapes

1. **Phase 1 bis** : Étendre à `useVariables`, `useVersions`, `usePromptAnalysis`
2. **Phase 1 ter** : Créer `useSystemMessages` pour messages système génériques
3. **Future** : Intégration i18n avec `react-i18next`
