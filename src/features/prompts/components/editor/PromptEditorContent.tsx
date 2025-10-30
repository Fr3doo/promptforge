import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { PromptContentEditor } from "@/features/prompts/components/PromptContentEditor";

/**
 * Content editor wrapper for prompt editor
 * Handles prompt content and variables
 */
export function PromptEditorContent() {
  const { form, canEdit } = usePromptEditorContext();
  
  return (
    <PromptContentEditor
      content={form.content}
      onContentChange={form.setContent}
      variables={form.variables}
      variableValues={form.variableValues}
      onVariableValuesChange={form.setVariableValues}
      onDetectVariables={form.detectVariables}
      onVariableUpdate={form.updateVariable}
      onVariableDelete={form.deleteVariable}
      disabled={!canEdit}
      errors={{
        content: form.validationErrors.content,
      }}
    />
  );
}
