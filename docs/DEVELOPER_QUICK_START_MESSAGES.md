# Guide Rapide - Hooks de Messages Spécialisés 🚀

**Pour** : Développeurs créant de nouveaux composants  
**Temps de lecture** : 5 minutes  
**Dernière mise à jour** : Novembre 2025

---

## 🎯 Règle d'Or

> **JAMAIS de messages hardcodés dans les composants**  
> **TOUJOURS utiliser un hook spécialisé**

**Pourquoi ?**
- ✅ Type-safety (TypeScript + autocomplétion)
- ✅ Réutilisabilité (logique centralisée)
- ✅ Maintenabilité (modification en un seul endroit)
- ✅ i18n-ready (préparé pour l'internationalisation)

---

## 🗺️ Tableau de Décision Rapide : Quel Hook Utiliser ?

| Si vous travaillez sur... | Utilisez ce hook | Import |
|---------------------------|------------------|---------|
| **Prompts** (CRUD, partage, visibilité) | `usePromptMessages()` | `@/features/prompts/hooks/usePromptMessages` |
| **Variables** (création, sauvegarde) | `useVariableMessages()` | `@/features/variables/hooks/useVariableMessages` |
| **Versions** (création, suppression, restauration) | `useVersionMessages()` | `@/features/prompts/hooks/useVersionMessages` |
| **Analyse de prompts** | `useAnalysisMessages()` | `@/features/prompts/hooks/useAnalysisMessages` |
| **Erreurs système** (réseau, serveur, permissions) | `useSystemMessages()` | `@/hooks/useSystemMessages` |
| **Composants UI** (ErrorFallback, EmptyState) | `useUIMessages()` | `@/hooks/useUIMessages` |
| **Messages génériques** (toast personnalisés) | `useToastNotifier()` | `@/hooks/useToastNotifier` |

---

## 💡 Exemples Concrets par Cas d'Usage

### ✅ Cas 1 : Afficher un succès après création d'une ressource

**❌ AVANT (MAUVAIS - Ne pas faire)**
```typescript
import { toast } from "@/hooks/use-toast";

function CreatePromptButton() {
  const handleCreate = async () => {
    await createPrompt(data);
    
    // ❌ Message hardcodé
    toast({
      title: "✅ Succès",
      description: "Le prompt a été créé avec succès",
    });
  };
}
```

**✅ APRÈS (BON - Faire ça)**
```typescript
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";

function CreatePromptButton() {
  const promptMessages = usePromptMessages();

  const handleCreate = async () => {
    const newPrompt = await createPrompt(data);
    
    // ✅ Utilise le hook spécialisé
    promptMessages.showPromptCreated(newPrompt.title);
  };
}
```

---

### ✅ Cas 2 : Gérer une erreur de sauvegarde

**❌ AVANT (MAUVAIS)**
```typescript
function SaveVariablesButton() {
  const handleSave = async () => {
    try {
      await saveVariables(data);
    } catch (error) {
      // ❌ Message hardcodé
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive",
      });
    }
  };
}
```

**✅ APRÈS (BON)**
```typescript
import { useVariableMessages } from "@/features/variables/hooks/useVariableMessages";

function SaveVariablesButton() {
  const variableMessages = useVariableMessages();

  const handleSave = async () => {
    try {
      await saveVariables(data);
      variableMessages.showVariablesSaved();
    } catch (error) {
      // ✅ Message d'erreur avec description personnalisée si nécessaire
      variableMessages.showSaveFailed(error.message);
    }
  };
}
```

---

### ✅ Cas 3 : Erreur réseau avec option de retry

**✅ BON - Utiliser useSystemMessages**
```typescript
import { useSystemMessages } from "@/hooks/useSystemMessages";
import { useQueryClient } from "@tanstack/react-query";

function FetchDataComponent() {
  const systemMessages = useSystemMessages();
  const queryClient = useQueryClient();

  const { data, error } = useQuery({
    queryKey: ['prompts'],
    queryFn: fetchPrompts,
    onError: (error) => {
      // ✅ Message d'erreur avec bouton de retry
      systemMessages.showNetworkError("charger les prompts", () => {
        queryClient.invalidateQueries(['prompts']);
      });
    },
  });
}
```

---

### ✅ Cas 4 : Validation avec messages d'erreur

**✅ BON**
```typescript
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";

function PromptTitleInput({ value, onChange }: Props) {
  const promptMessages = usePromptMessages();

  const validateTitle = (title: string) => {
    if (title.length < 3) {
      // ✅ Message de validation spécifique
      promptMessages.showValidationError(
        "Titre",
        "Le titre doit contenir au moins 3 caractères"
      );
      return false;
    }
    return true;
  };

  const handleBlur = () => {
    validateTitle(value);
  };

  return (
    <input
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
    />
  );
}
```

---

### ⚠️ Cas 5 : Accéder directement aux messages (cas avancés)

**Cas d'usage rares : composants statiques, textes d'aide inline**

```typescript
import { messages } from "@/constants/messages";

function StaticHelpText() {
  return (
    <div className="help-section">
      {/* ⚠️ Acceptable ici car pas de notification toast nécessaire */}
      <h3>{messages.help.prompts.title}</h3>
      <p>{messages.tooltips.prompts.favorite}</p>
      <span>{messages.help.prompts.sharing.title}</span>
    </div>
  );
}
```

**⚠️ Note** : Privilégier les hooks pour bénéficier de la logique de notification (toast). N'utiliser l'accès direct que pour des textes statiques sans interaction.

---

## 🔥 Patterns Courants (Copier-Coller)

### Pattern 1 : Mutation avec feedback utilisateur

```typescript
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";
import { useMutation } from "@tanstack/react-query";

function UpdatePromptForm() {
  const promptMessages = usePromptMessages();

  const mutation = useMutation({
    mutationFn: updatePrompt,
    onSuccess: (data) => {
      promptMessages.showPromptUpdated(data.title);
    },
    onError: (error) => {
      promptMessages.showServerError("mise à jour du prompt");
    },
  });

  return (
    <button onClick={() => mutation.mutate(formData)}>
      Sauvegarder
    </button>
  );
}
```

---

### Pattern 2 : Suppression avec confirmation

```typescript
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";

function DeletePromptButton({ promptId }: Props) {
  const promptMessages = usePromptMessages();

  const handleDelete = async () => {
    try {
      await deletePrompt(promptId);
      promptMessages.showPromptDeleted();
    } catch (error) {
      promptMessages.showServerError("suppression du prompt");
    }
  };

  return (
    <button onClick={handleDelete}>
      Supprimer
    </button>
  );
}
```

---

### Pattern 3 : Messages contextuels avec retry

```typescript
import { useSystemMessages } from "@/hooks/useSystemMessages";
import { useState } from "react";

function DataLoader() {
  const systemMessages = useSystemMessages();
  const [retryCount, setRetryCount] = useState(0);

  const loadData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch (error) {
      // Affiche un toast avec bouton "Réessayer"
      systemMessages.showNetworkError("charger les données", () => {
        setRetryCount(prev => prev + 1);
        loadData();
      });
    }
  };
}
```

---

### Pattern 4 : Analyse de prompt avec loading

```typescript
import { useAnalysisMessages } from "@/features/prompts/hooks/useAnalysisMessages";

function AnalyzePromptButton({ content }: Props) {
  const analysisMessages = useAnalysisMessages();

  const handleAnalyze = async () => {
    if (!content.trim()) {
      analysisMessages.showEmptyPromptError();
      return;
    }

    // Affiche un toast "Analyse en cours..."
    analysisMessages.showAnalyzing();

    try {
      const result = await analyzePrompt(content);
      analysisMessages.showAnalysisComplete();
      return result;
    } catch (error) {
      analysisMessages.showAnalysisFailed(error.message);
    }
  };
}
```

---

### Pattern 5 : Permissions avec message d'erreur

```typescript
import { useSystemMessages } from "@/hooks/useSystemMessages";
import { usePromptPermission } from "@/hooks/usePromptPermission";

function EditPromptButton({ promptId }: Props) {
  const systemMessages = useSystemMessages();
  const { canEdit } = usePromptPermission(promptId);

  const handleEdit = () => {
    if (!canEdit) {
      systemMessages.showPermissionError("ce prompt");
      return;
    }
    
    // Logique d'édition
  };
}
```

---

## 🚫 Anti-Patterns à Éviter

### ❌ Anti-Pattern 1 : Messages hardcodés

**NE JAMAIS FAIRE ÇA**
```typescript
// ❌ MAUVAIS
toast({
  title: "Erreur de création",
  description: "Le prompt n'a pas pu être créé",
  variant: "destructive",
});

// ❌ MAUVAIS
const errorMessage = "Impossible de sauvegarder les variables";
console.error(errorMessage);
```

**Pourquoi c'est mal ?**
- Duplication du message dans plusieurs fichiers
- Aucune cohérence (un dev écrit "Erreur", un autre "Échec")
- Impossible à traduire facilement (i18n)
- Pas de type-safety

---

### ❌ Anti-Pattern 2 : Importer directement depuis les modules spécialisés

**NE JAMAIS FAIRE ÇA**
```typescript
// ❌ MAUVAIS - Import direct depuis sous-module
import { promptsMessages } from "@/constants/messages/prompts";

// ❌ MAUVAIS - Import partiel
import { errors } from "@/constants/messages/prompts";
```

**TOUJOURS FAIRE ÇA**
```typescript
// ✅ BON - Import depuis le point d'entrée unique
import { messages } from "@/constants/messages";

// Utilisation
messages.prompts.notifications.created.title
```

**Pourquoi ?**
- Garantit l'export correct depuis `index.ts`
- Évite les imports circulaires
- Facilite les refactorings futurs

---

### ❌ Anti-Pattern 3 : Créer des hooks personnalisés sans raison

**NE FAIRE QU'EN CAS DE NOUVEAU DOMAINE MÉTIER**
```typescript
// ❌ MAUVAIS - Hook inutile
function useMyCustomMessages() {
  const { notifyError } = useToastNotifier();
  return {
    showMyError: () => notifyError("Erreur", "Description"),
  };
}
```

**UTILISER LES HOOKS EXISTANTS**
```typescript
// ✅ BON - Utilise usePromptMessages si c'est lié aux prompts
const promptMessages = usePromptMessages();
promptMessages.showServerError("création du prompt");

// ✅ BON - Utilise useSystemMessages si c'est une erreur générique
const systemMessages = useSystemMessages();
systemMessages.showGenericError("Une erreur s'est produite");
```

**Quand créer un nouveau hook ?**
- Uniquement si vous créez un **nouveau domaine métier** (ex: `useCommentMessages` pour des commentaires)
- Suivre le pattern des hooks existants
- Créer le module de messages correspondant dans `src/constants/messages/`

---

### ❌ Anti-Pattern 4 : Messages dupliqués

**NE PAS DUPLIQUER**
```typescript
// ❌ MAUVAIS - Le message existe déjà dans usePromptMessages
const showDeleteSuccess = () => {
  toast({ 
    title: "✅ Succès", 
    description: "Prompt supprimé avec succès" 
  });
};
```

**UTILISER L'EXISTANT**
```typescript
// ✅ BON - Réutilise la logique existante
const promptMessages = usePromptMessages();
promptMessages.showPromptDeleted();
```

**Comment vérifier si un message existe déjà ?**
1. Cherchez dans `src/constants/messages/[domaine].ts`
2. Utilisez l'autocomplétion TypeScript : `messages.` → autocomplete
3. Consultez les hooks existants (voir section "Ressources")

---

## ✅ Checklist Rapide Avant de Commit

Avant de soumettre votre code, vérifiez :

- [ ] **Aucun message hardcodé** dans mon code (ni `toast()`, ni `console.log()`)
- [ ] **J'utilise le hook approprié** (voir tableau de décision en haut)
- [ ] **Mes imports sont corrects** (`@/constants/messages` pour accès direct)
- [ ] **Je n'ai pas dupliqué** un message existant (vérifier dans les modules)
- [ ] **Mes messages sont en français** (convention du projet)
- [ ] **J'ai testé** que les notifications s'affichent correctement
- [ ] **J'ai géré les cas d'erreur** (network, permissions, validation)

---

## 📂 Où Trouver les Messages Existants ?

### Navigation par Domaine

**📁 Prompts** → `src/constants/messages/prompts.ts`
- Notifications CRUD (créé, mis à jour, supprimé, dupliqué)
- Partage (ajouté, permission mise à jour, supprimé)
- Visibilité (partagé, privé)
- Tooltips (partage, visibilité, tags, favoris)
- Aide inline (titre, partage, visibilité)
- Erreurs (validation, permissions, duplication, serveur, réseau)

**📁 Variables** → `src/constants/messages/variables.ts`
- Notifications (sauvegardé)
- Erreurs (échec sauvegarde, échec création)
- Tooltips (nom, type, valeur par défaut, aide, requis, pattern, options)
- Aide inline (titre)

**📁 Versions** → `src/constants/messages/versions.ts`
- Notifications (créé, supprimé, restauré)
- Erreurs (échec création, échec suppression, échec restauration)
- Tooltips (créer, supprimer, restaurer, message)
- Aide inline (titre, message)

**📁 Analyse** → `src/constants/messages/system.ts` (section `analysis`)
- Notifications (analyse en cours, terminée)
- Erreurs (prompt vide, échec, timeout)

**📁 UI Générique** → `src/constants/messages/common.ts`
- Validation (requis, longueur min/max, format invalide)
- Réseau (erreur fetch, timeout, serveur)
- Base de données (conflit, contrainte unique)
- Tooltips génériques (recherche, navigation, actions)

**📁 Système** → `src/constants/messages/system.ts`
- Succès génériques
- Info, loading, actions
- Erreurs (session expirée, erreur générique)

**📁 Application** → `src/constants/messages/app.ts`
- Messages des pages (Index, Dashboard, FAQ, Resources, etc.)
- Marketing, workflow, use cases, testimonials

**📁 Authentification** → `src/constants/messages/auth.ts`
- Login, signup, logout
- Erreurs (credentials invalides, utilisateur existe)

**📁 UI Composants** → `src/constants/messages/ui.ts`
- ErrorFallback, EmptyState

---

### Recherche Rapide avec TypeScript

Tapez `messages.` dans votre éditeur et laissez l'autocomplétion vous guider :

```typescript
import { messages } from "@/constants/messages";

// L'autocomplétion affichera tous les domaines disponibles
messages.prompts.notifications.      // → created, updated, deleted, etc.
messages.errors.network.             // → fetch, timeout, server
messages.tooltips.prompts.           // → share, visibility, tags, etc.
messages.help.prompts.               // → title, sharing, visibility
```

**Astuce** : Utilisez `Ctrl+Space` (VS Code) pour afficher les suggestions TypeScript.

---

## ❓ FAQ Rapide

### Q : Puis-je créer un nouveau hook de messages ?

**R** : Oui, **uniquement** si vous travaillez sur un **nouveau domaine métier** (ex: `useCommentMessages` pour une fonctionnalité commentaires). 

**Étapes** :
1. Créez le module de messages : `src/constants/messages/comments.ts`
2. Exportez-le dans `index.ts`
3. Créez le hook : `src/features/comments/hooks/useCommentMessages.ts`
4. Suivez le pattern des hooks existants (utilisez `useToastNotifier`)

---

### Q : Comment ajouter un nouveau message ?

**R** : 
1. Ajoutez-le dans le module approprié (`src/constants/messages/[domaine].ts`)
2. Exportez-le dans `index.ts` si nécessaire
3. Créez une fonction dans le hook correspondant (ex: `usePromptMessages`)
4. Utilisez-le dans votre composant

**Exemple** :
```typescript
// 1. Ajouter dans prompts.ts
export const promptsMessages = {
  notifications: {
    archived: {
      title: "Archivé",
      description: (title: string) => `"${title}" a été archivé`,
    } as const,
  },
} as const;

// 2. Exporter dans index.ts (déjà fait automatiquement)

// 3. Ajouter dans usePromptMessages.ts
export function usePromptMessages() {
  const { notifySuccess } = useToastNotifier();

  return {
    showPromptArchived: (title: string) => {
      const msg = messages.prompts.notifications.archived;
      notifySuccess(msg.title, msg.description(title));
    },
  };
}

// 4. Utiliser dans un composant
const promptMessages = usePromptMessages();
promptMessages.showPromptArchived("Mon Prompt");
```

---

### Q : Les hooks retournent-ils des Promises ?

**R** : **Non**, ce sont des fonctions **synchrones** qui déclenchent des toasts. Elles ne bloquent pas l'exécution.

```typescript
// ✅ Utilisation correcte
promptMessages.showPromptCreated("Titre");
console.log("Suite du code"); // S'exécute immédiatement

// ❌ Pas besoin de await
await promptMessages.showPromptCreated("Titre"); // INUTILE
```

---

### Q : Puis-je personnaliser la durée d'affichage ?

**R** : Oui, utilisez `useToastNotifier` directement avec `options.duration` :

```typescript
import { useToastNotifier } from "@/hooks/useToastNotifier";

function MyComponent() {
  const { notifySuccess } = useToastNotifier();

  const handleAction = () => {
    // Toast affiché pendant 10 secondes
    notifySuccess("Titre", "Description", { duration: 10000 });
  };
}
```

**Durées par défaut** :
- Success : 3000ms (3s)
- Error : 5000ms (5s)
- Info/Warning : 4000ms (4s)
- Loading : Infinity (jusqu'à dismiss manuel)

---

### Q : Comment ajouter un bouton d'action au toast ?

**R** : Utilisez `useToastNotifier` avec `options.action` :

```typescript
import { useToastNotifier } from "@/hooks/useToastNotifier";

function MyComponent() {
  const { notifyError } = useToastNotifier();

  const handleError = () => {
    notifyError(
      "Erreur de réseau",
      "Impossible de charger les données",
      {
        duration: 7000,
        action: {
          label: "Réessayer",
          onClick: () => refetchData(),
        },
      }
    );
  };
}
```

---

### Q : Comment tester mes composants avec les hooks de messages ?

**R** : Mockez les hooks dans vos tests :

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock du hook
vi.mock("@/features/prompts/hooks/usePromptMessages", () => ({
  usePromptMessages: () => ({
    showPromptCreated: vi.fn(),
    showPromptUpdated: vi.fn(),
    showPromptDeleted: vi.fn(),
  }),
}));

describe("CreatePromptButton", () => {
  it("affiche un message de succès après création", async () => {
    const { showPromptCreated } = usePromptMessages();
    
    render(<CreatePromptButton />);
    
    const button = screen.getByRole("button", { name: /créer/i });
    await userEvent.click(button);
    
    expect(showPromptCreated).toHaveBeenCalledWith("Nouveau Prompt");
  });
});
```

---

### Q : Que faire si je ne trouve pas le message dont j'ai besoin ?

**R** : 
1. Vérifiez d'abord dans les modules existants (utilisez l'autocomplétion)
2. Si le message n'existe pas, **créez-le** (voir "Comment ajouter un nouveau message ?")
3. Si vous hésitez sur le module, demandez à l'équipe ou consultez `MESSAGES_MIGRATION_GUIDE.md`

---

### Q : Pourquoi certains messages utilisent-ils des fonctions ?

**R** : Pour permettre l'interpolation de variables dynamiques :

```typescript
// messages/prompts.ts
export const promptsMessages = {
  notifications: {
    created: {
      title: "Prompt créé",
      // Fonction pour interpoler le titre
      description: (title: string) => `"${title}" a été créé avec succès`,
    } as const,
  },
} as const;

// Utilisation
promptMessages.showPromptCreated("Mon Nouveau Prompt");
// Affiche : "Mon Nouveau Prompt" a été créé avec succès
```

---

## 📚 Ressources Complémentaires

### Documentation Complète

- **Guide complet** : `MESSAGES_MIGRATION_GUIDE.md` - Architecture et migration
- **Résumé de migration** : `docs/MIGRATION_COMPLETE_SUMMARY.md` - Historique et résultats
- **Centralisation** : `docs/MESSAGES_CENTRALIZATION.md` - Principes architecturaux
- **Checklist validation** : `docs/PHASE_5_VALIDATION_CHECKLIST.md` - Validation finale

### Code Source

**Modules de Messages** :
- `src/constants/messages/index.ts` - Point d'entrée unique
- `src/constants/messages/prompts.ts` - Messages Prompts
- `src/constants/messages/variables.ts` - Messages Variables
- `src/constants/messages/versions.ts` - Messages Versions
- `src/constants/messages/common.ts` - Messages génériques
- `src/constants/messages/system.ts` - Messages système
- `src/constants/messages/auth.ts` - Messages authentification
- `src/constants/messages/ui.ts` - Messages composants UI
- `src/constants/messages/app.ts` - Messages pages application

**Hooks Spécialisés** :
- `src/features/prompts/hooks/usePromptMessages.ts`
- `src/features/variables/hooks/useVariableMessages.ts`
- `src/features/prompts/hooks/useVersionMessages.ts`
- `src/features/prompts/hooks/useAnalysisMessages.ts`
- `src/hooks/useSystemMessages.ts`
- `src/hooks/useUIMessages.ts`
- `src/hooks/useToastNotifier.ts`

---

## 🔍 Exemples Réels du Projet

Pour voir des exemples concrets d'utilisation dans le code :

### Composants avec usePromptMessages

**`src/features/prompts/components/PromptCard.tsx`**
- Utilisation : `showPromptDeleted()`, `showPromptDuplicated()`
- Pattern : Mutation avec feedback utilisateur

**`src/features/prompts/components/SharePromptDialog.tsx`**
- Utilisation : `showShareAdded()`, `showSharePermissionUpdated()`
- Pattern : Gestion des partages avec notifications

**`src/features/prompts/components/PromptActionsMenu.tsx`**
- Utilisation : `showPromptDeleted()`, `showServerError()`
- Pattern : Actions CRUD avec gestion d'erreurs

---

### Composants avec useVariableMessages

**`src/features/variables/components/VariableInputPanel.tsx`**
- Utilisation : `showVariablesSaved()`, `showSaveFailed()`
- Pattern : Sauvegarde avec feedback

**`src/components/VariableManager.tsx`**
- Utilisation : `showCreateFailed()`
- Pattern : Création avec gestion d'erreurs

---

### Composants avec useSystemMessages

**`src/hooks/usePromptSave.ts`**
- Utilisation : `showNetworkError()`, `showServerError()`, `showPermissionError()`
- Pattern : Gestion complète des erreurs (réseau, serveur, permissions)

**`src/hooks/useErrorHandler.ts`**
- Utilisation : `showSessionExpired()`, `showGenericError()`
- Pattern : Gestionnaire d'erreurs centralisé

---

### Composants avec useAnalysisMessages

**`src/hooks/usePromptAnalysis.ts`**
- Utilisation : `showAnalyzing()`, `showAnalysisComplete()`, `showTimeoutError()`
- Pattern : Analyse avec loading et gestion des timeouts

**`src/components/PromptAnalyzer.tsx`**
- Utilisation : `showEmptyPromptError()`, `showAnalysisFailed()`
- Pattern : Validation et erreurs d'analyse

---

### Composants avec useVersionMessages

**`src/hooks/useVersions.ts`**
- Utilisation : `showVersionCreated()`, `showVersionDeleted()`, `showVersionRestored()`
- Pattern : Gestion des versions avec feedback

---

### Composants avec useUIMessages

**`src/components/ErrorFallback.tsx`**
- Utilisation : Accès direct à `messages.ui.errorFallback`
- Pattern : Composant UI avec messages statiques

---

## 🎓 Bonnes Pratiques Résumées

### ✅ À FAIRE

1. **Toujours utiliser un hook** pour afficher des notifications
2. **Importer depuis** `@/constants/messages` pour accès direct aux messages
3. **Vérifier l'existence** d'un message avant d'en créer un nouveau
4. **Suivre les conventions** de nommage (`show[Action]`, `show[Resource][Action]`)
5. **Tester les notifications** dans les composants critiques

### ❌ À NE PAS FAIRE

1. **Jamais hardcoder** les messages dans les composants
2. **Jamais importer** directement depuis les sous-modules (`messages/prompts.ts`)
3. **Jamais dupliquer** un message existant
4. **Jamais créer** un hook personnalisé sans raison valable
5. **Jamais oublier** de gérer les cas d'erreur

---

## 🚀 Démarrage Rapide - TL;DR

```typescript
// 1. Importer le hook approprié (voir tableau de décision)
import { usePromptMessages } from "@/features/prompts/hooks/usePromptMessages";

// 2. Instancier le hook dans votre composant
const promptMessages = usePromptMessages();

// 3. Utiliser les fonctions du hook
promptMessages.showPromptCreated("Mon Prompt");      // Succès
promptMessages.showServerError("création du prompt"); // Erreur
promptMessages.showValidationError("Titre", "Minimum 3 caractères"); // Validation

// ✅ C'est tout !
```

---

**Vous êtes prêt !** 🎉  
**Questions ?** → Consultez la FAQ ou les ressources complémentaires.
