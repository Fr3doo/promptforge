import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthRepositoryProvider } from "@/contexts/AuthRepositoryContext";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { UserBootstrapWrapper } from "./UserBootstrapWrapper";
import { ProfileRepositoryProvider } from "@/contexts/ProfileRepositoryContext";
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
import { PasswordCheckRepositoryProvider } from "@/contexts/PasswordCheckRepositoryContext";
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
 * <AppProviders queryRepository={mockQueryRepo} commandRepository={mockCommandRepo}>
 *   <ComponentToTest />
 * </AppProviders>
 * ```
 */
export function AppProviders({ 
  children, 
  authRepository,
  profileRepository,
  queryRepository,
  commandRepository,
  mutationRepository,
  variableRepository,
  analysisRepository,
  shareRepository,
  favoriteService,
  visibilityService,
  duplicationService,
  usageRepository,
  passwordCheckRepository
}: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthRepositoryProvider repository={authRepository}>
        <PasswordCheckRepositoryProvider repository={passwordCheckRepository}>
          <AuthContextProvider>
            <ProfileRepositoryProvider repository={profileRepository}>
              <VariableRepositoryProvider repository={variableRepository}>
                <PromptMutationRepositoryProvider repository={mutationRepository}>
                  <PromptQueryRepositoryProvider repository={queryRepository}>
                    <PromptCommandRepositoryProvider repository={commandRepository}>
                      {/* UserBootstrapWrapper AFTER Query/Command providers for useNewUserBootstrap access */}
                      <UserBootstrapWrapper>
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
                      </UserBootstrapWrapper>
                    </PromptCommandRepositoryProvider>
                  </PromptQueryRepositoryProvider>
                </PromptMutationRepositoryProvider>
              </VariableRepositoryProvider>
            </ProfileRepositoryProvider>
          </AuthContextProvider>
        </PasswordCheckRepositoryProvider>
      </AuthRepositoryProvider>
    </ErrorBoundary>
  );
}
