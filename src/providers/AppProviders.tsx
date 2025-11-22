import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { AppProvidersProps } from "./AppProviders.types";

/**
 * Composant central regroupant tous les Context Providers de l'application
 * 
 * Simplifie main.tsx en centralisant les 10+ niveaux de providers imbriqués
 * Permet l'injection de dépendances pour les tests via props optionnelles
 * 
 * @example
 * ```tsx
 * // Production
 * <AppProviders>
 *   <App />
 * </AppProviders>
 * 
 * // Tests avec mocks
 * <AppProviders repository={mockRepository}>
 *   <ComponentToTest />
 * </AppProviders>
 * ```
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
