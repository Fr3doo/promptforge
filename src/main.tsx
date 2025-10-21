import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PromptRepositoryProvider } from "./contexts/PromptRepositoryContext.tsx";
import { VariableRepositoryProvider } from "./contexts/VariableRepositoryContext.tsx";

createRoot(document.getElementById("root")!).render(
  <PromptRepositoryProvider>
    <VariableRepositoryProvider>
      <App />
    </VariableRepositoryProvider>
  </PromptRepositoryProvider>
);
