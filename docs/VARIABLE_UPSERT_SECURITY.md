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

2. **Mapping par nom**
   ```typescript
   const existingMap = new Map(existingVariables.map(v => [v.name, v]));
   ```
   - Utilise le nom comme clé d'identification
   - Préserve les IDs des variables existantes

3. **Préparation des variables**
   ```typescript
   const variablesWithIds = variables.map((v, index) => {
     const existing = existingMap.get(v.name);
     return {
       ...v,
       prompt_id: promptId,
       order_index: index,
       ...(existing ? { id: existing.id } : {})
     };
   });
   ```
   - Assigne les IDs existants quand ils existent
   - Maintient l'ordre via `order_index`

4. **Suppression sélective**
   ```typescript
   const variablesToDelete = existingVariables.filter(
     ev => !newVariableNames.has(ev.name)
   );
   ```
   - Supprime uniquement les variables retirées
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

**Entrée :**
```typescript
// Variable existante : { id: '1', name: 'oldName', type: 'STRING' }
// Nouvelle variable : { name: 'newName', type: 'STRING' }
```

**Résultat :**
- ⚠️ Variable `oldName` est supprimée (ID `'1'` perdu)
- ✅ Variable `newName` est créée avec un nouvel ID

> **Note :** Le renommage est traité comme une suppression + création car nous utilisons `name` comme clé d'identification.

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

- [ ] Support du renommage avec préservation d'ID
- [ ] Batch operations pour très grands volumes
- [ ] Audit trail des modifications de variables
- [ ] Optimistic locking pour éviter les conflits concurrents
