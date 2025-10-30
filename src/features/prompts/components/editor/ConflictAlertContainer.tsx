import { ConflictAlert } from "@/components/ConflictAlert";
import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";

/**
 * Container component for conflict detection alert
 * Displays alert when concurrent edit is detected
 */
export function ConflictAlertContainer() {
  const { hasConflict, serverUpdatedAt, handleRefreshPrompt, resetConflict } = usePromptEditorContext();
  
  if (!hasConflict || !serverUpdatedAt) {
    return null;
  }
  
  return (
    <ConflictAlert 
      serverUpdatedAt={serverUpdatedAt}
      onRefresh={handleRefreshPrompt}
      onDismiss={resetConflict}
    />
  );
}
