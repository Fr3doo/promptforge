# Guide Rapide : Comprendre les Commentaires Codecov sur vos PR

## 🎯 Objectif

Chaque Pull Request reçoit automatiquement un commentaire détaillé de Codecov indiquant l'impact de vos changements sur la couverture de code.

## 📊 Anatomie d'un Commentaire Codecov

### 1. En-tête : Vue d'ensemble

```markdown
## Codecov Report
> Merging #42 (abc123) into main (def456) will increase coverage by 0.43%.
> The diff coverage is 85.71%.
```

**Interprétation :**
- **increase coverage by 0.43%** : Votre PR améliore la couverture globale ✅
- **decrease coverage by 0.43%** : Votre PR réduit la couverture ⚠️
- **diff coverage is 85.71%** : 85.71% des lignes que vous avez ajoutées sont testées

**Seuils :**
- ✅ **Excellent** : diff coverage ≥ 80%
- ⚠️ **Acceptable** : diff coverage ≥ 70%
- 🔴 **À améliorer** : diff coverage < 70%

### 2. Tableau des fichiers modifiés

```markdown
| Files | Coverage Δ | Complexity Δ |
|-------|-----------|--------------|
| src/hooks/useVariableManager.ts | 92.30% <85.71%> (+2.30%) | 12 <0> (+1) |
| src/hooks/useVariableDetection.ts | 88.88% <ø> (ø) | 8 <0> (ø) |
```

**Décodage :**

| Symbole | Signification |
|---------|---------------|
| `92.30%` | Couverture actuelle du fichier entier |
| `<85.71%>` | Couverture des lignes que VOUS avez modifiées dans ce fichier |
| `(+2.30%)` | Changement de couverture par rapport à la branche main |
| `<ø>` | Aucune ligne modifiée dans ce fichier (juste des dépendances) |
| `12 <0> (+1)` | Complexité : 12 actuelle, 0 ajoutée par patch, +1 au total |

**Actions recommandées :**

✅ **Bon exemple :**
```
src/hooks/usePrompts.ts | 95.00% <100%> (+5.00%)
```
- Couverture élevée
- Toutes vos modifications sont testées (100%)
- Amélioration de la couverture globale (+5%)
→ **Parfait, continuez !**

⚠️ **Exemple à améliorer :**
```
src/components/PromptEditor.tsx | 68.50% <60.00%> (-1.50%)
```
- Couverture en dessous du seuil (< 70%)
- Seulement 60% de vos changements testés
- Baisse de couverture
→ **Ajouter des tests pour ce fichier**

### 3. Flags (Types de tests)

```markdown
| Flags | Coverage Δ |
|-------|-----------|
| unittests | 75.66% <85.71%> (+0.43%) ⬆️ |
```

**Symboles :**
- ⬆️ : Couverture en hausse
- ⬇️ : Couverture en baisse
- ➖ : Couverture stable

### 4. Checks GitHub

Dans l'onglet "Checks" de votre PR :

```
✅ codecov/project - 75.66% (+0.43%)
✅ codecov/patch - 85.71%
```

**Statuts possibles :**
- ✅ : Couverture au-dessus des seuils → Vous pouvez merger
- ❌ : Couverture en dessous des seuils → Ajouter des tests avant merge
- ⏳ : En cours d'analyse

## 🔍 Annotations GitHub

Dans l'onglet **"Files changed"**, Codecov annote directement les lignes non couvertes :

```typescript
function calculateTotal(items: Item[]) {
  if (!items || items.length === 0) {  // ⚠️ Line 42 is not covered by tests
    return 0;
  }
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Action :** Ajouter un test pour le cas `!items || items.length === 0`

## 📝 Que faire selon le commentaire ?

### Scénario 1 : Tout est vert ✅

```markdown
Coverage: 76.23% (+0.43%)
Diff coverage: 100%
```

**Actions :**
- ✅ Rien à faire, excellent travail !
- Attendre la revue de code
- Merger quand approuvé

### Scénario 2 : Patch coverage faible ⚠️

```markdown
Coverage: 75.50% (+0.10%)
Diff coverage: 65.00%  ← En dessous de 70%
```

**Actions :**
1. Cliquer sur le lien du fichier dans le commentaire
2. Identifier les lignes non couvertes (surbrillées en rouge)
3. Ajouter des tests pour ces lignes
4. Push les tests → Codecov met à jour le commentaire

**Exemple de test à ajouter :**

```typescript
// Fichier modifié : src/hooks/useVariableManager.ts
export function useVariableManager() {
  const addVariable = (name: string) => {
    if (!name) {  // ← Cette ligne n'est pas testée
      throw new Error("Name is required");
    }
    // ...
  };
}

// Test à ajouter : src/hooks/__tests__/useVariableManager.test.tsx
it("devrait lever une erreur si le nom est vide", () => {
  const { result } = renderHook(() => useVariableManager());
  
  expect(() => {
    result.current.addVariable("");
  }).toThrow("Name is required");
});
```

### Scénario 3 : Baisse de couverture globale 🔴

```markdown
Coverage: 74.80% (-0.50%)  ← Baisse > 0.2%
Diff coverage: 70.00%
```

**Actions :**
1. Vérifier si vous avez supprimé des tests par erreur
2. Vérifier si vos changements impactent des fichiers non testés
3. Ajouter des tests pour compenser
4. Si justifié (refactoring massif), commenter dans la PR

### Scénario 4 : Fichiers critiques sans tests 🚨

```markdown
| File | Coverage Δ |
|------|-----------|
| src/repositories/PromptRepository.ts | 45.00% <0%> (-5.00%) |
```

**Actions :**
1. ⚠️ Les repositories sont critiques (logique métier)
2. Ajouter des tests OBLIGATOIREMENT avant merge
3. Viser 80%+ pour les repositories
4. Consulter `docs/REPOSITORY_GUIDE.md` pour exemples de tests

## 🛠️ Commandes utiles

### Vérifier localement avant de push

```bash
# Générer le rapport de couverture
npm run test:coverage

# Ouvrir le rapport HTML
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows

# Vérifier un fichier spécifique
npm run test -- src/hooks/useVariableManager.test.tsx
```

### Débugger une couverture faible

```bash
# Lancer les tests en mode UI pour voir les lignes non couvertes
npm run test:ui

# Aller sur http://localhost:51204/__vitest__/
# Cliquer sur un test
# Onglet "Coverage" montre les lignes non couvertes en rouge
```

## 📚 Ressources

- [Documentation complète Codecov](./CODECOV_SETUP.md)
- [Guide de tests](./TESTING.md)
- [Guide des repositories](./REPOSITORY_GUIDE.md)

## ❓ FAQ

### Q: Pourquoi mon patch coverage est-il à 0% alors que j'ai ajouté des tests ?

**R:** Vous avez probablement modifié uniquement des fichiers de tests. Les fichiers `*.test.ts` sont exclus du calcul de couverture.

### Q: Mon fichier a une couverture de 100% mais Codecov dit 85%, pourquoi ?

**R:** Codecov calcule la couverture uniquement des lignes que vous avez modifiées dans cette PR, pas du fichier entier.

### Q: La CI échoue à cause de Codecov, que faire ?

**R:** Codecov est configuré avec `fail_ci_if_error: false`, donc ça ne devrait pas bloquer. Si ça bloque :
1. Vérifier que `npm run test:coverage` fonctionne localement
2. Vérifier que les fichiers `coverage/lcov.info` sont générés
3. Notifier les mainteneurs

### Q: Puis-je merger si la couverture baisse de 0.1% ?

**R:** Oui, le seuil est de 2%. Une baisse < 2% est acceptable, surtout si justifiée (suppression de code mort, refactoring).

### Q: Comment améliorer rapidement mon patch coverage ?

**R:**
1. Identifier les lignes non couvertes (annotations GitHub ou rapport HTML)
2. Ajouter des tests unitaires pour ces lignes spécifiques
3. Focus sur les cas d'erreur et les branches conditionnelles
4. Utiliser `npm run test:ui` pour voir l'impact en temps réel

---

**Besoin d'aide ?** Mentionnez `@team-reviewers` dans votre PR ou consultez le guide complet dans `docs/CODECOV_SETUP.md`.
