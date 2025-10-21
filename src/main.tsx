import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PromptRepositoryProvider } from "./contexts/PromptRepositoryContext.tsx";
import { VariableRepositoryProvider } from "./contexts/VariableRepositoryContext.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PromptRepositoryProvider>
      <VariableRepositoryProvider>
        <App />
      </VariableRepositoryProvider>
    </PromptRepositoryProvider>
  </ErrorBoundary>
);
