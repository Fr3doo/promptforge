import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PromptRepositoryProvider } from "./contexts/PromptRepositoryContext.tsx";
import { VariableRepositoryProvider } from "./contexts/VariableRepositoryContext.tsx";
import { AnalysisRepositoryProvider } from "./contexts/AnalysisRepositoryContext.tsx";
import { PromptShareRepositoryProvider } from "./contexts/PromptShareRepositoryContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PromptRepositoryProvider>
      <VariableRepositoryProvider>
        <AnalysisRepositoryProvider>
          <PromptShareRepositoryProvider>
            <App />
          </PromptShareRepositoryProvider>
        </AnalysisRepositoryProvider>
      </VariableRepositoryProvider>
    </PromptRepositoryProvider>
  </ErrorBoundary>
);
