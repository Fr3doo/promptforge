import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { PromptRepositoryProvider } from "@/contexts/PromptRepositoryContext";
import { PromptMutationRepositoryProvider } from "@/contexts/PromptMutationRepositoryContext";
import { PromptQueryRepositoryProvider } from "@/contexts/PromptQueryRepositoryContext";
import { PromptCommandRepositoryProvider } from "@/contexts/PromptCommandRepositoryContext";
import { VariableRepositoryProvider } from "@/contexts/VariableRepositoryContext";
import { AnalysisRepositoryProvider } from "@/contexts/AnalysisRepositoryContext";
import { PromptShareRepositoryProvider } from "@/contexts/PromptShareRepositoryContext";
import { PromptFavoriteServiceProvider } from "@/contexts/PromptFavoriteServiceContext";
import { PromptVisibilityServiceProvider } from "@/contexts/PromptVisibilityServiceContext";
import { PromptDuplicationServiceProvider } from "@/contexts/PromptDuplicationServiceContext";
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
  authRepository,
  repository,
  variableRepository,
  analysisRepository,
  shareRepository,
  favoriteService,
  visibilityService,
  duplicationService
}: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthRepositoryProvider repository={authRepository}>
        <PromptRepositoryProvider repository={repository}>
          <PromptMutationRepositoryProvider>
            <PromptQueryRepositoryProvider>
              <PromptCommandRepositoryProvider>
                <VariableRepositoryProvider repository={variableRepository}>
                  <AnalysisRepositoryProvider repository={analysisRepository}>
                    <PromptShareRepositoryProvider repository={shareRepository}>
                      <PromptFavoriteServiceProvider service={favoriteService}>
                        <PromptVisibilityServiceProvider service={visibilityService}>
                          <PromptDuplicationServiceProvider service={duplicationService}>
                            {children}
                          </PromptDuplicationServiceProvider>
                        </PromptVisibilityServiceProvider>
                      </PromptFavoriteServiceProvider>
                    </PromptShareRepositoryProvider>
                  </AnalysisRepositoryProvider>
                </VariableRepositoryProvider>
              </PromptCommandRepositoryProvider>
            </PromptQueryRepositoryProvider>
          </PromptMutationRepositoryProvider>
        </PromptRepositoryProvider>
      </AuthRepositoryProvider>
    </ErrorBoundary>
  );
}
