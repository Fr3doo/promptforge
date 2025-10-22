# Séquence de Création de Version Initiale

## Problématique

Lors de la création d'un prompt, plusieurs opérations doivent être effectuées dans l'ordre :
1. Création du prompt
2. Sauvegarde des variables
3. Création de la version initiale

Si l'une de ces étapes échoue, nous devons garantir :
- Que l'utilisateur n'est pas bloqué
- Que les données restent cohérentes
- Qu'une notification claire est envoyée

## Solution Implémentée

### Architecture

```
┌─────────────────┐
│  usePromptSave  │
└────────┬────────┘
         │
         ├─► 1. Créer Prompt (mutation)
         │   └─► ✅ Succès
         │
         ├─► 2. Sauvegarder Variables (mutation)
         │   └─► ✅ Succès (non-bloquant)
         │
         └─► 3. Créer Version Initiale (Edge Function)
             ├─► ✅ Succès → Navigation
             ├─► ⚠️  Déjà créée → Navigation (skip)
             └─► ❌ Échec → Toast Warning + Navigation
                 (Prompt reste utilisable)
```

### Edge Function `create-initial-version`

**Avantages de l'Edge Function :**
- Atomicité garantie côté serveur
- Vérifications de sécurité (ownership, authentification)
- Détection des doublons (idempotence)
- Meilleure gestion d'erreur
- Logging centralisé
- Retry automatique possible

**Flux :**

```typescript
1. Vérifier l'authentification
   ├─► ❌ Non authentifié → 401
   └─► ✅ Authentifié

2. Vérifier ownership du prompt
   ├─► ❌ Pas le propriétaire → 403
   └─► ✅ Propriétaire

3. Vérifier si version existe déjà
   ├─► ✅ Existe → Retourner { success: true, skipped: true }
   └─► ❌ N'existe pas

4. Créer la version
   ├─► ❌ Échec → 500 + message d'erreur
   └─► ✅ Succès

5. Mettre à jour le numéro de version du prompt
   ├─► ❌ Échec → Log warning (pas d'échec global)
   └─► ✅ Succès

6. Retourner { success: true, version }
```

### Gestion des Erreurs

#### Côté Client (usePromptSave)

**Important :** Le client Supabase gère automatiquement l'ajout du JWT. Aucun header manuel n'est nécessaire.

```typescript
try {
  // Le SDK Supabase ajoute automatiquement le token si l'utilisateur est connecté
  // Pas besoin de passer manuellement le header Authorization
  const { data, error } = await supabase.functions.invoke(
    'create-initial-version',
    { 
      body: { 
        prompt_id, 
        content, 
        semver, 
        message, 
        variables 
      } 
      // Pas de headers: { Authorization: ... } - géré par le SDK
    }
  );

  if (error) {
    // Erreur edge function (auth, permissions, création)
    toast.warning("Prompt créé", {
      description: "La version initiale n'a pas pu être créée. " +
                   "Vous pouvez créer une version manuellement."
    });
  } else if (data?.skipped) {
    // Version déjà créée (idempotence)
    console.log("Version already exists");
  } else {
    // Succès
    console.log("Version created");
  }
} catch (error) {
  // Erreur réseau ou autre
  toast.warning("Prompt créé", {
    description: "La version initiale n'a pas pu être créée. " +
                 "Vous pouvez créer une version manuellement."
  });
} finally {
  // Toujours naviguer, même en cas d'erreur
  notifyPromptCreated(title);
  navigate('/prompts');
}
```

#### Côté Serveur (Edge Function)

**Validation stricte du JWT :** L'edge function rejette explicitement les valeurs invalides.

```typescript
// Extraction et validation stricte du JWT
const authHeader = req.headers.get('Authorization') || '';
const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

// Rejeter les valeurs invalides (vide, "undefined", "null")
if (!jwt || jwt === '' || jwt === 'undefined' || jwt === 'null') {
  console.error('Invalid or missing JWT token:', { 
    headerPresent: !!authHeader, 
    jwtValue: jwt 
  });
  return Response(401, { error: "Non authentifié" });
}

// Vérifier l'authentification avec le JWT
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);

if (authError || !user) {
  console.error('Authentication error:', authError);
  return Response(401, { error: "Non authentifié" });
}

// Erreur de permission
if (prompt.owner_id !== user.id) {
  return Response(403, { error: "Non autorisé" });
}

// Version déjà existante (idempotence)
if (existingVersion) {
  return Response(200, { success: true, skipped: true });
}

// Erreur de création
if (versionError) {
  return Response(500, { 
    success: false, 
    error: "Échec de création",
    details: versionError.message 
  });
}
```

## Garanties de Cohérence

### 1. Prompt Toujours Utilisable

Même si la version initiale échoue :
- ✅ Le prompt est créé en base
- ✅ Les variables sont sauvegardées
- ✅ L'utilisateur peut accéder au prompt
- ✅ L'utilisateur peut créer une version manuellement

### 2. Idempotence

L'edge function détecte si une version existe déjà :
```typescript
const { data: existingVersion } = await supabase
  .from('versions')
  .select('id')
  .eq('prompt_id', prompt_id)
  .eq('semver', semver)
  .maybeSingle();

if (existingVersion) {
  return { success: true, skipped: true };
}
```

**Avantage :** Retry automatique possible sans duplication

### 3. Atomicité Partielle

- Création du prompt : Transaction DB
- Sauvegarde des variables : Mutation séparée (non-bloquante)
- Création de version : Edge function avec vérifications

**Choix de Design :**
- Les variables ne sont pas critiques pour l'utilisation du prompt
- En cas d'échec, l'utilisateur peut les recréer manuellement
- La version initiale est optionnelle (peut être créée plus tard)

## Scénarios de Test

### Scénario 1 : Tout Réussit ✅

```
1. Créer prompt → ✅
2. Sauvegarder variables → ✅
3. Créer version initiale → ✅
4. Notification : "Prompt créé avec succès"
5. Navigation vers /prompts
```

### Scénario 2 : Échec Version Initiale ⚠️

```
1. Créer prompt → ✅
2. Sauvegarder variables → ✅
3. Créer version initiale → ❌
4. Notification : "Prompt créé" + "La version initiale n'a pas pu être créée"
5. Navigation vers /prompts
6. Prompt utilisable, version manquante
```

### Scénario 3 : Retry après Échec 🔄

```
1. Premier essai → Échec version initiale
2. Utilisateur ouvre le prompt
3. Utilisateur crée une version manuellement
   OU
   Edge function appelée à nouveau lors d'une mise à jour
4. Version créée avec succès
```

### Scénario 4 : Version Déjà Existante (Idempotence) 🔁

```
1. Créer prompt → ✅
2. Créer version initiale → ✅
3. Retry (network error, etc.)
4. Edge function détecte version existante
5. Retourne { success: true, skipped: true }
6. Pas de duplication
```

## Monitoring et Logging

### Logs Client

```typescript
console.log("Creating initial version via edge function");
console.log("Initial version created successfully");
console.error("Failed to create initial version:", error);
```

### Logs Serveur (Edge Function)

```typescript
console.log('Creating initial version:', { 
  prompt_id, 
  semver, 
  variablesCount 
});

console.log('Version already exists, skipping creation');

console.error('Failed to create version:', versionError);

console.log('Initial version created successfully:', { 
  versionId, 
  semver 
});
```

**Accès aux logs :** Dashboard Lovable > Fonctions > create-initial-version > Logs

## Amélioration Future : Retry Automatique

### Option 1 : Retry côté client

```typescript
const MAX_RETRIES = 3;
let retries = 0;

const createVersionWithRetry = async () => {
  try {
    return await supabase.functions.invoke('create-initial-version', ...);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      retries++;
      await new Promise(r => setTimeout(r, 1000 * retries)); // Backoff
      return createVersionWithRetry();
    }
    throw error;
  }
};
```

### Option 2 : Queue de background

```typescript
// Si échec, ajouter à une queue
await supabase
  .from('pending_operations')
  .insert({
    type: 'create_initial_version',
    prompt_id: newPrompt.id,
    payload: { ... }
  });

// Cron job traite la queue périodiquement
```

### Option 3 : Webhook

```typescript
// Trigger lors de la création d'un prompt
// Edge function appelée automatiquement
```

## Références

- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Error Handling Best Practices](https://docs.lovable.dev/tips-tricks/troubleshooting)
- [Atomicité et Transactions](https://supabase.com/docs/guides/database/transactions)

## Changelog

### Version 1.1 (Correction Régression)
- ✅ Suppression des headers Authorization manuels côté client
- ✅ Confiance au SDK Supabase pour gérer l'authentification automatiquement
- ✅ Validation stricte du JWT côté edge function (rejet de '', 'undefined', 'null')
- ✅ Tests supplémentaires : session absente, succès avec token valide
- ✅ Logging amélioré pour le debugging des problèmes d'auth
- ✅ Documentation mise à jour avec les meilleures pratiques

### Version 1.0 (Tâche 27)
- ✅ Migration de createInitialVersion vers edge function
- ✅ Gestion d'erreur non-bloquante
- ✅ Idempotence (détection des doublons)
- ✅ Vérifications de sécurité (auth, ownership)
- ✅ Logging complet
- ✅ Notifications claires à l'utilisateur
- ✅ Documentation complète
