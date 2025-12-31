# Security Findings - Ignored (False Positives)

Ce fichier documente les findings de sécurité marqués comme ignorés avec justification audit-proof.

---

## prompts_with_share_count_no_rls

| Attribut | Valeur |
|----------|--------|
| **Scanner** | `supabase_lov` |
| **Internal ID** | `prompts_with_share_count_no_rls` |
| **Date** | 2025-01-01 |
| **Statut** | Ignoré (faux positif) |

### Justification

La vue `public.prompts_with_share_count` est une **SECURITY INVOKER VIEW** (PostgreSQL 17.6).

Avec `security_invoker=true` dans `reloptions`, les privilèges et policies RLS sont évalués **au rôle appelant** (et non au propriétaire de la vue), ce qui applique automatiquement les protections RLS de la table `prompts` sous-jacente.

### Preuves vérifiées

| Vérification | Résultat |
|--------------|----------|
| `security_invoker=true` (reloptions) | Oui |
| `security_barrier=true` (reloptions) | Oui |
| `has_table_privilege('anon', 'SELECT')` | `false` |
| ACL (relacl) | `postgres`, `authenticated`, `service_role` uniquement |
| RLS sur `prompts` | Oui |
| FORCE RLS sur `prompts` | Oui |
| Fonctions SECURITY DEFINER dans la vue | Aucune |

### Anti-régression

- **CHECK 7** dans `scripts/security-gate.sql` vérifie explicitement :
  - `security_invoker=true` sur la vue
  - `anon` et `authenticated` n'ont pas `BYPASSRLS`

### Référence

- [PostgreSQL 15+ SECURITY INVOKER Views](https://www.postgresql.org/docs/current/sql-createview.html)
- `docs/RLS_PATTERNS.md` Pattern 6

---

## public_profiles_no_rls

| Attribut | Valeur |
|----------|--------|
| **Scanner** | `supabase_lov` |
| **Internal ID** | `public_profiles_no_rls` |
| **Date** | 2025-01-01 |
| **Statut** | Ignoré (faux positif) |

### Justification

La vue `public.public_profiles` est une **SECURITY INVOKER VIEW** (PostgreSQL 17.6).

Avec `security_invoker=true` dans `reloptions`, les privilèges et policies RLS sont évalués **au rôle appelant** (et non au propriétaire de la vue), ce qui applique automatiquement les protections RLS de la table `profiles` sous-jacente.

### Définition de la vue

```sql
SELECT id, pseudo, name, image, created_at
FROM profiles;
```

La vue est un simple SELECT sans fonctions ni jointures complexes.

### Preuves vérifiées

| Vérification | Résultat |
|--------------|----------|
| `security_invoker=true` (reloptions) | Oui |
| `security_barrier=true` (reloptions) | Oui |
| `has_table_privilege('anon', 'SELECT')` | `false` |
| ACL (relacl) | `postgres`, `authenticated`, `service_role` uniquement |
| RLS sur `profiles` | Oui |
| FORCE RLS sur `profiles` | Oui |
| Fonctions SECURITY DEFINER dans la vue | Aucune |

### Policies RLS sur profiles (table sous-jacente)

| Policy | Type | Rôle | Description |
|--------|------|------|-------------|
| Deny anonymous access | RESTRICTIVE ALL | anon | `false` (bloque tout) |
| Require auth for profiles select | RESTRICTIVE SELECT | authenticated | `auth.uid() IS NOT NULL` |
| Users can view only their own profile | PERMISSIVE SELECT | authenticated | `auth.uid() = id` |
| Owners can view profiles of users they shared with | PERMISSIVE SELECT | authenticated | EXISTS sur prompt_shares |
| Shared users can view profile of who shared with them | PERMISSIVE SELECT | authenticated | EXISTS sur prompt_shares |

### Anti-régression

- **CHECK 2** : Vérifie que `anon` n'a pas SELECT sur `public_profiles`
- **CHECK 3** : Vérifie qu'aucun GRANT PUBLIC n'existe sur `public_profiles`
- **CHECK 4** : Vérifie que `public_profiles` a `security_invoker=true`
- **CHECK 5** : Double-check spécifique pour `public_profiles`

Fichier : `scripts/security-gate.sql`

### Référence

- [PostgreSQL 15+ SECURITY INVOKER Views](https://www.postgresql.org/docs/current/sql-createview.html)
- `docs/RLS_PATTERNS.md` Pattern 6
