# Sécurité de l'Upsert des Variables

## Vue d'ensemble

Le système d'upsert des variables a été conçu pour éviter les pertes de données et garantir l'intégrité référentielle lors des modifications de variables associées à un prompt.

## Problématique initiale

L'approche naïve consisterait à :
1. Supprimer toutes les variables existantes
2. Insérer les nouvelles variables

**Problèmes de cette approche :**
- ❌ Perte des IDs des variables existantes
- ❌ Rupture des références si d'autres tables pointent vers les variables
- ❌ Pas de traçabilité des modifications
- ❌ Risque de perte de données en cas d'échec partiel

## Solution implémentée

### Algorithme d'upsert atomique

```typescript
async upsertMany(promptId: string, variables: Variable[]): Promise<Variable[]>
```

**Étapes de l'algorithme :**

1. **Récupération des variables existantes**
   ```typescript
   const existingVariables = await this.fetch(promptId);
   ```
   - Permet de mapper les IDs existants
   - Évite la création de doublons

2. **Mapping par nom et par ID**
   ```typescript
   const existingByName = new Map(existingVariables.map(v => [v.name, v]));
   const existingById = new Map(existingVariables.map(v => [v.id, v]));
   ```
   - Utilise le nom comme clé d'identification pour les mises à jour
   - Utilise l'ID comme clé pour les renommages
   - Préserve les IDs des variables existantes

3. **Préparation des variables**
   ```typescript
   const variablesWithIds = variables.map((v, index) => {
     // Si l'ID est fourni, on l'utilise (renommage)
     if (v.id && existingById.has(v.id)) {
       return { ...v, id: v.id, prompt_id: promptId, order_index: index };
     }
     // Sinon, on cherche par nom (mise à jour)
     const existingByNameMatch = existingByName.get(v.name);
     return {
       ...v,
       prompt_id: promptId,
       order_index: index,
       ...(existingByNameMatch ? { id: existingByNameMatch.id } : {})
     };
   });
   ```
   - Assigne les IDs existants quand ils existent
   - Supporte le renommage via l'ID explicite
   - Maintient l'ordre via `order_index`

4. **Suppression sélective**
   ```typescript
   const newVariableIds = new Set(variables.filter(v => v.id).map(v => v.id));
   const newVariableNames = new Set(variables.map(v => v.name));
   
   const variablesToDelete = existingVariables.filter(
     ev => !newVariableIds.has(ev.id) && !newVariableNames.has(ev.name)
   );
   ```
   - Supprime uniquement les variables retirées
   - Ne supprime pas les variables renommées (ID préservé)
   - Préserve toutes les variables toujours présentes

5. **Upsert avec gestion de conflits**
   ```typescript
   await supabase
     .from("variables")
     .upsert(variablesWithIds, { 
       onConflict: "id",
       ignoreDuplicates: false
     })
   ```
   - Si `id` existe : **UPDATE**
   - Si `id` absent : **INSERT**
   - Utilise la résolution de conflits native de Supabase

## Cas d'usage

### Cas 1 : Ajout d'une nouvelle variable

**Entrée :**
```typescript
// Variables existantes : [{ id: '1', name: 'user' }]
// Nouvelles variables :
[
  { name: 'user', type: 'STRING' },
  { name: 'language', type: 'SELECT' } // Nouvelle
]
```

**Résultat :**
- ✅ Variable `user` conserve son ID `'1'` (UPDATE)
- ✅ Variable `language` obtient un nouvel ID (INSERT)

### Cas 2 : Suppression d'une variable

**Entrée :**
```typescript
// Variables existantes : 
// [{ id: '1', name: 'user' }, { id: '2', name: 'old' }]
// Nouvelles variables :
[{ name: 'user', type: 'STRING' }]
```

**Résultat :**
- ✅ Variable `user` conserve son ID `'1'` (UPDATE)
- ✅ Variable `old` est supprimée (DELETE)

### Cas 3 : Modification d'une variable

**Entrée :**
```typescript
// Variable existante : { id: '1', name: 'count', type: 'STRING' }
// Nouvelle variable : { name: 'count', type: 'NUMBER' }
```

**Résultat :**
- ✅ La variable conserve son ID `'1'`
- ✅ Le type est mis à jour vers `NUMBER`

### Cas 4 : Renommage d'une variable

**Entrée (sans préservation d'ID) :**
```typescript
// Variable existante : { id: '1', name: 'oldName', type: 'STRING' }
// Nouvelle variable : { name: 'newName', type: 'STRING' }
```

**Résultat :**
- ⚠️ Variable `oldName` est supprimée (ID `'1'` perdu)
- ✅ Variable `newName` est créée avec un nouvel ID

**Entrée (avec préservation d'ID) :**
```typescript
// Variable existante : { id: '1', name: 'oldName', type: 'STRING' }
// Nouvelle variable : { id: '1', name: 'newName', type: 'STRING' }
```

**Résultat :**
- ✅ Variable conserve son ID `'1'`
- ✅ Le nom est mis à jour vers `newName`

> **Note :** Pour préserver l'ID lors d'un renommage, incluez explicitement le champ `id` dans la variable. Sinon, le renommage est traité comme une suppression + création.

## Gestion des erreurs

Le système inclut une gestion robuste des erreurs :

```typescript
try {
  // Opérations d'upsert
} catch (error) {
  console.error("Transaction failed in upsertMany:", error);
  throw error;
}
```

**En cas d'échec :**
- L'erreur est loggée avec contexte
- L'erreur est propagée au code appelant
- Aucune modification partielle n'est appliquée (atomicité)

## Contraintes de base de données

### Unicité par nom et prompt

Il est recommandé d'ajouter une contrainte d'unicité sur `(prompt_id, name)` :

```sql
ALTER TABLE variables 
ADD CONSTRAINT unique_variable_name_per_prompt 
UNIQUE (prompt_id, name);
```

**Avantages :**
- Évite les doublons au niveau DB
- Garantit que chaque nom est unique par prompt
- Protection supplémentaire contre les conditions de course

### Contrainte de clé étrangère

La table doit avoir une contrainte FK vers `prompts` :

```sql
ALTER TABLE variables
ADD CONSTRAINT fk_prompt
FOREIGN KEY (prompt_id) REFERENCES prompts(id)
ON DELETE CASCADE;
```

## Tests

Les tests unitaires couvrent :
- ✅ Création de nouvelles variables
- ✅ Mise à jour de variables existantes
- ✅ Suppression de variables obsolètes
- ✅ Cas où aucune variable n'est fournie
- ✅ Gestion des erreurs Supabase
- ✅ Préservation des IDs

Voir `src/repositories/__tests__/VariableRepository.test.ts`

## Performance

**Complexité :**
- Temps : O(n + m) où n = variables existantes, m = nouvelles variables
- Espace : O(n) pour le Map des variables existantes

**Requêtes DB :**
- 1 SELECT (fetch existing)
- 0-1 DELETE (si variables à supprimer)
- 1 UPSERT (toutes les variables)
- **Total : 2-3 requêtes** (au lieu de 1 DELETE + n INSERT)

## Recommandations

1. **Toujours utiliser `upsertMany`** au lieu de supprimer puis insérer
2. **Ne jamais utiliser `deleteMany` suivi d'insertions multiples**
3. **Vérifier les résultats** pour s'assurer que les IDs sont préservés
4. **Gérer les erreurs** au niveau applicatif avec messages utilisateur clairs

## Évolutions futures

- [x] Support du renommage avec préservation d'ID ✅ **Implémenté**
- [ ] Batch operations pour très grands volumes
- [ ] Audit trail des modifications de variables
- [ ] Optimistic locking pour éviter les conflits concurrents

## Historique des changements

### Version 2.0 - Support du renommage avec préservation d'ID
- Ajout du type `VariableUpsertInput` avec champ `id` optionnel
- Modification de `prepareVariablesForUpsert` pour supporter le mapping par ID
- Mise à jour de `deleteObsoleteVariables` pour éviter la suppression des variables renommées
- Ajout de tests pour le renommage avec préservation d'ID
- Documentation mise à jour avec exemples de renommage
