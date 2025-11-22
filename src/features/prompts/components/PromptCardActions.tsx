import { FavoriteButton } from "./FavoriteButton";
import { PromptActionsMenu } from "./PromptActionsMenu";
import type { PromptCardActionsProps } from "./PromptCardActions.types";

/**
 * Composant qui regroupe toutes les actions disponibles sur une carte de prompt
 * (bouton favori + menu d'actions)
 */
export const PromptCardActions = ({
  prompt,
  isOwner,
  onToggleFavorite,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onEdit,
  onManageSharing,
}: PromptCardActionsProps) => {
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(prompt.id, prompt.is_favorite || false);
  };

  const handleEdit = () => {
    onEdit(prompt.id);
  };

  const handleDuplicate = () => {
    onDuplicate(prompt.id);
  };

  const handleToggleVisibility = async () => {
    await onToggleVisibility(
      prompt.id,
      prompt.visibility || "PRIVATE",
      prompt.public_permission
    );
  };

  const handleDelete = () => {
    onDelete(prompt.id);
  };

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <FavoriteButton
        isFavorite={prompt.is_favorite || false}
        onToggle={handleToggleFavorite}
      />
      {isOwner && (
        <PromptActionsMenu
          isShared={prompt.visibility === "SHARED"}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onManageSharing={onManageSharing}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
