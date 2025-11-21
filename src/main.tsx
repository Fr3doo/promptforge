import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PromptRepositoryProvider } from "./contexts/PromptRepositoryContext.tsx";
import { PromptQueryRepositoryProvider } from "./contexts/PromptQueryRepositoryContext.tsx";
import { PromptCommandRepositoryProvider } from "./contexts/PromptCommandRepositoryContext.tsx";
import { PromptMutationRepositoryProvider } from "./contexts/PromptMutationRepositoryContext.tsx";
import { VariableRepositoryProvider } from "./contexts/VariableRepositoryContext.tsx";
import { AnalysisRepositoryProvider } from "./contexts/AnalysisRepositoryContext.tsx";
import { PromptShareRepositoryProvider } from "./contexts/PromptShareRepositoryContext.tsx";
import { PromptFavoriteServiceProvider } from "./contexts/PromptFavoriteServiceContext.tsx";
import { PromptVisibilityServiceProvider } from "./contexts/PromptVisibilityServiceContext.tsx";
import { PromptDuplicationServiceProvider } from "./contexts/PromptDuplicationServiceContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

/**
 * Hiérarchie des providers (Phase 5 - ISP Compliance)
 * 
 * Niveau 1 : Repository racine (implémentation complète)
 *   └─ PromptRepositoryProvider (7 méthodes)
 * 
 * Niveau 2 : Interfaces ségrégées (ISP)
 *   ├─ PromptQueryRepositoryProvider (4 méthodes read)
 *   ├─ PromptCommandRepositoryProvider (3 méthodes write)
 *   └─ PromptMutationRepositoryProvider (1 méthode update)
 * 
 * Niveau 3 : Autres repositories
 *   ├─ VariableRepositoryProvider
 *   ├─ AnalysisRepositoryProvider
 *   └─ PromptShareRepositoryProvider
 * 
 * Niveau 4 : Services (consomment interfaces minimales)
 *   ├─ PromptFavoriteServiceProvider (Mutation uniquement)
 *   ├─ PromptVisibilityServiceProvider (Query + Mutation)
 *   └─ PromptDuplicationServiceProvider (Query + Command)
 */
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PromptRepositoryProvider>
      <PromptQueryRepositoryProvider>
        <PromptCommandRepositoryProvider>
          <PromptMutationRepositoryProvider>
            <VariableRepositoryProvider>
              <AnalysisRepositoryProvider>
                <PromptShareRepositoryProvider>
                  <PromptFavoriteServiceProvider>
                    <PromptVisibilityServiceProvider>
                      <PromptDuplicationServiceProvider>
                        <App />
                      </PromptDuplicationServiceProvider>
                    </PromptVisibilityServiceProvider>
                  </PromptFavoriteServiceProvider>
                </PromptShareRepositoryProvider>
              </AnalysisRepositoryProvider>
            </VariableRepositoryProvider>
          </PromptMutationRepositoryProvider>
        </PromptCommandRepositoryProvider>
      </PromptQueryRepositoryProvider>
    </PromptRepositoryProvider>
  </ErrorBoundary>
);
