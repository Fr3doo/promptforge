# Phase 5 - Checklist de Validation Finale Pré-Suppression

**Objectif** : Valider que 100% des messages de `messages.ts` ont été migrés vers les modules spécialisés avant suppression.

---

## ✅ Phase 5.1 à 5.7 - Migrations Complétées

### ✅ Phase 5.1 : errors.network → common.ts
- [x] `errors.network.fetch` migré vers `commonMessages.errors.network.fetch`
- [x] `errors.network.timeout` migré vers `commonMessages.errors.network.timeout`
- [x] `errors.network.server` migré vers `commonMessages.errors.network.server`
- [x] Mapping dans `index.ts` : `errors.network.*` accessible

### ✅ Phase 5.2 : tooltips.search → common.ts
- [x] `tooltips.search.placeholder` migré vers `commonMessages.tooltips.search.placeholder`
- [x] `tooltips.search.clear` migré vers `commonMessages.tooltips.search.clear`
- [x] Mapping dans `index.ts` : `tooltips.search.*` accessible

### ✅ Phase 5.3 : errors.save/update/delete/duplicate/share → prompts.ts
- [x] `errors.save.*` migré vers `promptsMessages.prompts.errors.save`
- [x] `errors.update.*` migré vers `promptsMessages.prompts.errors.update`
- [x] `errors.delete.*` migré vers `promptsMessages.prompts.errors.delete`
- [x] `errors.duplicate.*` migré vers `promptsMessages.prompts.errors.duplicate`
- [x] `errors.share.*` migré vers `promptsMessages.prompts.errors.share`
- [x] Mapping dans `index.ts` : `errors.save/update/delete/duplicate/share.*` accessible

### ✅ Phase 5.4 : tooltips.prompts.sharing/tags → prompts.ts
- [x] `tooltips.prompts.share` migré vers `promptsMessages.tooltips.prompts.share`
- [x] `tooltips.prompts.visibility` migré vers `promptsMessages.tooltips.prompts.visibility`
- [x] `tooltips.prompts.tags.*` migré vers `promptsMessages.tooltips.prompts.tags`
- [x] Mapping dans `index.ts` : `tooltips.prompts.*` accessible

### ✅ Phase 5.5 : help.prompts.sharing → prompts.ts
- [x] `help.prompts.visibility.*` migré vers `promptsMessages.help.prompts.visibility`
- [x] `help.prompts.sharing.*` migré vers `promptsMessages.help.prompts.sharing`
- [x] Mapping dans `index.ts` : `help.prompts.*` accessible

### ✅ Phase 5.6 : success.signedOut → auth.ts
- [x] `success.signedOut` migré vers `authMessages.success.signedOut`
- [x] Mapping dans `index.ts` : `success.signedOut` accessible

### ✅ Phase 5.7 : errors.analysis → system.ts
- [x] `errors.analysis.*` déjà migré vers `systemMessages.analysis.notifications.errors`
- [x] Mapping dans `index.ts` : `analysis.notifications.errors.*` accessible

---

## 🔍 Phase 5.8 - Vérification Finale des Doublons

### Zones à Vérifier

#### A. Vérifier `errors.*` dans messages.ts vs modules
```bash
# Rechercher tous les errors.* restants dans messages.ts
grep -n "errors\." src/constants/messages.ts
```

**Attendu** : Aucun `errors.*` non migré trouvé

#### B. Vérifier `tooltips.*` dans messages.ts vs modules
```bash
# Rechercher tous les tooltips.* restants dans messages.ts
grep -n "tooltips\." src/constants/messages.ts
```

**Attendu** : Aucun `tooltips.*` non migré trouvé

#### C. Vérifier `help.*` dans messages.ts vs modules
```bash
# Rechercher tous les help.* restants dans messages.ts
grep -n "help\." src/constants/messages.ts
```

**Attendu** : Aucun `help.*` non migré trouvé

#### D. Vérifier `success.*` dans messages.ts vs modules
```bash
# Rechercher tous les success.* restants dans messages.ts
grep -n "success\." src/constants/messages.ts
```

**Attendu** : Tous les `success.*` sont dans `systemMessages` ou modules spécialisés

---

## 🧪 Phase 5.9 - Tests de Non-Régression

### 1. Vérifier l'Accès aux Messages depuis index.ts

#### Test A : errors.save.*
```typescript
// Doit être accessible via :
import { messages } from "@/constants/messages";
messages.errors.save.generic; // "Impossible de sauvegarder le prompt"
```

#### Test B : tooltips.prompts.tags.*
```typescript
import { messages } from "@/constants/messages";
messages.tooltips.prompts.tags.add; // "Ajouter des tags pour mieux organiser..."
```

#### Test C : help.prompts.sharing.*
```typescript
import { messages } from "@/constants/messages";
messages.help.prompts.sharing.permissions; // "Contrôlez ce que vos collaborateurs..."
```

#### Test D : success.signedOut
```typescript
import { messages } from "@/constants/messages";
messages.success.signedOut; // "Déconnexion réussie"
```

### 2. Vérifier les Hooks Spécialisés

#### usePromptMessages
```typescript
const { showSaveError, showUpdateError, showDeleteError } = usePromptMessages();
// Doit utiliser promptsMessages.prompts.errors.*
```

#### useSystemMessages
```typescript
const { showAnalysisError } = useSystemMessages();
// Doit utiliser systemMessages.analysis.notifications.errors.*
```

### 3. Vérifier les Composants Critiques

- [ ] `src/features/prompts/components/PromptCard.tsx` : utilise `messages.tooltips.prompts.*`
- [ ] `src/features/prompts/components/SharePromptDialog.tsx` : utilise `messages.help.prompts.sharing.*`
- [ ] `src/hooks/usePromptSave.ts` : utilise hooks de messages (usePromptMessages)
- [ ] `src/pages/Auth.tsx` : utilise `messages.success.signedOut`

---

## 📋 Checklist de Validation Complète

### Section 1 : Analyse du Fichier messages.ts

- [ ] **1.1** Lire `messages.ts` lignes 1-1029 complètement
- [ ] **1.2** Identifier TOUS les messages restants dans :
  - [ ] `errors.*`
  - [ ] `tooltips.*`
  - [ ] `help.*`
  - [ ] `success.*`
- [ ] **1.3** Confirmer que chaque message identifié existe dans un module

### Section 2 : Vérification des Modules Cibles

- [ ] **2.1** `common.ts` contient :
  - [ ] `errors.network.*`
  - [ ] `tooltips.search.*`
- [ ] **2.2** `prompts.ts` contient :
  - [ ] `errors.save/update/delete/duplicate/share.*`
  - [ ] `tooltips.prompts.sharing/tags.*`
  - [ ] `help.prompts.visibility/sharing.*`
- [ ] **2.3** `auth.ts` contient :
  - [ ] `success.signedOut`
- [ ] **2.4** `system.ts` contient :
  - [ ] `analysis.notifications.errors.*`

### Section 3 : Vérification du Mapping dans index.ts

- [ ] **3.1** `errors` object contient :
  - [ ] `...commonMessages.errors` (network, database, generic)
  - [ ] `auth: authMessages.errors.auth`
  - [ ] `variables: variablesMessages.errors.variables`
  - [ ] `save: promptsMessages.prompts.errors.save`
  - [ ] `update: promptsMessages.prompts.errors.update`
  - [ ] `delete: promptsMessages.prompts.errors.delete`
  - [ ] `duplicate: promptsMessages.prompts.errors.duplicate`
  - [ ] `share: promptsMessages.prompts.errors.share`
  - [ ] **AUCUNE** référence à `oldMessages.errors`

- [ ] **3.2** `tooltips` object contient :
  - [ ] `prompts: promptsMessages.tooltips.prompts`
  - [ ] `variables: variablesMessages.tooltips.variables`
  - [ ] `versions: versionsMessages.tooltips.versions`
  - [ ] `search: commonMessages.tooltips.search`
  - [ ] `analyzer: uiMessages.tooltips.analyzer`
  - [ ] **AUCUNE** référence à `oldMessages.tooltips`

- [ ] **3.3** `help` object contient :
  - [ ] `prompts: promptsMessages.help.prompts`
  - [ ] `variables: variablesMessages.help.variables`
  - [ ] `versions: versionsMessages.help.versions`
  - [ ] **AUCUNE** référence à `oldMessages.help`

- [ ] **3.4** `success` object contient :
  - [ ] `...systemMessages.success`
  - [ ] `signedOut: authMessages.success.signedOut`
  - [ ] **AUCUNE** référence à `oldMessages.success`

### Section 4 : Recherche dans le Codebase

- [ ] **4.1** Rechercher `oldMessages` dans tout le projet :
  ```bash
  grep -r "oldMessages" src/ --exclude-dir=node_modules
  ```
  - [ ] **RÉSULTAT ATTENDU** : Uniquement dans `src/constants/messages/index.ts` (import temporaire)

- [ ] **4.2** Rechercher `from '../messages'` dans tout le projet :
  ```bash
  grep -r "from '../messages'" src/ --exclude-dir=node_modules
  grep -r 'from "../messages"' src/ --exclude-dir=node_modules
  ```
  - [ ] **RÉSULTAT ATTENDU** : Uniquement dans `src/constants/messages/index.ts`

- [ ] **4.3** Rechercher imports directs de messages.ts :
  ```bash
  grep -r "from '@/constants/messages'" src/ --exclude-dir=node_modules
  grep -r 'from "@/constants/messages"' src/ --exclude-dir=node_modules
  ```
  - [ ] **RÉSULTAT ATTENDU** : Tous les fichiers importent depuis `@/constants/messages` (index.ts)

### Section 5 : Tests d'Intégration Manuels

- [ ] **5.1** Lancer l'application en mode dev
- [ ] **5.2** Tester les tooltips des prompts (hover sur icônes)
- [ ] **5.3** Tester les erreurs de sauvegarde (forcer une erreur)
- [ ] **5.4** Tester la déconnexion (vérifier message "Déconnexion réussie")
- [ ] **5.5** Tester l'aide inline (help texts dans les formulaires)

### Section 6 : Validation TypeScript

- [ ] **6.1** Compiler le projet sans erreurs :
  ```bash
  npm run build
  ```
- [ ] **6.2** Vérifier qu'aucune erreur de type liée aux messages
- [ ] **6.3** Vérifier l'autocomplétion fonctionne pour `messages.*`

---

## 🚨 Critères de Validation OBLIGATOIRES

### AVANT de passer aux phases 5.10-5.12 (suppression), TOUS les points suivants DOIVENT être ✅ :

1. ✅ **Aucun message** restant dans `messages.ts` qui n'est pas migré
2. ✅ **Aucune référence** à `oldMessages` en dehors de `index.ts`
3. ✅ **Aucun import** direct de `messages.ts` en dehors de `index.ts`
4. ✅ **Tous les tests** manuels passent sans régression
5. ✅ **Compilation TypeScript** sans erreurs
6. ✅ **Documentation** à jour dans `index.ts` (commentaires de migration)

---

## 📊 Statut Actuel de la Validation

**Phase actuelle** : 5.9 - Validation en cours

**Migrations complétées** : 7/7 (Phases 5.1 à 5.7)

**Tests restants** : Sections 1-6 de cette checklist

**Prochaines étapes si validation OK** :
- Phase 5.10 : Supprimer l'import `oldMessages` dans `index.ts`
- Phase 5.11 : Supprimer le fichier `messages.ts`
- Phase 5.12 : Nettoyer les commentaires de migration dans `index.ts`

---

## ✅ Validation Finale

Une fois TOUS les points cochés :

- [ ] **VALIDATION FINALE** : Tous les critères obligatoires sont remplis
- [ ] **PRÊT POUR SUPPRESSION** : oldMessages et messages.ts peuvent être supprimés en toute sécurité

**Date de validation** : _____________

**Validé par** : _____________

---

**NOTE CRITIQUE** : Ne pas procéder aux phases 5.10-5.12 tant que cette checklist n'est pas 100% complétée et validée.
