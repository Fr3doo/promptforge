import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PromptRepositoryProvider } from "@/contexts/PromptRepositoryContext";
import { PromptMutationRepositoryProvider } from "@/contexts/PromptMutationRepositoryContext";
import { PromptQueryRepositoryProvider } from "@/contexts/PromptQueryRepositoryContext";
import { PromptCommandRepositoryProvider } from "@/contexts/PromptCommandRepositoryContext";
import { VariableRepositoryProvider } from "@/contexts/VariableRepositoryContext";
import { AnalysisRepositoryProvider } from "@/contexts/AnalysisRepositoryContext";
import { PromptShareRepositoryProvider } from "@/contexts/PromptShareRepositoryContext";
import { PromptFavoriteServiceProvider } from "@/contexts/PromptFavoriteServiceContext";
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
export function AppProviders({ 
  children, 
  repository,
  variableRepository,
  analysisRepository,
  shareRepository,
  favoriteService
}: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <PromptRepositoryProvider repository={repository}>
        <PromptMutationRepositoryProvider>
          <PromptQueryRepositoryProvider>
            <PromptCommandRepositoryProvider>
              <VariableRepositoryProvider repository={variableRepository}>
                <AnalysisRepositoryProvider repository={analysisRepository}>
                  <PromptShareRepositoryProvider repository={shareRepository}>
                    <PromptFavoriteServiceProvider service={favoriteService}>
                      {children}
                    </PromptFavoriteServiceProvider>
                  </PromptShareRepositoryProvider>
                </AnalysisRepositoryProvider>
              </VariableRepositoryProvider>
            </PromptCommandRepositoryProvider>
          </PromptQueryRepositoryProvider>
        </PromptMutationRepositoryProvider>
      </PromptRepositoryProvider>
    </ErrorBoundary>
  );
}
