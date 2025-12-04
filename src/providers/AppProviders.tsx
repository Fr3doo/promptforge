import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { UserBootstrapWrapper } from "./UserBootstrapWrapper";
import { ProfileRepositoryProvider } from "@/contexts/ProfileRepositoryContext";
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
import { VersionRepositoryProvider } from "@/contexts/VersionRepositoryContext";
import { EdgeFunctionRepositoryProvider } from "@/contexts/EdgeFunctionRepositoryContext";
import { PromptUsageRepositoryProvider } from "@/contexts/PromptUsageRepositoryContext";
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
  profileRepository,
  repository,
  commandRepository,
  mutationRepository,
  variableRepository,
  analysisRepository,
  shareRepository,
  favoriteService,
  visibilityService,
  duplicationService,
  usageRepository
}: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthRepositoryProvider repository={authRepository}>
        <AuthContextProvider>
          <ProfileRepositoryProvider repository={profileRepository}>
            <PromptRepositoryProvider repository={repository}>
              <VariableRepositoryProvider repository={variableRepository}>
                <UserBootstrapWrapper>
                  <PromptMutationRepositoryProvider repository={mutationRepository}>
                    <PromptQueryRepositoryProvider>
                      <PromptCommandRepositoryProvider repository={commandRepository}>
                        <VersionRepositoryProvider>
                          <EdgeFunctionRepositoryProvider>
                            <PromptUsageRepositoryProvider repository={usageRepository}>
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
                            </PromptUsageRepositoryProvider>
                          </EdgeFunctionRepositoryProvider>
                        </VersionRepositoryProvider>
                      </PromptCommandRepositoryProvider>
                    </PromptQueryRepositoryProvider>
                  </PromptMutationRepositoryProvider>
                </UserBootstrapWrapper>
              </VariableRepositoryProvider>
            </PromptRepositoryProvider>
          </ProfileRepositoryProvider>
        </AuthContextProvider>
      </AuthRepositoryProvider>
    </ErrorBoundary>
  );
}
