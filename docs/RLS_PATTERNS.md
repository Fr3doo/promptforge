# Patterns RLS du Projet

## Vue d'ensemble

Ce document décrit les patterns de Row-Level Security (RLS) utilisés dans le projet pour sécuriser l'accès aux données.

### Statistiques actuelles

| Métrique | Valeur |
|----------|--------|
| Tables protégées | 8 |
| Policies totales | 35 |
| Policies `anon` | 8 (blocage) |
| Policies `authenticated` | 27 (contrôle d'accès) |
| Policies `public` | 0 (sécurité renforcée) |
| Tables avec Force RLS | 7 (toutes sauf `prompt_usage`) |
| Privilèges `anon` révoqués | 8 tables + séquences |

### Tables protégées

- `profiles` - Profils utilisateurs
- `prompts` - Prompts créés par les utilisateurs
- `prompt_shares` - Partages de prompts
- `prompt_usage` - Statistiques d'utilisation
- `user_roles` - Rôles des utilisateurs
- `variable_sets` - Ensembles de variables
- `variables` - Variables des prompts
- `versions` - Versions des prompts

---

## Architecture de sécurité

```mermaid
flowchart TD
    A[Requête entrante] --> B{Rôle PostgreSQL?}
    B -->|anon| C[❌ Blocage total]
    B -->|authenticated| D{Type de policy?}
    
    D -->|Direct Ownership| E[auth.uid = owner_id]
    D -->|Inherited| F[EXISTS sur table parent]
    D -->|Multi-Level| G[Conditions combinées]
    D -->|Role-Based| H[has_role function]
    
    E --> I[✅ Accès accordé]
    F --> I
    G --> I
    H --> I
    
    C --> J[🚫 Accès refusé]
    
    style C fill:#ff6b6b
    style I fill:#51cf66
    style J fill:#ff6b6b
```

---

## Pattern 1 : Deny Anonymous Access

### Description

Bloque **tout accès** pour les utilisateurs non authentifiés. Ce pattern est la première ligne de défense et doit être appliqué sur **toutes les tables** contenant des données utilisateur.

### Caractéristiques

- Rôle cible : `anon`
- Opération : `ALL` (SELECT, INSERT, UPDATE, DELETE)
- Condition : `USING (false)` - toujours faux

### Exemple SQL

```sql
CREATE POLICY "Deny anonymous access to [table_name]"
ON public.[table_name]
FOR ALL
TO anon
USING (false);
```

### Tables concernées

Toutes les 8 tables du projet ont cette policy :

| Table | Policy |
|-------|--------|
| `profiles` | Deny anonymous access to profiles |
| `prompts` | Deny anonymous access to prompts |
| `prompt_shares` | Deny anonymous access to prompt_shares |
| `prompt_usage` | Deny anonymous access to prompt_usage |
| `user_roles` | Deny anonymous access to user_roles |
| `variable_sets` | Deny anonymous access to variable_sets |
| `variables` | Deny anonymous access to variables |
| `versions` | Deny anonymous access to versions |

### Pourquoi `TO anon` et pas `TO public` ?

Le rôle `public` en PostgreSQL est un rôle spécial dont **tous les autres rôles héritent**. Une policy `TO public` s'appliquerait donc aussi aux utilisateurs `authenticated`, ce qui n'est pas le comportement souhaité.

```mermaid
graph TD
    A[public role] --> B[anon]
    A --> C[authenticated]
    
    style A fill:#ffd43b
    style B fill:#ff6b6b
    style C fill:#51cf66
```

---

## Pattern 2 : Direct Ownership

### Description

Contrôle d'accès basé sur la **propriété directe** de la ressource. L'utilisateur peut accéder uniquement aux lignes qu'il possède.

### Colonnes utilisées

| Colonne | Tables |
|---------|--------|
| `id` | `profiles` (id = auth.uid()) |
| `owner_id` | `prompts` |
| `user_id` | `prompt_shares`, `prompt_usage`, `user_roles` |

### Exemple SQL

```sql
-- Lecture de ses propres prompts
CREATE POLICY "Users can view own prompts"
ON public.prompts
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Modification de son propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### Diagramme

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant DB as Base de données
    participant RLS as Policy RLS
    
    U->>DB: SELECT * FROM prompts
    DB->>RLS: Vérifier owner_id = auth.uid()
    RLS-->>DB: Filtrer les lignes
    DB-->>U: Retourner uniquement ses prompts
```

---

## Pattern 3 : Permission Inheritance

### Description

Les tables enfants **héritent des permissions** de leur table parent via une jointure `EXISTS`. Ce pattern évite la duplication de logique de permissions.

### Hiérarchie des tables

```mermaid
graph TD
    P[prompts] --> V[versions]
    P --> VAR[variables]
    P --> VS[variable_sets]
    P --> PS[prompt_shares]
    P --> PU[prompt_usage]
    
    style P fill:#339af0
    style V fill:#51cf66
    style VAR fill:#51cf66
    style VS fill:#51cf66
    style PS fill:#ffd43b
    style PU fill:#ffd43b
```

### Exemple SQL

```sql
-- Les versions héritent des permissions du prompt parent
CREATE POLICY "Users can view versions of accessible prompts"
ON public.versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.prompts p
    WHERE p.id = versions.prompt_id
    AND (
      p.owner_id = auth.uid()
      OR (p.visibility = 'SHARED' AND p.status = 'PUBLISHED')
      OR EXISTS (
        SELECT 1 FROM public.prompt_shares ps
        WHERE ps.prompt_id = p.id
        AND ps.shared_with_user_id = auth.uid()
      )
    )
  )
);
```

### Tables utilisant ce pattern

| Table enfant | Table parent | Colonne de liaison |
|--------------|--------------|-------------------|
| `versions` | `prompts` | `prompt_id` |
| `variables` | `prompts` | `prompt_id` |
| `variable_sets` | `prompts` | `prompt_id` |
| `prompt_shares` | `prompts` | `prompt_id` |
| `prompt_usage` | `prompts` | `prompt_id` |

---

## Pattern 4 : Multi-Level Access

### Description

Combine plusieurs conditions pour déterminer le niveau d'accès. Utilisé principalement pour la table `prompts` qui supporte différents modes de partage.

### Niveaux d'accès

```mermaid
flowchart TD
    A[Requête d'accès] --> B{Est propriétaire?}
    B -->|Oui| C[✅ Accès total]
    B -->|Non| D{Partage privé?}
    D -->|Oui| E{Permission?}
    E -->|READ| F[✅ Lecture seule]
    E -->|WRITE| G[✅ Lecture + Écriture]
    D -->|Non| H{Partage public?}
    H -->|visibility=SHARED| I{public_permission?}
    I -->|READ| J[✅ Lecture seule]
    I -->|WRITE| K[✅ Lecture + Écriture]
    H -->|Non| L[❌ Accès refusé]
    
    style C fill:#51cf66
    style F fill:#74c0fc
    style G fill:#51cf66
    style J fill:#74c0fc
    style K fill:#51cf66
    style L fill:#ff6b6b
```

### Exemple SQL

```sql
CREATE POLICY "Users can view accessible prompts"
ON public.prompts
FOR SELECT
TO authenticated
USING (
  -- Niveau 1: Propriétaire
  owner_id = auth.uid()
  OR
  -- Niveau 2: Partage public (SHARED + PUBLISHED)
  (visibility = 'SHARED' AND status = 'PUBLISHED')
  OR
  -- Niveau 3: Partage privé
  EXISTS (
    SELECT 1 FROM public.prompt_shares ps
    WHERE ps.prompt_id = prompts.id
    AND ps.shared_with_user_id = auth.uid()
  )
);
```

### Matrice des permissions pour `prompts`

| Condition | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| `owner_id = auth.uid()` | ✅ | ✅ | ✅ | ✅ |
| Partage privé READ | ✅ | ❌ | ❌ | ❌ |
| Partage privé WRITE | ✅ | ❌ | ✅ | ❌ |
| Partage public READ | ✅ | ❌ | ❌ | ❌ |
| Partage public WRITE | ✅ | ❌ | ✅ | ❌ |
| Aucun accès | ❌ | ❌ | ❌ | ❌ |

---

## Pattern 5 : Role-Based Access (SECURITY DEFINER)

### Description

Utilise une fonction `SECURITY DEFINER` pour vérifier les rôles utilisateur sans provoquer de **récursion infinie** dans les policies RLS.

### Problème de récursion

```mermaid
flowchart TD
    A[Policy sur user_roles] --> B[Vérifie user_roles]
    B --> A
    
    style A fill:#ff6b6b
    style B fill:#ff6b6b
```

Une policy RLS sur `user_roles` qui interroge `user_roles` créerait une boucle infinie.

### Solution : SECURITY DEFINER

```sql
-- Fonction qui bypass RLS grâce à SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy utilisant la fonction (pas de récursion)
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
```

### Caractéristiques de SECURITY DEFINER

| Attribut | Valeur | Raison |
|----------|--------|--------|
| `SECURITY DEFINER` | Obligatoire | Exécute avec les droits du créateur |
| `STABLE` | Recommandé | Résultat constant pour mêmes arguments dans une transaction |
| `SET search_path = public` | Sécurité | Évite les attaques par injection de schéma |

---

## Matrice complète des permissions

### Par table et opération

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **profiles** | Own | Own | Own | ❌ |
| **prompts** | Own + Shared + Public | Own | Own + Write | Own |
| **prompt_shares** | Own prompt | Own prompt | Own prompt | Own prompt |
| **prompt_usage** | Own prompt | Own | Own | Own |
| **user_roles** | Own + Admin | ❌ | ❌ | ❌ |
| **variable_sets** | Inherited | Write | Write | Own |
| **variables** | Inherited | Write | Write | Own |
| **versions** | Inherited | Write | Write | Own |

### Légende

- **Own** : Propriétaire uniquement (`owner_id = auth.uid()` ou `user_id = auth.uid()`)
- **Shared** : Partagé via `prompt_shares`
- **Public** : Visible publiquement (`visibility = 'SHARED'`)
- **Write** : Permission WRITE requise
- **Inherited** : Hérite des permissions du prompt parent
- **Admin** : Requiert le rôle admin

---

## Checklist pour nouvelles tables

### Étapes obligatoires

- [ ] **1. Activer RLS**
  ```sql
  ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **2. Ajouter policy "Deny anonymous access"**
  ```sql
  CREATE POLICY "Deny anonymous access to new_table"
  ON public.new_table
  FOR ALL
  TO anon
  USING (false);
  ```

- [ ] **3. Toutes les policies → `TO authenticated`**
  - ⚠️ Jamais `TO public` (héritage non souhaité)
  - ⚠️ Toujours `TO authenticated` pour les policies de contrôle d'accès

- [ ] **4. Utiliser `EXISTS` pour l'héritage**
  ```sql
  -- ✅ Correct
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts p
      WHERE p.id = new_table.prompt_id
      AND p.owner_id = auth.uid()
    )
  )
  
  -- ❌ Incorrect (JOIN dans la clause principale)
  USING (
    SELECT p.owner_id = auth.uid()
    FROM public.prompts p
    JOIN public.new_table nt ON p.id = nt.prompt_id
  )
  ```

- [ ] **5. Éviter les JOINs récursifs**
  - Si une table doit vérifier ses propres données → utiliser `SECURITY DEFINER`
  - Exemple : `has_role()` pour `user_roles`

- [ ] **6. Distinguer USING vs WITH CHECK**
  - `USING` : Filtre les lignes visibles (SELECT, UPDATE, DELETE)
  - `WITH CHECK` : Valide les nouvelles données (INSERT, UPDATE)
  ```sql
  CREATE POLICY "policy_name"
  ON public.table
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())        -- Peut modifier ses propres lignes
  WITH CHECK (owner_id = auth.uid());  -- Doit rester propriétaire après modification
  ```

- [ ] **7. Révoquer les privilèges `anon` et `public`**
  ```sql
  REVOKE ALL PRIVILEGES ON TABLE public.new_table FROM anon;
  REVOKE ALL PRIVILEGES ON TABLE public.new_table FROM public;
  ```

- [ ] **8. Révoquer les privilèges sur les séquences associées**
  ```sql
  REVOKE ALL PRIVILEGES ON SEQUENCE public.new_table_id_seq FROM anon;
  REVOKE ALL PRIVILEGES ON SEQUENCE public.new_table_id_seq FROM public;
  ```

- [ ] **9. Activer FORCE RLS pour les tables critiques (rôles, permissions)**
  ```sql
  -- Uniquement pour les tables ultra-sensibles comme user_roles
  ALTER TABLE public.new_table FORCE ROW LEVEL SECURITY;
  ```

### Tests obligatoires

- [ ] **Test 1 : Accès anonyme bloqué**
  ```typescript
  // Sans session utilisateur
  const { data, error } = await supabase
    .from('new_table')
    .select('*');
  expect(data).toEqual([]);
  ```

- [ ] **Test 2 : Accès cross-user bloqué**
  ```typescript
  // Utilisateur A ne voit pas les données de B
  const { data } = await supabaseAsUserA
    .from('new_table')
    .select('*')
    .eq('owner_id', userB.id);
  expect(data).toEqual([]);
  ```

- [ ] **Test 3 : Modification cross-user bloquée**
  ```typescript
  const { error } = await supabaseAsUserA
    .from('new_table')
    .update({ ... })
    .eq('id', recordOwnedByUserB);
  expect(error).toBeDefined();
  ```

---

## Pattern 6 : Views with security_invoker

### Description

Les vues PostgreSQL peuvent contourner la RLS si elles s'exécutent avec les droits du propriétaire. L'option `security_invoker = true` force la vue à respecter la RLS du **caller** (appelant).

### Configuration recommandée

```sql
-- Création d'une vue sécurisée
CREATE VIEW public.prompts_with_share_count
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  p.*,
  count(ps.id) as share_count
FROM public.prompts p
LEFT JOIN public.prompt_shares ps ON p.id = ps.prompt_id
GROUP BY p.id;
```

### Options de sécurité

| Option | Effet |
|--------|-------|
| `security_invoker = true` | La vue s'exécute avec les droits de l'appelant (RLS respectée) |
| `security_barrier = true` | Empêche les optimisations de requête de contourner les conditions de sécurité |

### Comportement du `share_count`

**Important** : Le `share_count` dans `prompts_with_share_count` est **filtré par RLS** :

- **Pour l'owner** : Voit le count de tous ses partages (car `shared_by = owner`)
- **Pour un destinataire** : Voit uniquement 1 (son propre partage), même si le prompt a été partagé à 10 personnes

Ce comportement est **intentionnel** : il évite de révéler la diffusion totale du prompt aux non-propriétaires.

### Principe du moindre privilège pour les vues

En plus de `security_invoker`, il est recommandé de :

1. **Révoquer les GRANT inutiles** sur les tables source
2. **Ne pas exposer `content`** dans les vues "liste" (préférer une route dédiée pour le détail)

```sql
-- Retirer les GRANT inutiles (même si RLS bloque)
REVOKE SELECT ON TABLE public.prompt_shares FROM anon;
REVOKE ALL ON TABLE public.prompt_shares FROM public;
```

### Anti-régression : CHECK CI pour les vues

Le risque principal avec les vues `security_invoker` est la **régression silencieuse** : un `CREATE OR REPLACE VIEW` (via UI, migration, ou refactor) peut recréer la vue **sans** l'option `security_invoker=true`, rendant l'accès potentiellement plus permissif que prévu.

#### Protection CI

Le fichier `scripts/security-gate.sql` inclut un CHECK dédié (CHECK 7) qui :

1. Vérifie que la vue existe
2. Valide `security_invoker=true` dans `reloptions`
3. Vérifie que `anon` et `PUBLIC` ne peuvent pas `SELECT`
4. Vérifie que `anon` et `authenticated` n'ont pas `BYPASSRLS`
5. Log le statut de `security_barrier` (optionnel, trade-off perf)

Extrait :
```sql
IF NOT invoker_ok THEN
  RAISE EXCEPTION 'SECURITY GATE FAILED: prompts_with_share_count missing security_invoker=true';
END IF;
```

#### Scanners de sécurité et faux positifs

Certains scanners (notamment LLM-based) utilisent une heuristique simpliste :

- "Vue sans policies RLS directes" → "Vue non sécurisée"

Cette heuristique est **incorrecte** pour PostgreSQL car :

- Les vues n'ont pas de "policies RLS" au sens table
- Le mécanisme correct est `security_invoker=true` + RLS/Force RLS sur les tables de base

En cas d'alerte sur une vue :

1. Vérifier les accès réels avec `has_table_privilege()`
2. Vérifier `reloptions` pour `security_invoker`
3. Documenter le faux positif avec preuves SQL
4. S'assurer que le CHECK CI empêche toute régression

---

## Pattern 7 : Privilege Hardening (Défense en profondeur)

### Description

La RLS est la **première ligne de défense**, mais les privilèges PostgreSQL (GRANT/REVOKE) constituent une **deuxième couche de protection**. Ce pattern applique le principe du **moindre privilège** : même si RLS bloque, on retire les GRANT inutiles.

### Pourquoi c'est important

- **Réduction de la surface d'attaque** : Un GRANT existe = une porte potentielle
- **Protection contre les régressions** : Une policy mal modifiée + GRANT = fuite
- **Audit simplifié** : Moins de "faux positifs" des scanners de sécurité
- **Defense in depth** : RLS (ceinture) + REVOKE (bretelles)

### Configuration recommandée

#### Étape 1 : Révoquer tous les privilèges `anon` et `public`

```sql
-- Pour chaque table sensible
REVOKE ALL PRIVILEGES ON TABLE public.table_name FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.table_name FROM public;
```

#### Étape 2 : Révoquer les privilèges sur les séquences

```sql
-- Les séquences peuvent révéler des informations (nombres de lignes, patterns)
DO $$
DECLARE s record;
BEGIN
  FOR s IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM anon', 
                   s.sequence_schema, s.sequence_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE %I.%I FROM public', 
                   s.sequence_schema, s.sequence_name);
  END LOOP;
END$$;
```

#### Étape 3 : Activer FORCE RLS sur les tables critiques

```sql
-- FORCE RLS empêche le table owner de bypass les policies
-- ⚠️ IMPORTANT: Ne protège PAS contre les rôles BYPASSRLS (postgres, service_role)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_shares FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variables FORCE ROW LEVEL SECURITY;
ALTER TABLE public.versions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variable_sets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;
```

### ⚠️ Limitation importante : BYPASSRLS

**FORCE RLS ne protège PAS contre** :
- Les **superusers** PostgreSQL
- Les rôles avec l'attribut **BYPASSRLS** (`postgres`, `service_role`, `supabase_admin`)

```sql
-- Rôles qui bypass toujours RLS (même avec FORCE)
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolbypassrls = true;
-- Résultat: postgres, service_role, supabase_admin, supabase_read_only_user
```

**Implication** : Si la clé `service_role` fuit, FORCE RLS ne protège pas les données.

### Tables avec privilèges durcis

| Table | anon SELECT | anon DML | public | Force RLS |
|-------|-------------|----------|--------|-----------|
| `profiles` | ❌ | ❌ | ❌ | ✅ |
| `prompts` | ❌ | ❌ | ❌ | ✅ |
| `prompt_shares` | ❌ | ❌ | ❌ | ✅ |
| `prompt_usage` | ❌ | ❌ | ❌ | ❌ |
| `user_roles` | ❌ | ❌ | ❌ | ✅ |
| `variable_sets` | ❌ | ❌ | ❌ | ✅ |
| `variables` | ❌ | ❌ | ❌ | ✅ |
| `versions` | ❌ | ❌ | ❌ | ✅ |

### Rollback FORCE RLS

En cas de problème (signup cassé, création de profil bloquée) :

```sql
-- Désactiver FORCE RLS sur une table
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompts NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_shares NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variables NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.versions NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.variable_sets NO FORCE ROW LEVEL SECURITY;
```

### Diagramme de défense en profondeur

```mermaid
flowchart TD
    A[Requête anon] --> B{GRANT existe?}
    B -->|Non| C[🛡️ Bloqué par privilèges]
    B -->|Oui| D{RLS activée?}
    D -->|Oui| E{Policy permet?}
    E -->|Non| F[🛡️ Bloqué par RLS]
    E -->|Oui| G[⚠️ Accès accordé]
    D -->|Non| H[⚠️ Accès accordé]
    
    style C fill:#51cf66
    style F fill:#74c0fc
    style G fill:#ffd43b
    style H fill:#ff6b6b
```

### Vérification post-durcissement

```sql
-- Vérifier qu'anon n'a plus aucun privilège
SELECT 
  'table_name' as tbl,
  has_table_privilege('anon', 'public.table_name', 'select') as anon_select,
  has_table_privilege('anon', 'public.table_name', 'insert') as anon_insert,
  has_table_privilege('anon', 'public.table_name', 'update') as anon_update,
  has_table_privilege('anon', 'public.table_name', 'delete') as anon_delete;
-- Tous doivent retourner FALSE
```

---

## Audit de sécurité

### Requêtes d'audit des privilèges

#### Vérifier les privilèges anon sur toutes les tables

```sql
SELECT 
  c.relname as table_name,
  has_table_privilege('anon', c.oid, 'select') as anon_select,
  has_table_privilege('anon', c.oid, 'insert') as anon_insert,
  has_table_privilege('anon', c.oid, 'update') as anon_update,
  has_table_privilege('anon', c.oid, 'delete') as anon_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
ORDER BY c.relname;
```

#### Vérifier le statut RLS de toutes les tables

```sql
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
ORDER BY c.relname;
```

#### Vérifier les privilèges sur les vues

```sql
SELECT 
  c.relname as view_name,
  has_table_privilege('anon', c.oid, 'select') as anon_select,
  has_table_privilege('authenticated', c.oid, 'select') as auth_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'v'
ORDER BY c.relname;
```

#### Audit complet des policies par table

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Références

- [SHARING_GUIDE.md](./SHARING_GUIDE.md) - Guide complet du système de partage
- [VARIABLE_UPSERT_SECURITY.md](./VARIABLE_UPSERT_SECURITY.md) - Contraintes de sécurité DB
- [REPOSITORY_PATTERNS.md](./REPOSITORY_PATTERNS.md) - Patterns d'accès aux données
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

## Tests de régression obligatoires

Avant de considérer FORCE RLS comme validé, tester :

- [ ] **Signup** → Profil créé correctement via `handle_new_user`
- [ ] **Login** → Accès aux données personnelles
- [ ] **Création de prompt** → INSERT OK
- [ ] **Partage de prompt** → `prompt_shares` INSERT OK
- [ ] **Variables** → CRUD OK sur `variables`, `variable_sets`
- [ ] **Versions** → Création et lecture OK

### Fonctions SECURITY DEFINER à surveiller

```sql
-- Lister les fonctions SECURITY DEFINER qui peuvent être impactées
SELECT n.nspname, p.proname, r.rolname as owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname IN ('public', 'auth')
  AND p.prosecdef = true
ORDER BY n.nspname, p.proname;
```

**Note** : `handle_new_user` est owned par `postgres` (BYPASSRLS) donc non impacté.

---

## Pattern 8 : CI/CD Security Gate avec has_table_privilege()

### Description

Utilise `has_table_privilege()` pour des preuves booléennes robustes plutôt que de parser les GRANT/ACL manuellement. Ce pattern est conçu pour être exécuté en CI à chaque déploiement.

### Pourquoi has_table_privilege() ?

| Méthode | Fiabilité | Raison |
|---------|-----------|--------|
| `information_schema.role_table_grants` | ⚠️ Moyenne | Peut manquer les héritages de rôles |
| `pg_class.relacl` (ACL) | ⚠️ Moyenne | Nécessite parsing, peut manquer PUBLIC |
| `has_table_privilege()` | ✅ Haute | Booléen direct, inclut héritages |

### Requêtes CI/CD Security Gate

#### 1. Vérifier qu'anon n'a aucun privilège

```sql
-- DOIT retourner 0 lignes, sinon FAIL CI
SELECT 
  c.relname as object_name,
  c.relkind as kind,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_insert,
  has_table_privilege('anon', c.oid, 'UPDATE') as anon_update,
  has_table_privilege('anon', c.oid, 'DELETE') as anon_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'v')
  AND (
    has_table_privilege('anon', c.oid, 'SELECT') = true
    OR has_table_privilege('anon', c.oid, 'INSERT') = true
    OR has_table_privilege('anon', c.oid, 'UPDATE') = true
    OR has_table_privilege('anon', c.oid, 'DELETE') = true
  )
ORDER BY c.relname;
```

#### 2. Vérifier qu'aucun GRANT PUBLIC n'existe

```sql
-- DOIT retourner 0 lignes, sinon FAIL CI
-- PUBLIC grants sont représentés par '=' dans ACL
SELECT 
  c.relname as object_name,
  c.relkind as kind,
  array_to_string(c.relacl, ', ') as acl
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'v')
  AND EXISTS (
    SELECT 1 
    FROM unnest(c.relacl) as acl 
    WHERE acl::text LIKE '=%'
  )
ORDER BY c.relname;
```

#### 3. Vérifier security_invoker sur les vues

```sql
-- DOIT retourner 0 lignes, sinon FAIL CI
SELECT 
  c.relname as view_name,
  pg_get_viewdef(c.oid) as definition
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'v'
  AND NOT EXISTS (
    SELECT 1 
    FROM pg_options_to_table(c.reloptions) 
    WHERE option_name = 'security_invoker' 
      AND option_value = 'true'
  )
ORDER BY c.relname;
```

#### 4. Audit complet de sécurité

```sql
-- Résumé de tous les paramètres de sécurité
SELECT 
  c.relname as object_name,
  CASE c.relkind WHEN 'r' THEN 'table' WHEN 'v' THEN 'view' END as type,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
  has_table_privilege('PUBLIC', c.oid, 'SELECT') as public_select,
  CASE 
    WHEN c.relkind = 'v' THEN (
      SELECT option_value 
      FROM pg_options_to_table(c.reloptions) 
      WHERE option_name = 'security_invoker'
    )
    ELSE NULL
  END as security_invoker
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'v')
ORDER BY c.relkind, c.relname;
```

### Fichier de test TypeScript

Voir `src/repositories/__tests__/SecurityPrivilegeRegression.test.ts` pour les tests unitaires correspondants.

### Intégration CI/CD

```yaml
# Exemple GitHub Actions
security-check:
  runs-on: ubuntu-latest
  steps:
    - name: Check anon privileges
      run: |
        result=$(psql $DATABASE_URL -t -c "SELECT count(*) FROM (...) WHERE has_anon_access")
        if [ "$result" -gt 0 ]; then
          echo "SECURITY VIOLATION: anon has privileges on protected objects"
          exit 1
        fi
```

---

## Pattern 9 : Audit des vues avec preuves factuelles

### Description

Ce pattern définit la **méthodologie d'audit exhaustive** pour valider qu'une vue ne fuit pas de données. Il répond aux faux-positifs des scanners qui détectent "vue + PII" sans vérifier les privilèges effectifs.

### ⚠️ CRITIQUE : Les tests JavaScript mockés NE FONCTIONNENT PAS

**Les tests unitaires JavaScript avec `vi.fn()` ou `jest.fn()` ne vérifient RIEN en matière de sécurité :**

```typescript
// ❌ CE TEST NE PROUVE RIEN - IL TESTE DU CODE JS, PAS LA DB
const mockSupabase = { rpc: vi.fn().mockResolvedValue({ data: false }) };
expect(mockSupabase.rpc('has_table_privilege', ...)).resolves.toEqual({ data: false });
// Le mock retourne ce qu'on lui dit, pas la réalité !
```

**Pourquoi c'est dangereux :**
- Un mock retourne ce que vous programmez, pas la réalité de la base de données
- Donne un faux sentiment de sécurité
- Ne détecte pas les régressions réelles

**Solution : exécuter du vrai SQL en CI via psql/Supabase CLI.**

Voir `scripts/security-gate.sql` pour l'implémentation.

### Pourquoi ce pattern ?

Les scanners de sécurité confondent souvent :
- "Je vois une vue avec des colonnes PII" ≠ "anon peut lire ces données"
- "Pas de GRANT explicite visible" ≠ "Pas d'accès effectif"

La **seule preuve robuste** est `has_table_privilege()` + vérification du pseudo-rôle `PUBLIC`.

### ⚠️ Pièges courants

| Piège | Risque | Solution |
|-------|--------|----------|
| **Tests mockés JS** | Ne testent pas la DB réelle | Utiliser `scripts/security-gate.sql` |
| Ignorer `PUBLIC` | `PUBLIC` est hérité par tous les rôles | Vérifier `grantee=0` dans ACL |
| Parser les GRANT affichés | Manque les héritages de rôles | Utiliser `has_table_privilege()` |
| Croire que RLS protège la vue | Les vues peuvent bypass RLS | Vérifier `security_invoker=true` |
| Oublier `security_barrier` | Optimizer peut leaker via predicates | Vérifier `security_barrier=true` |

### Intégration CI/CD

Le script `scripts/security-gate.sql` exécute automatiquement toutes les vérifications :

```bash
# Dans le pipeline CI (voir .github/workflows/security-scan.yml)
psql $DATABASE_URL -f scripts/security-gate.sql
```

Le script échoue si :
- `anon` a SELECT sur un objet protégé
- `PUBLIC` (grantee=0) a des grants
- Une vue n'a pas `security_invoker=true`

### Requêtes d'audit obligatoires

#### 1. Privilèges effectifs (PREUVE PRINCIPALE)

```sql
SELECT 
  has_table_privilege('anon', 'public.VIEW_NAME', 'SELECT') as anon_select,
  has_table_privilege('authenticated', 'public.VIEW_NAME', 'SELECT') as auth_select,
  has_schema_privilege('anon', 'public', 'USAGE') as anon_schema_usage;
```

**Interprétation :**
- `anon_select=false` : ✅ anon ne peut pas lire
- `auth_select=true` : ✅ attendu pour vues user-facing
- `anon_schema_usage=true` : ⚠️ normal, mais `anon_select` doit être `false`

#### 2. Vérification PUBLIC pseudo-role (ACL)

```sql
SELECT 
  a.grantee,
  r.rolname as grantee_name,
  a.privilege_type
FROM (
  SELECT 
    (aclexplode(relacl)).grantee,
    (aclexplode(relacl)).privilege_type
  FROM pg_class 
  WHERE relname = 'VIEW_NAME'
) a
LEFT JOIN pg_roles r ON r.oid = a.grantee;
```

**Interprétation :**
- Si `grantee=0` (ou `grantee_name=NULL`) apparaît : ❌ FUITE - `PUBLIC` a un grant
- Seuls `postgres`, `authenticated`, `service_role` attendus : ✅

#### 3. Configuration de la vue

```sql
SELECT 
  c.relname as view_name,
  (SELECT option_value FROM pg_options_to_table(c.reloptions) 
   WHERE option_name = 'security_invoker') as security_invoker,
  (SELECT option_value FROM pg_options_to_table(c.reloptions) 
   WHERE option_name = 'security_barrier') as security_barrier
FROM pg_class c 
WHERE c.relname = 'VIEW_NAME';
```

**Interprétation :**
- `security_invoker=true` : ✅ RLS des tables sous-jacentes appliquée
- `security_barrier=true` : ✅ Protection contre les leaks via optimizer

### Exemple complet : Audit `public_profiles`

```sql
-- Requête combinée pour audit complet
SELECT 
  'public_profiles' as view_name,
  has_table_privilege('anon', 'public.public_profiles', 'SELECT') as anon_select,
  has_table_privilege('authenticated', 'public.public_profiles', 'SELECT') as auth_select,
  (
    SELECT EXISTS (
      SELECT 1 
      FROM pg_class c, unnest(c.relacl) as acl 
      WHERE c.relname = 'public_profiles' 
        AND (aclexplode(c.relacl)).grantee = 0
    )
  ) as has_public_grant,
  (
    SELECT option_value 
    FROM pg_class c, pg_options_to_table(c.reloptions) 
    WHERE c.relname = 'public_profiles' 
      AND option_name = 'security_invoker'
  ) as security_invoker,
  (
    SELECT option_value 
    FROM pg_class c, pg_options_to_table(c.reloptions) 
    WHERE c.relname = 'public_profiles' 
      AND option_name = 'security_barrier'
  ) as security_barrier;
```

**Résultat attendu :**

| Column | Value | Status |
|--------|-------|--------|
| anon_select | false | ✅ |
| auth_select | true | ✅ |
| has_public_grant | false | ✅ |
| security_invoker | true | ✅ |
| security_barrier | true | ✅ |

### Template pour ignore reason d'un finding

Quand vous marquez un finding comme faux-positif, incluez :

```markdown
FAUX-POSITIF CONFIRMÉ par audit SQL exhaustif (DATE).

## Preuves factuelles

### 1. Privilèges effectifs (has_table_privilege)
[Requête SQL exécutée]
Résultat: anon_select=FALSE, auth_select=TRUE

### 2. Vérification PUBLIC pseudo-role (ACL)
[Requête SQL exécutée]
Résultat: grantee=0 ABSENT, seuls postgres/authenticated/service_role

### 3. Configuration vue
[Requête SQL exécutée]
Résultat: security_invoker=true, security_barrier=true

## Conclusion
- anon n'a PAS de SELECT effectif
- PUBLIC n'a PAS de GRANT explicite
- security_invoker force la RLS
```

### Fichiers de référence

| Fichier | Contenu |
|---------|---------|
| `scripts/security-gate.sql` | Script SQL exécutable en CI - **source de vérité** |
| `src/lib/security-gate-queries.ts` | Export des requêtes SQL pour documentation |
| `.github/workflows/security-scan.yml` | Workflow CI qui exécute le script |

**Important :** Les tests mockés dans `src/repositories/__tests__/` ne sont PAS des preuves de sécurité.

### Diagramme de décision

```mermaid
flowchart TD
    A[Scanner signale: vue + PII] --> B{has_table_privilege anon SELECT?}
    B -->|true| C[❌ FUITE RÉELLE]
    B -->|false| D{PUBLIC a un GRANT?}
    D -->|Oui, grantee=0| E[❌ FUITE via PUBLIC]
    D -->|Non| F{security_invoker=true?}
    F -->|Non| G[⚠️ RISQUE: vue peut bypass RLS]
    F -->|Oui| H[✅ FAUX-POSITIF CONFIRMÉ]
    
    style C fill:#ff6b6b
    style E fill:#ff6b6b
    style G fill:#ffd43b
    style H fill:#51cf66
```

---

## Historique des modifications

| Date | Modification |
|------|--------------|
| 2025-01-23 | Création du document |
| 2025-01-23 | Correction policies `public` → `anon` |
| 2025-12-23 | Ajout Pattern 6 : Views avec security_invoker + documentation share_count |
| 2025-12-23 | Ajout Pattern 7 : Privilege Hardening + REVOKE anon/public + FORCE RLS user_roles |
| 2025-12-23 | Ajout section Audit de sécurité avec requêtes SQL |
| 2025-12-23 | Mise à jour checklist avec étapes 7-9 (REVOKE + FORCE RLS) |
| 2025-12-23 | FORCE RLS activé sur 7 tables (profiles, prompts, prompt_shares, variables, versions, variable_sets, user_roles) |
| 2025-12-23 | Ajout avertissement BYPASSRLS + scripts rollback + checklist régression |
| 2025-12-23 | Ajout Pattern 8 : CI/CD Security Gate avec has_table_privilege() + tests regression |
| 2025-12-24 | Ajout Pattern 9 : Audit des vues avec preuves factuelles (méthodologie + pièges + template ignore reason) |
| 2025-12-25 | Ajout avertissement tests mockés + refonte vers script SQL CI (`scripts/security-gate.sql`) |
