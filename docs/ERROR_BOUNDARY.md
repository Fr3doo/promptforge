# Error Boundary - Gestion Globale des Erreurs

## Vue d'ensemble

L'Error Boundary est un composant React qui capture les erreurs runtime dans l'arbre des composants et affiche une interface de secours conviviale au lieu de faire planter toute l'application.

## Architecture

```
┌─────────────────────────────────────────┐
│           ErrorBoundary                  │
│  ┌───────────────────────────────────┐  │
│  │  Capture des erreurs runtime      │  │
│  │  - componentDidCatch()            │  │
│  │  - getDerivedStateFromError()     │  │
│  └───────────────────────────────────┘  │
│              │                           │
│              ├──> Logging console (dev)  │
│              ├──> Logging service (prod) │
│              └──> Affichage ErrorFallback│
└─────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │    ErrorFallback        │
         │  ┌──────────────────┐  │
         │  │ Actions utilisateur│  │
         │  │ - Réessayer       │  │
         │  │ - Retour accueil  │  │
         │  │ - Détails tech    │  │
         │  └──────────────────┘  │
         └────────────────────────┘
```

## Composants

### ErrorBoundary

**Fichier**: `src/components/ErrorBoundary.tsx`

Composant de classe React qui implémente les méthodes lifecycle pour capturer les erreurs.

**Méthodes clés:**

1. **`getDerivedStateFromError(error)`**
   - Appelée après qu'une erreur ait été lancée par un composant descendant
   - Permet de mettre à jour l'état pour afficher l'UI de secours
   - Exécutée pendant la phase "render"

2. **`componentDidCatch(error, errorInfo)`**
   - Appelée après qu'une erreur ait été lancée
   - Permet de logger l'erreur
   - Exécutée pendant la phase "commit"

3. **`handleReset()`**
   - Réinitialise l'état de l'error boundary
   - Permet de retenter le rendu des composants

**État géré:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;      // Indique si une erreur a été capturée
  error: Error | null;    // L'erreur capturée
  errorInfo: ErrorInfo | null;  // Informations sur la stack des composants
}
```

### ErrorFallback

**Fichier**: `src/components/ErrorFallback.tsx`

Interface utilisateur affichée lorsqu'une erreur est capturée.

**Fonctionnalités:**

- ✅ Message d'erreur convivial
- ✅ Actions utilisateur (réessayer, retour accueil)
- ✅ Détails techniques (en développement uniquement)
- ✅ Design responsive avec composants shadcn/ui
- ⏳ Report d'erreur (fonctionnalité future)

**Structure:**
```tsx
<Card>
  <CardHeader>
    <Icon AlertTriangle />
    <Title>Une erreur est survenue</Title>
  </CardHeader>
  
  <CardContent>
    <Alert>Message d'erreur</Alert>
    <Actions suggérées />
    <Collapsible>Détails techniques</Collapsible>
  </CardContent>
  
  <CardFooter>
    <Button>Réessayer</Button>
    <Button>Accueil</Button>
  </CardFooter>
</Card>
```

## Intégration

L'Error Boundary est intégrée au niveau le plus haut de l'application dans `src/main.tsx`:

```tsx
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PromptRepositoryProvider>
      <VariableRepositoryProvider>
        <App />
      </VariableRepositoryProvider>
    </PromptRepositoryProvider>
  </ErrorBoundary>
);
```

**Avantages de ce placement:**
- Capture toutes les erreurs de l'application
- Protège les providers de contexte
- Empêche le crash complet de l'application

## Logging des erreurs

### En développement

Les erreurs sont loguées dans la console avec:
- Message d'erreur
- Stack trace complète
- Component stack (arbre des composants)

```javascript
console.group('🔴 Error Boundary Caught an Error');
console.error('Error:', error);
console.error('Error Info:', errorInfo);
console.error('Component Stack:', errorInfo.componentStack);
console.groupEnd();
```

### En production (à implémenter)

Le code inclut des placeholders pour intégrer des services de monitoring:

```typescript
// Exemple avec Sentry
Sentry.captureException(error, {
  contexts: {
    react: {
      componentStack: errorInfo.componentStack,
    },
  },
});

// Exemple avec API custom
fetch('/api/log-error', {
  method: 'POST',
  body: JSON.stringify({
    error: error.toString(),
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }),
});
```

## Cas d'usage

### Erreurs capturées

L'Error Boundary capture les erreurs qui se produisent:
- ✅ Pendant le rendu des composants
- ✅ Dans les méthodes lifecycle
- ✅ Dans les constructeurs de composants enfants

### Erreurs NON capturées

L'Error Boundary ne capture **PAS**:
- ❌ Erreurs dans les event handlers (onClick, onChange, etc.)
- ❌ Erreurs asynchrones (setTimeout, promises)
- ❌ Erreurs dans le Server-Side Rendering
- ❌ Erreurs dans l'Error Boundary lui-même

**Solution pour les erreurs non capturées:**
```typescript
// Event handlers - utiliser try/catch
const handleClick = () => {
  try {
    riskyOperation();
  } catch (error) {
    // Gérer l'erreur manuellement
    toast.error(getSafeErrorMessage(error));
  }
};

// Promises - utiliser .catch() ou try/catch avec async/await
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    // Gérer l'erreur
    notifyError("Erreur", getSafeErrorMessage(error));
  }
}
```

## Testing

### Test manuel

Pour tester l'Error Boundary en développement:

```tsx
// Créer un composant de test qui lance une erreur
function ThrowError() {
  throw new Error("Test error boundary");
}

// L'utiliser temporairement dans l'app
<ErrorBoundary>
  <ThrowError />
</ErrorBoundary>
```

### Test automatisé

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('should catch errors and display fallback', () => {
    // Supprimer les logs d'erreur en test
    const spy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/une erreur est survenue/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    
    spy.mockRestore();
  });
  
  it('should reset error state on retry', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const retryButton = screen.getByRole('button', { name: /réessayer/i });
    fireEvent.click(retryButton);
    
    // Vérifier que l'état est réinitialisé
    expect(screen.queryByText(/une erreur est survenue/i)).not.toBeInTheDocument();
    
    spy.mockRestore();
  });
});
```

## Bonnes pratiques

### 1. Granularité des Error Boundaries

Considérer d'ajouter des Error Boundaries plus spécifiques pour certaines parties de l'application:

```tsx
// Error boundary globale (déjà en place)
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Error boundaries locales pour features critiques
function PromptEditor() {
  return (
    <ErrorBoundary fallback={<PromptEditorError />}>
      <PromptEditorContent />
    </ErrorBoundary>
  );
}
```

**Avantages:**
- Isolation des erreurs (une feature qui crash n'affecte pas les autres)
- Messages d'erreur plus contextuels
- Possibilité de continuer à utiliser le reste de l'app

### 2. Logging structuré

Enrichir les logs avec du contexte:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getCurrentUserId(), // Si disponible
    environment: import.meta.env.MODE,
  };
  
  logToService(errorLog);
}
```

### 3. Recovery strategies

Implémenter des stratégies de récupération intelligentes:

```tsx
class SmartErrorBoundary extends ErrorBoundary {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    super.componentDidCatch(error, errorInfo);
    
    // Stratégie 1: Retry automatique pour erreurs réseau
    if (isNetworkError(error)) {
      setTimeout(() => this.handleReset(), 3000);
    }
    
    // Stratégie 2: Clear cache pour erreurs de données corrompues
    if (isDataCorruptionError(error)) {
      clearCache();
      this.handleReset();
    }
  }
}
```

### 4. User feedback

Collecter des retours utilisateur:

```tsx
function ErrorFallback({ error }: ErrorFallbackProps) {
  const [feedback, setFeedback] = useState('');
  
  const handleSubmitFeedback = async () => {
    await submitErrorReport({
      error: error?.message,
      userFeedback: feedback,
      timestamp: Date.now(),
    });
    toast.success('Merci pour votre retour');
  };
  
  return (
    <Card>
      {/* ... */}
      <Textarea
        placeholder="Que faisiez-vous quand l'erreur s'est produite ?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <Button onClick={handleSubmitFeedback}>
        Envoyer le rapport
      </Button>
    </Card>
  );
}
```

## Évolutions futures

- [ ] Intégration Sentry ou autre service de monitoring
- [ ] Error Boundaries locales pour features critiques
- [ ] Système de rapport d'erreur utilisateur
- [ ] Retry automatique pour erreurs transitoires
- [ ] Analytics sur les erreurs fréquentes
- [ ] A/B testing sur les messages d'erreur

## Références

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling in React](https://react.dev/learn/error-boundaries)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
