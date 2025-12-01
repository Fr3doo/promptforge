# Migration AuthContext - Phase 1 à 8

## 📋 Vue d'ensemble

Cette documentation récapitule la migration complète de l'architecture d'authentification vers un système centralisé basé sur `AuthContext`, réalisée en 8 phases granulaires pour garantir zéro régression.

**Objectif** : Éliminer la duplication de l'état d'authentification à travers l'application et centraliser la gestion dans un contexte unique avec support explicite du `loading` state.

**Résultat** : Architecture SOLID, testable, avec élimination des bugs de désynchronisation et des faux états read-only dans l'éditeur de prompts.

---

## 🏗️ Architecture Finale

### Composants de l'architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AppProviders                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │         AuthRepositoryProvider                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │         AuthContextProvider                 │  │  │
│  │  │  - Gère user, session, loading              │  │  │
│  │  │  - Écoute onAuthStateChange                 │  │  │
│  │  │  - Appelle getCurrentSession au montage     │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │       UserBootstrapWrapper                  │  │  │
│  │  │  - Invoque useNewUserBootstrap              │  │  │
│  │  │  - Crée templates pour nouveaux users       │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │    Autres providers (Prompt, Variable...)   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                    Application
                (useAuth() disponible)
```

### Fichiers clés

| Fichier | Responsabilité |
|---------|----------------|
| `src/contexts/AuthContext.tsx` | Contexte centralisé avec `AuthContextProvider` et `useAuthContext` |
| `src/hooks/useAuth.tsx` | Hook public simple qui retourne `useAuthContext()` |
| `src/hooks/useNewUserBootstrap.ts` | Hook métier pour initialiser les templates nouveaux users |
| `src/providers/UserBootstrapWrapper.tsx` | Wrapper qui invoque `useNewUserBootstrap` dans l'arbre des providers |
| `src/providers/AppProviders.tsx` | Intégration de `AuthContextProvider` et `UserBootstrapWrapper` |
| `src/components/Header.tsx` | Consomme `loading` pour afficher skeleton pendant l'init |

---

## 🔧 Responsabilités des composants

### 1. `AuthContext.tsx` - Contexte centralisé

**Responsabilité** : Gérer l'état d'authentification global pour toute l'application.

**État exposé** :
```typescript
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
}
```

**Comportement** :
- ✅ Appelle `authRepository.onAuthStateChange()` une seule fois au montage
- ✅ Appelle `authRepository.getCurrentSession()` une seule fois au montage
- ✅ Met à jour `user`, `session` selon les événements auth (SIGNED_IN, SIGNED_OUT, etc.)
- ✅ Passe `loading` de `true` à `false` après `getCurrentSession`
- ✅ Utilise guard `isMounted` pour éviter les updates après unmount
- ✅ Unsubscribe du listener au démontage
- ❌ Ne gère **PAS** la logique métier (création templates, etc.)

**Exemple d'usage** :
```typescript
export function AuthContextProvider({ children }: { children: ReactNode }) {
  const authRepository = useAuthRepository();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const subscription = authRepository.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    authRepository.getCurrentSession().then((initialSession) => {
      if (!isMounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe?.();
    };
  }, [authRepository]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

### 2. `useAuth.tsx` - Hook public

**Responsabilité** : Interface publique pour accéder à l'état d'authentification.

**Comportement** :
- ✅ Retourne directement `useAuthContext()`
- ✅ Throw error si utilisé hors d'un `AuthContextProvider`
- ❌ Ne crée **AUCUN** état local
- ❌ Ne gère **AUCUN** listener `onAuthStateChange`

**Code simplifié** :
```typescript
export function useAuth() {
  return useAuthContext();
}
```

**Avant la migration** : `useAuth` créait son propre état local et écoutait `onAuthStateChange`, causant duplication et désynchronisation.

**Après la migration** : `useAuth` est un simple proxy vers le contexte centralisé.

---

### 3. `useNewUserBootstrap.ts` - Hook métier

**Responsabilité** : Initialiser les templates d'exemple pour les nouveaux utilisateurs.

**Comportement** :
- ✅ Écoute les changements de `user` et `loading` depuis `useAuth()`
- ✅ Skip si `loading === true`
- ✅ Skip si `user === null`
- ✅ Utilise `useRef` pour éviter les initialisations multiples
- ✅ Réinitialise si l'utilisateur change (nouveau `user.id`)
- ✅ Appelle `TemplateInitializationService.createTemplatesForNewUser()`
- ✅ Gère les erreurs gracieusement avec `logError`
- ✅ Utilise `setTimeout(initializeUser, 0)` pour éviter deadlock Supabase

**Exemple d'usage** :
```typescript
export function useNewUserBootstrap() {
  const { user, loading } = useAuth();
  const promptRepository = usePromptRepository();
  const variableRepository = useVariableRepository();
  const hasInitialized = useRef(false);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      hasInitialized.current = false;
      previousUserId.current = null;
      return;
    }
    if (hasInitialized.current && previousUserId.current === user.id) {
      return;
    }

    const initializeUser = async () => {
      hasInitialized.current = true;
      previousUserId.current = user.id;
      
      try {
        const templateService = new TemplateInitializationService(
          promptRepository,
          variableRepository,
          new SupabaseVariableSetRepository()
        );
        await templateService.createTemplatesForNewUser(user.id);
      } catch (error) {
        logError('Error creating example templates', { userId: user.id, error });
      }
    };

    setTimeout(initializeUser, 0);
  }, [user, loading, promptRepository, variableRepository]);
}
```

---

### 4. `UserBootstrapWrapper.tsx` - Wrapper component

**Responsabilité** : Invoque `useNewUserBootstrap` dans l'arbre des providers.

**Comportement** :
- ✅ Invoque le hook `useNewUserBootstrap`
- ✅ Render transparent (retourne `children` sans modification)
- ✅ Doit être placé **après** `AuthContextProvider` dans l'arbre

**Code** :
```typescript
export function UserBootstrapWrapper({ children }: { children: ReactNode }) {
  useNewUserBootstrap();
  return <>{children}</>;
}
```

**Raison d'existence** : Les hooks ne peuvent pas être appelés au niveau top-level d'un Provider. Le wrapper permet d'injecter la logique du hook dans l'arbre des providers.

---

### 5. `AppProviders.tsx` - Intégration

**Responsabilité** : Composer tous les providers dans le bon ordre.

**Ordre critique** :
```typescript
<QueryClientProvider>
  <AuthRepositoryProvider>       {/* 1. Repository d'auth */}
    <AuthContextProvider>         {/* 2. Contexte auth centralisé */}
      <UserBootstrapWrapper>      {/* 3. Bootstrap nouveaux users */}
        <PromptRepositoryProvider>
        <VariableRepositoryProvider>
        {/* ... autres providers ... */}
          {children}
        </VariableRepositoryProvider>
        </PromptRepositoryProvider>
      </UserBootstrapWrapper>
    </AuthContextProvider>
  </AuthRepositoryProvider>
</QueryClientProvider>
```

**Règles** :
- `AuthContextProvider` doit être **avant** `UserBootstrapWrapper` (car le wrapper utilise `useAuth()`)
- `PromptRepositoryProvider` et `VariableRepositoryProvider` doivent être **avant** `UserBootstrapWrapper` (car le hook utilise ces repos)

---

### 6. `Header.tsx` - Consommateur avec loading

**Responsabilité** : Afficher un skeleton pendant le chargement de l'authentification.

**Comportement** :
- ✅ Récupère `{ user, loading }` depuis `useAuth()`
- ✅ Affiche skeleton si `loading === true`
- ✅ Affiche navigation authentifiée si `user !== null`
- ✅ Affiche boutons connexion/inscription si `user === null`

**Exemple** :
```typescript
export const Header = () => {
  const { user, loading } = useAuth();

  return (
    <header>
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : user ? (
        <AuthenticatedNav user={user} />
      ) : (
        <UnauthenticatedButtons />
      )}
    </header>
  );
};
```

**Impact** : Élimine le flash visuel entre états connecté/non-connecté pendant l'initialisation.

---

## 📊 Récapitulatif des 8 phases

| Phase | Objectif | Fichiers modifiés | Risque | Validation |
|-------|----------|-------------------|--------|------------|
| **Phase 1** | Créer `AuthContext` isolé | `src/contexts/AuthContext.tsx` | 0% | Contexte créé, pas encore intégré |
| **Phase 2** | Modifier `useAuth` avec fallback | `src/hooks/useAuth.tsx` | 5% | Hook détecte contexte disponible, sinon fallback legacy |
| **Phase 3** | Intégrer `AuthContextProvider` | `src/providers/AppProviders.tsx` | 10% | Contexte activé dans l'arbre des providers |
| **Phase 4** | Créer `useNewUserBootstrap` | `src/hooks/useNewUserBootstrap.ts` | 5% | Hook séparé pour bootstrap, pas encore invoqué |
| **Phase 5** | Créer `UserBootstrapWrapper` | `src/providers/UserBootstrapWrapper.tsx`<br>`src/providers/AppProviders.tsx` | 10% | Wrapper intégré, templates activés |
| **Phase 6** | Supprimer fallback legacy | `src/hooks/useAuth.tsx` | 15% | `useAuth` devient pure passthrough |
| **Phase 7** | Corriger `Header` avec `loading` | `src/components/Header.tsx` | 5% | Skeleton pendant chargement auth |
| **Phase 8** | Adapter les tests | `src/contexts/__tests__/AuthContext.test.tsx`<br>`src/hooks/__tests__/useNewUserBootstrap.test.tsx`<br>`src/hooks/__tests__/useAuth.test.tsx` | 5% | Tests reflètent nouvelle architecture |

**Total des risques cumulés** : 55% répartis sur 8 phases granulaires → Risque moyen par phase : ~7%

---

## 🧪 Patterns de tests

### Pattern 1 : Tester `AuthContext`

**Fichier** : `src/contexts/__tests__/AuthContext.test.tsx`

**Wrapper** :
```typescript
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthRepositoryProvider repository={mockAuthRepository}>
    <AuthContextProvider>{children}</AuthContextProvider>
  </AuthRepositoryProvider>
);
```

**Tests couverts** :
- ✅ Initialisation avec `loading: true`, `user: null`, `session: null`
- ✅ Setup du listener `onAuthStateChange` au montage
- ✅ Appel de `getCurrentSession` au montage
- ✅ Mise à jour de l'état lors de SIGNED_IN
- ✅ Mise à jour de l'état lors de SIGNED_OUT
- ✅ Chargement d'une session existante au montage
- ✅ Unsubscribe du listener au démontage
- ✅ Guard `isMounted` (pas d'update après unmount)
- ✅ Throw error si utilisé hors du provider

**Exemple de test** :
```typescript
it("should update state when auth state changes to SIGNED_IN", async () => {
  const { result } = renderHook(() => useAuthContext(), { wrapper });

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  authStateCallback("SIGNED_IN", mockSession);

  await waitFor(() => {
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
  });
});
```

---

### Pattern 2 : Tester `useNewUserBootstrap`

**Fichier** : `src/hooks/__tests__/useNewUserBootstrap.test.tsx`

**Wrapper complet** :
```typescript
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthRepositoryProvider repository={mockAuthRepository}>
    <AuthContextProvider>
      <PromptRepositoryProvider repository={mockPromptRepository}>
        <VariableRepositoryProvider repository={mockVariableRepository}>
          {children}
        </VariableRepositoryProvider>
      </PromptRepositoryProvider>
    </AuthContextProvider>
  </AuthRepositoryProvider>
);
```

**Tests couverts** :
- ✅ Ne fait rien si `loading === true`
- ✅ Ne fait rien si `user === null`
- ✅ Crée les templates pour un nouvel utilisateur
- ✅ Ne crée pas les templates si l'utilisateur a déjà des prompts
- ✅ Gère les erreurs de création gracieusement
- ✅ Évite les initialisations multiples (ref `hasInitialized`)
- ✅ Réinitialise si l'utilisateur change

**Exemple de test** :
```typescript
it("should create templates for a new user", async () => {
  vi.mocked(mockAuthRepository.getCurrentSession).mockResolvedValue(mockSession);

  renderHook(() => useNewUserBootstrap(), { wrapper });

  await waitFor(() => {
    expect(mockPromptRepository.fetchOwned).toHaveBeenCalledWith(mockUser.id);
  });

  await waitFor(
    () => {
      expect(mockPromptRepository.create).toHaveBeenCalled();
    },
    { timeout: 200 }
  );
});
```

---

### Pattern 3 : Tester `useAuth` (simplifié)

**Fichier** : `src/hooks/__tests__/useAuth.test.tsx`

**Tests couverts** :
- ✅ Retourne les valeurs du contexte (`user`, `session`, `loading`)
- ✅ Throw error si utilisé hors de `AuthContextProvider`

**Exemple de test** :
```typescript
it("should return auth context values", () => {
  const { result } = renderHook(() => useAuth(), { wrapper });

  expect(result.current.loading).toBeDefined();
  expect(result.current.user).toBeDefined();
  expect(result.current.session).toBeDefined();
});
```

**Note** : Les tests de template creation et de listener management ont été **déplacés** vers `AuthContext.test.tsx` et `useNewUserBootstrap.test.tsx`.

---

## ✅ Validation finale

### Checklist fonctionnelle

- [ ] **Connexion** : L'utilisateur peut se connecter sans flash visuel
- [ ] **Déconnexion** : L'utilisateur peut se déconnecter proprement
- [ ] **Rechargement de page** : La session persiste après F5
- [ ] **Création de compte** : Les templates sont créés automatiquement
- [ ] **Skeleton dans Header** : Un skeleton s'affiche pendant `loading === true`
- [ ] **Éditeur de prompts** : Plus de faux état read-only pendant l'init auth

### Checklist technique

- [ ] **Tests** : `npm run test` passe sans erreur
- [ ] **Couverture** : Couverture maintenue ou améliorée
- [ ] **Pas de duplication** : Un seul listener `onAuthStateChange` actif
- [ ] **Pas de memory leak** : Unsubscribe propre au démontage
- [ ] **Guard isMounted** : Pas d'update après unmount
- [ ] **Ordre des providers** : Respect de l'ordre critique dans `AppProviders`

---

## 🎯 Bénéfices de la migration

### Avant

❌ État auth dupliqué dans chaque composant utilisant `useAuth`  
❌ Multiples listeners `onAuthStateChange` actifs simultanément  
❌ Désynchronisation entre composants (Header vs Editor)  
❌ Flash visuel connecté → non-connecté → connecté pendant l'init  
❌ Faux états read-only dans l'éditeur de prompts  
❌ Tests complexes car chaque composant gère son propre état  
❌ Logique métier (templates) mélangée avec logique auth  

### Après

✅ État auth centralisé dans `AuthContext`  
✅ Un seul listener `onAuthStateChange` pour toute l'application  
✅ Synchronisation garantie entre tous les composants  
✅ Skeleton pendant chargement auth (plus de flash visuel)  
✅ Permissions calculées après chargement complet de l'auth  
✅ Tests isolés et simples (mock du contexte uniquement)  
✅ Séparation claire : auth (contexte) vs métier (hook bootstrap)  

---

## 📚 Références

- **Principe SOLID** : Single Responsibility Principle (SRP) - `AuthContext` ne gère que l'auth, `useNewUserBootstrap` gère le métier
- **Dependency Inversion Principle** : Injection de `AuthRepository` via contexte
- **React Context Best Practices** : Context avec `undefined` par défaut pour forcer vérification stricte
- **Testing Best Practices** : Mocks injectés via providers, tests isolés, un seul concept par test

---

## 🚀 Prochaines étapes (hors scope de cette migration)

1. **Ajouter des tests d'intégration** : Valider le flow complet connexion → bootstrap → navigation
2. **Monitoring** : Logger les événements auth pour déboguer en production
3. **Performance** : Analyser si `AuthContext` provoque des re-renders inutiles (optimisation avec `useMemo`)
4. **Accessibilité** : Ajouter des messages ARIA pendant le `loading` state

---

**Documentation créée le** : 2025-12-01  
**Version de l'architecture** : Phase 8 (finale)  
**Auteur** : Migration AuthContext Phase 1-8
