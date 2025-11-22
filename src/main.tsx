import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PromptRepositoryProvider } from "./contexts/PromptRepositoryContext.tsx";
import { PromptMutationRepositoryProvider } from "./contexts/PromptMutationRepositoryContext.tsx";
import { VariableRepositoryProvider } from "./contexts/VariableRepositoryContext.tsx";
import { AnalysisRepositoryProvider } from "./contexts/AnalysisRepositoryContext.tsx";
import { PromptShareRepositoryProvider } from "./contexts/PromptShareRepositoryContext.tsx";
import { PromptFavoriteServiceProvider } from "./contexts/PromptFavoriteServiceContext.tsx";
import { PromptVisibilityServiceProvider } from "./contexts/PromptVisibilityServiceContext.tsx";
import { PromptDuplicationServiceProvider } from "./contexts/PromptDuplicationServiceContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PromptRepositoryProvider>
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
    </PromptRepositoryProvider>
  </ErrorBoundary>
);
