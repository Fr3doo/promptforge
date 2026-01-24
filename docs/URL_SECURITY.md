# Sécurité des URLs et Redirections

## Protection contre les Open Redirects

### Contexte

Les **Open Redirects** (redirections ouvertes) sont une vulnérabilité web permettant à un attaquant de rediriger un utilisateur vers un site malveillant en manipulant un paramètre d'URL. Cette technique est couramment utilisée pour :

- **Phishing** : rediriger vers un faux site imitant l'original
- **Vol de credentials** : capturer les identifiants sur un site piégé
- **Contournement de filtres** : utiliser la confiance dans le domaine légitime

### CVEs adressées

- **CVE-2025-68470** : React Router - Unexpected external redirect via untrusted paths
- **CVE-2026-22029** : React Router - XSS via Open Redirects

## Fonction utilitaire

### `safeRedirectPath()`

```typescript
import { safeRedirectPath } from '@/lib/urlSecurity';

// Utilisation typique après login
const redirectTo = searchParams.get('redirectTo');
navigate(safeRedirectPath(redirectTo, '/dashboard'));
```

### `isValidRedirectPath()`

```typescript
import { isValidRedirectPath } from '@/lib/urlSecurity';

// Vérification sans fallback
if (isValidRedirectPath(redirectTo)) {
  navigate(redirectTo);
} else {
  showError('Invalid redirect destination');
}
```

## Quand utiliser

| Contexte                                   | Exemple                                     |
| ------------------------------------------ | ------------------------------------------- |
| Paramètres d'URL                           | `?redirectTo=`, `?next=`, `?returnUrl=`     |
| Valeurs de formulaire                      | Champ caché `redirect` dans un form         |
| Données d'API                              | Réponse contenant une URL de redirection    |
| Cookies                                    | Cookie stockant le chemin de retour         |
| Callbacks OAuth                            | URL de callback après authentification      |
| Deep links                                 | Liens depuis emails/notifications           |

## Ce qui est bloqué

| Pattern               | Exemple                        | Raison                  |
| --------------------- | ------------------------------ | ----------------------- |
| Schéma HTTP/HTTPS     | `http://evil.com`              | Redirection externe     |
| Scheme-relative       | `//evil.com`                   | Contournement classique |
| Schémas dangereux     | `javascript:alert(1)`          | XSS                     |
| Data URLs             | `data:text/html,...`           | XSS                     |
| Chemins relatifs      | `../admin`                     | Traversée de chemin     |
| Backslash confusion   | `/\evil.com`                   | Contournement Windows   |
| Caractères de contrôle| `\n`, `\r`, `\0`               | Header injection        |

## Ce qui est autorisé

| Pattern                  | Exemple                  |
| ------------------------ | ------------------------ |
| Chemins absolus internes | `/dashboard`             |
| Avec query params        | `/prompts?id=123`        |
| Avec hash/fragment       | `/docs#section`          |
| Chemins imbriqués        | `/settings/profile`      |

## Exemples de code

### ❌ Pattern dangereux

```typescript
// DANGEREUX : aucune validation
const redirectTo = searchParams.get('redirectTo');
navigate(redirectTo || '/dashboard');

// DANGEREUX : validation insuffisante
if (redirectTo?.startsWith('/')) {
  navigate(redirectTo); // //evil.com passe ce test!
}
```

### ✅ Pattern sécurisé

```typescript
import { safeRedirectPath } from '@/lib/urlSecurity';

// SÉCURISÉ : validation complète
const redirectTo = searchParams.get('redirectTo');
navigate(safeRedirectPath(redirectTo, '/dashboard'));

// SÉCURISÉ : avec vérification explicite
import { isValidRedirectPath } from '@/lib/urlSecurity';

if (isValidRedirectPath(redirectTo)) {
  navigate(redirectTo);
} else {
  console.warn('Blocked invalid redirect:', redirectTo);
  navigate('/dashboard');
}
```

### Flow de login complet

```typescript
// pages/Auth.tsx
import { safeRedirectPath } from '@/lib/urlSecurity';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = searchParams.get('redirectTo');

  const handleLoginSuccess = async () => {
    // Naviguer de façon sécurisée avec fallback
    navigate(safeRedirectPath(redirectTo, '/dashboard'));
  };

  // Préserver redirectTo dans le lien vers signup
  return (
    <Link to={redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : '/signup'}>
      Créer un compte
    </Link>
  );
};
```

## Pattern ProtectedRoute

### Composant centralisé

Toutes les pages nécessitant une authentification utilisent le composant `ProtectedRoute` :

```typescript
import { ProtectedRoute } from "@/components/auth";

function MyPageContent() {
  // Logique de la page - user est garanti non-null ici
  const { user } = useAuth();
  return <div>...</div>;
}

const MyPage = () => (
  <ProtectedRoute>
    <MyPageContent />
  </ProtectedRoute>
);

export default MyPage;
```

### Pages protégées

| Page | Fichier | Protection |
|------|---------|------------|
| Dashboard | `src/pages/Dashboard.tsx` | `<ProtectedRoute>` |
| Prompts | `src/pages/Prompts.tsx` | `<ProtectedRoute>` |
| PromptEditor | `src/pages/PromptEditor.tsx` | `<ProtectedRoute>` |
| Settings | `src/pages/Settings.tsx` | `<ProtectedRoute>` |

### Fonctionnement

1. Vérifie `loading` et `user` via `useAuth()`
2. Affiche un spinner pendant la vérification
3. Redirige vers `/auth?redirectTo=<currentPath>` si non authentifié
4. Rend les enfants si authentifié

### Avantages

- **DRY** : Logique de protection centralisée
- **SRP** : ProtectedRoute a une seule responsabilité
- **DIP** : Dépend de l'abstraction `useAuth()`, pas de Supabase directement
- **Maintenabilité** : Modification unique pour changer le comportement

## Intégration dans l'application

### Validation post-login

`Auth.tsx` et `SignUp.tsx` utilisent `safeRedirectPath()` pour valider le paramètre avant navigation :

```typescript
const redirectTo = searchParams.get("redirectTo");
navigate(safeRedirectPath(redirectTo, "/dashboard"));
```

### Préservation entre Auth ↔ SignUp

Le paramètre `redirectTo` est automatiquement préservé dans les liens de navigation :

```typescript
// Dans Auth.tsx → vers SignUp
<Link to={redirectTo ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}` : "/signup"}>

// Dans SignUp.tsx → vers Auth
<Link to={redirectTo ? `/auth?redirectTo=${encodeURIComponent(redirectTo)}` : "/auth"}>
```

Les tests couvrent :

- ✅ Chemins internes valides (avec/sans query params et hash)
- ✅ URLs externes bloquées (http, https, scheme-relative)
- ✅ Schémas dangereux bloqués (javascript, data, vbscript)
- ✅ Tentatives de contournement (backslash, newline, null byte)
- ✅ Gestion des valeurs null/undefined/vides
- ✅ Fallback personnalisé

```bash
npm run test src/lib/__tests__/urlSecurity.test.ts
npm run test src/components/auth/__tests__/ProtectedRoute.test.tsx
```

## Défense en profondeur

Même avec cette fonction, appliquez ces principes supplémentaires :

1. **Mise à jour des dépendances** : Maintenez React Router à jour
2. **CSP Headers** : Configurez Content-Security-Policy
3. **Logs de sécurité** : Loggez les tentatives de redirection bloquées
4. **Rate limiting** : Limitez les tentatives de manipulation

## Références

- [OWASP - Unvalidated Redirects and Forwards](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/04-Testing_for_Client-side_URL_Redirect)
- [CWE-601: URL Redirection to Untrusted Site](https://cwe.mitre.org/data/definitions/601.html)
- [GHSA-9jcx-v3wj-wh4m](https://github.com/advisories/GHSA-9jcx-v3wj-wh4m)
- [GHSA-2w69-qvjg-hvjx](https://github.com/advisories/GHSA-2w69-qvjg-hvjx)
