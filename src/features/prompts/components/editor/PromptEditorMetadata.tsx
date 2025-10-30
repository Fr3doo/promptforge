import { usePromptEditorContext } from "@/features/prompts/contexts/PromptEditorContext";
import { PromptMetadataForm } from "@/features/prompts/components/PromptMetadataForm";

/**
 * Metadata form wrapper for prompt editor
 * Handles title, description, and tags
 */
export function PromptEditorMetadata() {
  const { form, canEdit, isEditMode } = usePromptEditorContext();
  
  return (
    <PromptMetadataForm
      title={form.title}
      onTitleChange={form.setTitle}
      description={form.description}
      onDescriptionChange={form.setDescription}
      initialTags={form.tags}
      onTagsChange={form.setTags}
      isEditMode={isEditMode}
      disabled={!canEdit}
      errors={{
        title: form.validationErrors.title,
        description: form.validationErrors.description,
        tags: form.validationErrors.tags,
      }}
    />
  );
}
